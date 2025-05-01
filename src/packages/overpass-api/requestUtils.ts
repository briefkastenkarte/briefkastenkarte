// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Extent } from "ol/extent";
import { LoadFeatureOptions } from "./createVectorSource";
import { FeatureLike } from "ol/Feature";
import { HttpService } from "@open-pioneer/http";
import FeatureFormat from "ol/format/Feature";
import { ProjectionLike } from "ol/proj";

/**
 * @internal
 * Creates request url.
 */
export function createRequestUrl(
    baseUrl: string,
    timeout: number,
    query: string,
    extent: Extent,
    rewriteUrl?: (url: URL) => URL | undefined
): URL {
    const url = `${baseUrl}/?data=[bbox:${extent.join(",")}][out:xml][timeout:${timeout}];(${query});out;>;out skel qt;`;
    const urlObj = new URL(url);

    return rewriteUrl?.(new URL(urlObj)) ?? urlObj;
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
 * Performs a single request against the service
 */
export async function queryFeatures(
    url: URL,
    httpService: HttpService,
    featureFormat: FeatureFormat,
    mapProjection: ProjectionLike,
    signal?: AbortSignal
): Promise<FeatureResponse> {
    let features: FeatureLike[] = [];
    const requestInit: RequestInit = {
        signal
    };
    const response = await httpService.fetch(url, requestInit);
    if (response.status !== 200) {
        throw new Error(`Failed to query features from service (status code ${response.status})`);
    }
    const xml = await response.text();

    if (featureFormat) {
        features = featureFormat.readFeatures(xml, {
            featureProjection: mapProjection,
            dataProjection: "EPSG:4326"
        });
    }

    return { features: features };
}

export interface FeatureResponse {
    features: FeatureLike[];
}
