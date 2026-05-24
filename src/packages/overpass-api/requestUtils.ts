// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Extent } from "ol/extent";
import { LoadFeatureOptions } from "./createVectorSource";
import { FeatureLike } from "ol/Feature";
import { HttpService } from "@open-pioneer/http";
import FeatureFormat from "ol/format/Feature";
import { ProjectionLike } from "ol/proj";
import { requestLimiter } from "./requestLimiter";

/**
 * @internal
 * Builds the Overpass QL query string that is sent as the POST body `data` field.
 */
export function buildQueryBody(timeout: number, query: string, extent: Extent): string {
    return `[bbox:${extent.join(",")}][out:xml][timeout:${timeout}];(${query});out;>;out skel qt;`;
}

/**
 * @internal
 * Returns the bare endpoint URL and the query body string separately.
 * The query must be sent as a POST body — not embedded in the URL — to avoid
 * the 429 Too Many Requests that Overpass applies more aggressively to GET requests.
 */
export function createRequestUrl(
    baseUrl: string,
    timeout: number,
    query: string,
    extent: Extent,
    rewriteUrl?: (url: URL) => URL | undefined
): { url: URL; body: string } {
    const urlObj = rewriteUrl?.(new URL(baseUrl)) ?? new URL(baseUrl);
    const body = buildQueryBody(timeout, query, extent);
    return { url: urlObj, body };
}

/**
 * @internal
 * Fetches features.
 */
export async function loadFeatures(options: LoadFeatureOptions): Promise<FeatureResponse> {
    const { url, httpService, featureFormat, signal, mapProjection, queryFeatures, addFeatures } =
        options;

    const featureResponse = await queryFeatures(
        url,
        httpService,
        featureFormat,
        mapProjection,
        signal
    );

    const features = featureResponse.features as FeatureLike[];
    addFeatures(features);

    return featureResponse;
}

/**
 * Performs a single POST request against the Overpass API.
 *
 * Using POST instead of GET avoids the stricter 429 rate-limiting that
 * Overpass applies to GET requests where the query is embedded in the URL.
 *
 * Also rate-limited client-side to at most one request per second via the
 * module-level requestLimiter. A still-pending request is automatically aborted
 * when a new one arrives (e.g. on map extent change).
 */
export async function queryFeatures(
    urlOrResult: URL | { url: URL; body: string },
    httpService: HttpService,
    featureFormat: FeatureFormat,
    mapProjection: ProjectionLike,
    signal?: AbortSignal
): Promise<FeatureResponse> {
    // Accept both the old plain-URL shape and the new { url, body } shape.
    const { url, body } =
        urlOrResult instanceof URL
            ? { url: urlOrResult, body: urlOrResult.searchParams.get("data") ?? "" }
            : urlOrResult;

    // Wait for the rate-limit slot; aborts any currently running request.
    const controller = await requestLimiter.next();

    // Merge the caller's signal (OL extent change) with the limiter's signal.
    const combinedSignal = signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal;

    try {
        let features: FeatureLike[] = [];

        const response = await httpService.fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(body)}`,
            signal: combinedSignal
        });

        if (response.status !== 200) {
            throw new Error(
                `Failed to query features from service (status code ${response.status})`
            );
        }

        const xml = await response.text();

        if (featureFormat) {
            features = featureFormat.readFeatures(xml, {
                featureProjection: mapProjection,
                dataProjection: "EPSG:4326"
            });
        }

        return { features };
    } finally {
        requestLimiter.release(controller);
    }
}

export interface FeatureResponse {
    features: FeatureLike[];
}
