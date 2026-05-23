// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { createLogger, isAbortError } from "@open-pioneer/core";
import { bbox } from "ol/loadingstrategy";
import VectorSource from "ol/source/Vector";
import { OverpassApiVectorSourceOptions } from "./api";
import { HttpService } from "@open-pioneer/http";
import { FeatureLoader } from "ol/featureloader";
import OSMXML from "ol/format/OSMXML";
import { ProjectionLike, transformExtent as olTransformExtent } from "ol/proj";
import FeatureFormat from "ol/format/Feature";
import { FeatureLike } from "ol/Feature";
import { createRequestUrl, loadFeatures, queryFeatures } from "./requestUtils";
import { Extent } from "ol/extent";

const LOG = createLogger("overpass-api:OverpassApiSourceFactory");
const DEFAULT_TIMEOUT = 25;

/**
 * This function creates an OpenLayers VectorSource for Overpass API services to be used inside
 * an OpenLayers VectorLayer.
 *
 * @param options Options for the vector source.
 * @param httpService Reference to httpService for fetching the features from the service.
 */
export function createVectorSource(
    options: OverpassApiVectorSourceOptions,
    httpService: HttpService
): VectorSource {
    return _createVectorSource(options, { httpService });
}

/**
 * @internal
 * Exported for tests.
 */
export interface InternalOptions {
    httpService: HttpService;
    queryFeaturesParam?: QueryFeaturesFunc | undefined;
    addFeaturesParam?: AddFeaturesFunc | undefined;
}

/** @internal */
export interface LoadFeatureOptions {
    url: URL;
    httpService: HttpService;
    featureFormat: FeatureFormat;
    mapProjection: ProjectionLike;
    signal: AbortSignal;
    queryFeatures: QueryFeaturesFunc;
    addFeatures: AddFeaturesFunc;
}

/** @internal */
type QueryFeaturesFunc = typeof queryFeatures;

/** @internal */
type AddFeaturesFunc = (features: FeatureLike[]) => void;

/**
 * @internal
 * Creates the actual vector source.
 * Exported for tests.
 * Exposes `queryFeatures` and `addFeatures` for easier testing.
 */
export function _createVectorSource(
    options: OverpassApiVectorSourceOptions,
    internals: InternalOptions
): VectorSource {
    const { additionalOptions, baseUrl, mapProjection, query, timeout, rewriteUrl } = options;
    const httpService = internals.httpService;

    const vectorSrc = new VectorSource({
        format: new OSMXML(),
        strategy: bbox,
        ...additionalOptions
    });

    const queryFeaturesFunc = internals.queryFeaturesParam ?? queryFeatures;
    const addFeaturesFunc = internals.addFeaturesParam ?? defaultAddFeatures;

    function defaultAddFeatures(features: FeatureLike[]): void {
        LOG.debug(`Adding ${features.length} features`);
        // FeatureLike is intentionally widened to Feature<Geometry> here;
        // OL's addFeatures signature is narrower than its runtime behaviour.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vectorSrc.addFeatures(features as any);
    }

    /**
     * Cancelled whenever the map extent changes, so stale requests don't
     * block rendering for the new viewport.
     */
    let pendingRequest: AbortController;

    const loaderFunction: FeatureLoader = async (
        extent,
        _resolution,
        _projection,
        success,
        failure
    ): Promise<FeatureLike[]> => {
        pendingRequest?.abort("Extent changed");
        pendingRequest = new AbortController();

        const overpassBbox = toOverpassBbox(extent, mapProjection);
        const url = createRequestUrl(
            baseUrl,
            timeout ?? DEFAULT_TIMEOUT,
            query,
            overpassBbox,
            rewriteUrl
        );

        try {
            const features = await loadFeatures({
                url: url,
                httpService: httpService,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                featureFormat: vectorSrc.getFormat()!,
                mapProjection,
                signal: pendingRequest.signal,
                queryFeatures: queryFeaturesFunc,
                addFeatures: addFeaturesFunc
            });

            // See defaultAddFeatures for the widening rationale.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            success?.(features as any);
            LOG.debug("Finished loading features for extent:", extent);
            return features as unknown as FeatureLike[];
        } catch (error) {
            if (isAbortError(error)) {
                LOG.debug("Request aborted", error);
                vectorSrc.removeLoadedExtent(extent);
                failure?.();
            } else {
                LOG.error("Failed to load features", error);
            }
            return [];
        }
    };

    vectorSrc.setLoader(loaderFunction);
    return vectorSrc;
}

/**
 * @internal
 * Reprojects `extent` from the map projection to EPSG:4326 and reorders
 * the coordinates into Overpass API's [minLat, minLon, maxLat, maxLon] order.
 *
 * OpenLayers uses [lon, lat] internally, so after reprojection the values are:
 *   [minLon, minLat, maxLon, maxLat]
 * Overpass expects the opposite axis order:
 *   [minLat, minLon, maxLat, maxLon]
 *
 * @see https://openlayers.org/doc/faq.html (coordinate order)
 */
export function toOverpassBbox(extent: Extent, sourceProjection: ProjectionLike) {
    const bbox = olTransformExtent(extent, sourceProjection, "EPSG:4326");

    const minX = bbox[1] as number;
    const minY = bbox[0] as number;
    const maxX = bbox[3] as number;
    const maxY = bbox[2] as number;

    return [minX, minY, maxX, maxY];
}
