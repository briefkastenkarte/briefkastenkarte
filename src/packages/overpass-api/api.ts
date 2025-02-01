// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { DeclaredService } from "@open-pioneer/runtime";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { AttributionLike } from "ol/source/Source";
import VectorSource, { Options } from "ol/source/Vector";

/**
 * These are properties for Overpass API vector source.
 */
export interface OverpassApiVectorSourceOptions {
    /**
     * The base-URL to an Overpass API instance (e.g. `https://overpass-api.de/api/interpreter`).
     */
    baseUrl: string;

    /**
     * Request delay (in milliseconds) before the async query starts.
     * Defaults to `25`.
     */
    timeout?: number;

    /**
     * Overpass API query part (e.g. `node[amenity=post_box];`).
     */
    query: string;

    /**
     * Optional attribution for the layer (e.g. copyright hints).
     */
    attributions?: AttributionLike | undefined;

    /**
     * Optional additional options for the VectorSource.
     */
    additionalOptions?: Options<Feature<Geometry>>;

    /**
     * Use this function to rewrite the URL used to fetch features from an Overpass API service.
     *
     * NOTE: Do not update the `url` argument. Return a new `URL` instance instead.
     *
     * NOTE: Be careful with existing URL parameters. The vector source may not work correctly if
     * predefined parameters are overwritten.
     * The vector source might add additional parameters to its request URLs in the future.
     */
    rewriteUrl?: (url: URL) => URL | undefined;
}

/**
 * A factory that creates {@link VectorSource | vector sources} for an Overpass API service.
 * The resulting vector sources can be used in an OpenLayers `VectorLayer`.
 *
 * Use the interface name `"overpass-api.VectorSourceFactory"` to obtain an instance of this factory.
 */
export interface OverpassApiVectorSourceFactory
    extends DeclaredService<"overpass-api.VectorSourceFactory"> {
    /**
     * Creates a new {@link VectorSource} that loads features from the specified feature service.
     */
    createVectorSource(options: OverpassApiVectorSourceOptions): VectorSource;
}
