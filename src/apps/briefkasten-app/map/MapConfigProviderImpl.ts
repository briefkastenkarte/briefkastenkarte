// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, WMTSLayer } from "@open-pioneer/map";
import View from "ol/View";

export const MAP_ID = "briefkastenkarte";
export class MapConfigProviderImpl implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            advanced: {
                view: new View({
                    center: [350500, 5675000],
                    zoom: 14,
                    constrainResolution: true,
                    projection: "EPSG:25832"
                })
            },
            layers: [...createBaseLayers()]
        };
    }
}

function createBaseLayers() {
    return [
        new WMTSLayer({
            isBaseLayer: true,
            title: "Karte (grau)",
            url: "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/WMTSCapabilities.xml",
            name: "de_basemapde_web_raster_grau",
            matrixSet: "DE_EPSG_25832_ADV",
            visible: true,
            sourceOptions: {
                attributions: `DL-DE->BY-2.0: &copy; GeoBasis-DE / <a href="https://www.bkg.bund.de/" title="Externer Link: Bundesamt für Kartographie und Geodäsie" aria-label="Externer Link: Bundesamt für Kartographie und Geodäsie" target="_blank">BKG</a> (${new Date().getFullYear()}) <a href="https://www.govdata.de/dl-de/by-2-0" title="Externer Link: GovData.de - Das Datenportal für Deutschland" aria-label="Externer Link: GovData.de - Das Datenportal für Deutschland" target="_blank">dl-de/by-2-0</a>`
            }
        })
    ];
}
