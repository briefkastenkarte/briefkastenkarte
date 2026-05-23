// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Resource } from "@open-pioneer/core";
import { HttpService } from "@open-pioneer/http";
import { Highlight, MapModel, MapRegistry } from "@open-pioneer/map";
import { type DECLARE_SERVICE_INTERFACE, Service, ServiceOptions } from "@open-pioneer/runtime";
import { SearchSource } from "@open-pioneer/search";
import { PhotonGeocoder } from "./sources/searchSources";
import { Geometry } from "ol/geom";
import { ReadonlyReactiveArray, reactiveArray } from "@conterra/reactivity-core";

/**
 * Reactive state, rendered by the UI.
 */
export interface AppState {
    /**
     * The sources currently used in the search component.
     */
    readonly searchSources: ReadonlyReactiveArray<SearchSource>;
}

interface References {
    mapRegistry: MapRegistry;
}

interface References {
    httpService: HttpService;
    mapRegistry: MapRegistry;
}

export class AppModel implements Service, AppState {
    declare [DECLARE_SERVICE_INTERFACE]: "briefkasten-app.AppModel";

    private _httpService: HttpService;
    private _resources: Resource[] = [];

    // Highlight for search or selection results (they remove each other in this app).
    private _featureHighlight: Highlight | undefined = undefined;

    // Reactive state used by the UI
    private _searchSources = reactiveArray<SearchSource>();

    constructor({ references }: ServiceOptions<References>) {
        this._httpService = references.httpService;

        this.initSearchSources();
    }

    destroy(): void {
        this.clearHighlight();
        this._resources.forEach((r) => r.destroy());
    }

    get searchSources(): ReadonlyReactiveArray<SearchSource> {
        return this._searchSources;
    }

    /**
     * Zooms and highlights to the given geometries.
     * Clears the existing highlight created by earlier calls to this method.
     */
    highlightAndZoom(map: MapModel, geometries: Geometry[]): void {
        const viewport: HTMLElement = map.olMap.getViewport();

        this.clearHighlight();
        this._featureHighlight = map.highlights.addAndZoom(geometries, {
            viewPadding:
                viewport && viewport.offsetWidth < 1000
                    ? { top: 150, right: 75, bottom: 50, left: 75 }
                    : { top: 150, right: 400, bottom: 50, left: 400 }
        });
    }

    /**
     * Zooms to the given geometries.
     */
    zoom(map: MapModel, geometries: Geometry[]): void {
        const viewport: HTMLElement = map.olMap.getViewport();

        map.zoom(geometries, {
            viewPadding:
                viewport && viewport.offsetWidth < 1000
                    ? { top: 150, right: 75, bottom: 50, left: 75 }
                    : { top: 150, right: 400, bottom: 50, left: 400 }
        });
    }

    /**
     * Removes any highlights created by this instance.
     */
    clearHighlight() {
        if (this._featureHighlight) {
            this._featureHighlight.destroy();
            this._featureHighlight = undefined;
        }
    }

    /**
     * Initializes the application's search sources.
     * These are used by the UI to configure the search widget.
     */
    private initSearchSources() {
        const photonSource = new PhotonGeocoder(
            "Photon Geocoder",
            ["city", "street"],
            this._httpService
        );
        this._searchSources.push(photonSource);
    }
}
