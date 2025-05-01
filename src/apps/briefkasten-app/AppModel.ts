// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Resource } from "@open-pioneer/core";
import { HttpService } from "@open-pioneer/http";
import { Highlight, MapModel, MapRegistry } from "@open-pioneer/map";
import { type DECLARE_SERVICE_INTERFACE, Service, ServiceOptions } from "@open-pioneer/runtime";
import { SearchSource } from "@open-pioneer/search";
import { PhotonGeocoder } from "./sources/searchSources";
import { Geometry } from "ol/geom";
import { ReadonlyReactiveArray, reactive, reactiveArray } from "@conterra/reactivity-core";

/**
 * Reactive state, rendered by the UI.
 */
export interface AppState {
    /**
     * The content of the main widget on the left side of the application.
     */
    readonly mainContent: readonly MainContentId[];

    /**
     * The sources currently used in the search component.
     */
    readonly searchSources: ReadonlyReactiveArray<SearchSource>;
}

/**
 * The id of a widget that can be displayed by this app.
 */
export type MainContentId =
    | "toc"
    | "legend"
    | "printing"
    | "selection"
    | "measurement"
    | "editing-create"
    | "editing-update";

interface References {
    mapRegistry: MapRegistry;
}

interface References {
    httpService: HttpService;
    mapRegistry: MapRegistry;
}

function isInteraction(content: MainContentId): boolean {
    return content === "selection" || content === "measurement" || content.startsWith("editing-");
}

export class AppModel implements Service, AppState {
    declare [DECLARE_SERVICE_INTERFACE]: "briefkasten-app.AppModel";

    private _mapRegistry: MapRegistry;
    private _httpService: HttpService;
    private _resources: Resource[] = [];

    // Highlight for search or selection results (they remove each other in this app).
    private _featureHighlight: Highlight | undefined = undefined;

    // Reactive state used by the UI
    private _mainContent = reactive<MainContentId[]>(["toc"]);
    private _searchSources = reactiveArray<SearchSource>();

    constructor({ references }: ServiceOptions<References>) {
        this._mapRegistry = references.mapRegistry;
        this._httpService = references.httpService;

        this.initSearchSources();
    }

    destroy(): void {
        this.clearHighlight();
        this._resources.forEach((r) => r.destroy());
    }

    get mainContent(): readonly MainContentId[] {
        return this._mainContent.value;
    }

    get searchSources(): ReadonlyReactiveArray<SearchSource> {
        return this._searchSources;
    }

    /**
     * Show or hide the given main content element.
     *
     * The main area of this application can show multiple "normal" widgets
     * or exactly one interaction.
     */
    toggleMainContent(content: MainContentId) {
        const current = this._mainContent.value;
        if (current.includes(content)) {
            this._mainContent.value = current.filter((c) => c !== content);
            return;
        }

        let next;
        if (isInteraction(content)) {
            // Hide everything else. This also enforces a single active map interaction.
            next = [content];
            this.clearHighlight();
        } else {
            next = current.filter((c) => !isInteraction(c));
            next.push(content);
        }
        this._mainContent.value = next;
    }

    /**
     * Hides the content element with the given name.
     */
    hideContent(name: MainContentId) {
        this._mainContent.value = this._mainContent.value.filter((c) => c !== name);
    }

    /**
     * Resets all currently running interactions.
     */
    clearInteractions() {
        this._mainContent.value = this._mainContent.value.filter((c) => !isInteraction(c));
    }

    /**
     * Zooms and highlights to the given geometries.
     * Clears the existing highlight created by earlier calls to this method.
     */
    highlightAndZoom(map: MapModel, geometries: Geometry[]): void {
        const viewport: HTMLElement = map.olMap.getViewport();

        this.clearHighlight();
        this._featureHighlight = map.highlightAndZoom(geometries, {
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
