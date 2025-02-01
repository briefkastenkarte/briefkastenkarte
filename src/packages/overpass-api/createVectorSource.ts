// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { createLogger, isAbortError } from "@open-pioneer/core";
import { bbox } from "ol/loadingstrategy";
import VectorSource from "ol/source/Vector";
import { OverpassApiVectorSourceOptions } from "./api";
import { HttpService } from "@open-pioneer/http";
import { FeatureLoader } from "ol/featureloader";
import OSMXML from "ol/format/OSMXML";
import { transformExtent } from "ol/proj";
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
    const { additionalOptions, attributions, baseUrl, query, timeout, rewriteUrl } = options;

    const httpService = internals.httpService;

    const vectorSrc = new VectorSource({
        format: new OSMXML(),
        strategy: bbox,
        attributions: attributions,
        ...additionalOptions
    });

    const queryFeaturesFunc = internals.queryFeaturesParam ?? queryFeatures;

    const addFeaturesFunc =
        internals.addFeaturesParam ||
        function (features: FeatureLike[]) {
            LOG.debug(`Adding ${features.length} features`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vectorSrc.addFeatures(features as any);
        };

    /**
     * Abort controller for the currently pending request(s).
     * Used to cancel outdated requests.
     */
    let abortController: AbortController;

    const loaderFunction: FeatureLoader = async (
        extent,
        _,
        __,
        success,
        failure
    ): Promise<void> => {
        const bbox = transformExtent(extent, "EPSG:25832", "EPSG:4326");
        const newExtent = [bbox[1], bbox[0], bbox[3], bbox[2]] as Extent;

        const url = createRequestUrl(
            baseUrl,
            timeout ?? DEFAULT_TIMEOUT,
            query,
            newExtent,
            rewriteUrl
        );

        /**
         * An extent-change should cancel open requests for older extents, because otherwise,
         * old and expensive requests could block new requests for a new extent
         *
         * => no features are drawn on the current map for a long time.
         */
        abortController?.abort("Extent changed");
        abortController = new AbortController();

        try {
            const features = await loadFeatures({
                url: url,
                httpService: httpService,
                featureFormat: vectorSrc.getFormat()!,
                signal: abortController.signal,
                queryFeatures: queryFeaturesFunc,
                addFeatures: addFeaturesFunc
            });

            // Type mismatch FeatureLike <--> Feature<Geometry>
            // MIGHT be incorrect! We will see.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            success?.(features as any);
            LOG.debug("Finished loading features for extent:", extent);
        } catch (error) {
            if (!isAbortError(error)) {
                LOG.error("Failed to load features", error);
            } else {
                LOG.debug("Request aborted", error);
                vectorSrc.removeLoadedExtent(extent);
                failure?.();
            }
        }
    };

    vectorSrc.setLoader(loaderFunction);
    return vectorSrc;
}

/** @internal **/
type QueryFeaturesFunc = typeof queryFeatures;

/** @internal **/
type AddFeaturesFunc = (features: FeatureLike[]) => void;

/** @internal **/
export interface LoadFeatureOptions {
    url: URL;
    httpService: HttpService;
    featureFormat: FeatureFormat;
    signal: AbortSignal;
    queryFeatures: QueryFeaturesFunc;
    addFeatures: AddFeaturesFunc;
}
