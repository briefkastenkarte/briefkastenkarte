// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer, WMTSLayer } from "@open-pioneer/map";
import View from "ol/View";
import { OverpassApiVectorSourceFactory } from "@briefkastenkarte/overpass-api";
import { ServiceOptions } from "@open-pioneer/runtime";
import VectorLayer from "ol/layer/Vector";
import { Circle, Fill, Style } from "ol/style";

export const MAP_ID = "briefkastenkarte";

const DEFAULT_COLOR = "blue";
interface References {
    vectorSourceFactory: OverpassApiVectorSourceFactory;
}

export class MapConfigProviderImpl implements MapConfigProvider {
    mapId = MAP_ID;

    private vectorSourceFactory: OverpassApiVectorSourceFactory;
    constructor({ references }: ServiceOptions<References>) {
        this.vectorSourceFactory = references.vectorSourceFactory;
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            advanced: {
                view: new View({
                    center: [350500, 5675000],
                    zoom: 14,
                    maxZoom: 19,
                    constrainResolution: true,
                    projection: "EPSG:25832"
                })
            },
            layers: [
                ...createBaseLayers(),
                ...createOverpassLayers(this.vectorSourceFactory).reverse()
            ]
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

function createOverpassLayers(vectorSourceFactory: OverpassApiVectorSourceFactory) {
    const baseUrl = "https://overpass-api.de/api/interpreter";
    const attributions = `<a href="https://www.openstreetmap.org/copyright/" title="Externer Link: OpenStreetMap" aria-label="Externer Link: OpenStreetMap" target="_blank">© OpenStreetMap contributors</a>`;
    return [
        new SimpleLayer({
            id: "overpass-api-amenity_post_box",
            title: "Briefkästen",
            visible: true,
            olLayer: new VectorLayer({
                style: new Style({
                    image: new Circle({
                        fill: new Fill({ color: DEFAULT_COLOR }),
                        radius: 5
                    })
                }),
                source: vectorSourceFactory.createVectorSource({
                    baseUrl,
                    query: "node[amenity=post_box];",
                    attributions
                })
            })
        }),
        new SimpleLayer({
            id: "overpass-api-amenity_post_box_sunday",
            title: "Briefkästen mit Leerung am Sonntag",
            visible: false,
            olLayer: new VectorLayer({
                style: new Style({
                    image: new Circle({
                        fill: new Fill({ color: DEFAULT_COLOR }),
                        radius: 5
                    })
                }),
                source: vectorSourceFactory.createVectorSource({
                    baseUrl,
                    query: "node[amenity=post_box][collection_times~'Su'];",
                    attributions
                })
            })
        }),
        new SimpleLayer({
            id: "overpass-api-amenity_post_box_no_collection_times",
            title: "Briefkästen ohne Leerungszeiten",
            visible: false,
            olLayer: new VectorLayer({
                style: new Style({
                    image: new Circle({
                        fill: new Fill({ color: "red" }),
                        radius: 5
                    })
                }),
                source: vectorSourceFactory.createVectorSource({
                    baseUrl,
                    query: "node[amenity=post_box][collection_times!~'.'];",
                    attributions
                })
            })
        }),
        new SimpleLayer({
            id: "overpass-api-amenity_post_box_addr_street",
            title: "Briefkästen mit Adresse",
            visible: false,
            olLayer: new VectorLayer({
                style: new Style({
                    image: new Circle({
                        fill: new Fill({ color: "red" }),
                        radius: 5
                    })
                }),
                source: vectorSourceFactory.createVectorSource({
                    baseUrl,
                    query: "node[amenity=post_box]['addr:street'~'.'];",
                    attributions
                })
            })
        }),
        new SimpleLayer({
            id: "overpass-api-amenity_post_office",
            title: "Poststellen",
            visible: false,
            olLayer: new VectorLayer({
                style: new Style({
                    image: new Circle({
                        fill: new Fill({ color: DEFAULT_COLOR }),
                        radius: 5
                    })
                }),
                source: vectorSourceFactory.createVectorSource({
                    baseUrl,
                    query: "node[amenity=post_office];",
                    attributions
                })
            })
        }),
        new SimpleLayer({
            id: "overpass-api-amenity_parcel_locker",
            title: "Packstation",
            visible: false,
            olLayer: new VectorLayer({
                style: new Style({
                    image: new Circle({
                        fill: new Fill({ color: DEFAULT_COLOR }),
                        radius: 5
                    })
                }),
                source: vectorSourceFactory.createVectorSource({
                    baseUrl,
                    query: "node[amenity=parcel_locker];",
                    attributions
                })
            })
        })
    ];
}
