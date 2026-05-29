// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { HttpService } from "@open-pioneer/http";
import { SearchSource, SearchResult, SearchOptions } from "@open-pioneer/search";
import GeoJSON from "ol/format/GeoJSON";

interface PhotonResponseFeature {
    geometry: unknown; // geojson
    properties: {
        osm_id: number;
        osm_value: string;
        name: string;
        city: string;
        postcode: string;
        country: string;
        type: string;
    };
}

interface PhotonResponse {
    features: PhotonResponseFeature[];
}

/**
 * Configuration options for the {@link PhotonGeocoder}.
 */
export interface PhotonGeocoderOptions {
    /**
     * The display label shown in the search UI for this source.
     */
    label: string;

    /**
     * A list of Photon feature types to include in results (e.g. `["city", "street", "house"]`).
     * Features whose `type` property is not in this list are filtered out.
     */
    filteredTypes: string[];

    /**
     * The {@link HttpService} used to perform HTTP requests.
     */
    httpService: HttpService;

    /**
     * The language code passed to the Photon API (default: `"de"`).
     */
    lang?: string;

    /**
     * Latitude for result-ranking bias (default: `51.961563` – Münster, Germany).
     */
    lat?: number;

    /**
     * Longitude for result-ranking bias (default: `7.628202` – Münster, Germany).
     */
    lon?: number;

    /**
     * Maximum number of raw results fetched from the API (default: `100`).
     */
    limit?: number;
}

/**
 * A search source that queries the [Photon Geocoder](https://photon.komoot.io/) service
 * and integrates it with the Open Pioneer `@open-pioneer/search` API.
 *
 * @example
 * ```ts
 * const geocoder = new PhotonGeocoder({
 *     label: "Address search",
 *     filteredTypes: ["house", "street", "city"],
 *     httpService,
 * });
 * ```
 */
export class PhotonGeocoder implements SearchSource {
    readonly label: string;

    private readonly filteredTypes: string[];
    private readonly httpService: HttpService;
    private readonly lang: string;
    private readonly lat: number;
    private readonly lon: number;
    private readonly limit: number;

    constructor(options: PhotonGeocoderOptions) {
        this.label = options.label;
        this.filteredTypes = options.filteredTypes;
        this.httpService = options.httpService;
        this.lang = options.lang ?? "de";
        this.lat = options.lat ?? 51.961563;
        this.lon = options.lon ?? 7.628202;
        this.limit = options.limit ?? 100;
    }

    async search(
        inputValue: string,
        { mapProjection, signal }: SearchOptions
    ): Promise<SearchResult[]> {
        const response = await this.request(inputValue, signal);
        const geojson = new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: mapProjection
        });

        return response.features
            .filter((feature: PhotonResponseFeature) =>
                this.filteredTypes.includes(feature.properties.type)
            )
            .map((feature: PhotonResponseFeature, idx: number): SearchResult => {
                const geometry = geojson.readGeometry(feature.geometry);
                return {
                    id: feature.properties.osm_id || idx,
                    label: this.createLabel(feature),
                    geometry: geometry,
                    properties: feature.properties
                };
            });
    }

    private async request(
        inputValue: string,
        signal?: AbortSignal | undefined
    ): Promise<PhotonResponse> {
        const url = new URL("https://photon.komoot.io/api?");
        url.searchParams.set("q", inputValue);
        url.searchParams.set("lang", this.lang);
        url.searchParams.set("lat", this.lat.toString());
        url.searchParams.set("lon", this.lon.toString());
        url.searchParams.set("limit", this.limit.toString());

        const response = await this.httpService.fetch(url, { signal });
        if (!response.ok) {
            throw new Error("Request failed: " + response.status);
        }
        const result = (await response.json()) as PhotonResponse;
        return result;
    }

    private createLabel(feature: PhotonResponseFeature): string {
        const { name, postcode, city, country } = feature.properties;
        const parts = [postcode, city, country].filter(Boolean).join(", ");
        return parts ? `${name} (${parts})` : name;
    }
}
