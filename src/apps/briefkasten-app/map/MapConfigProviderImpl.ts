// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import View from "ol/View";
import { OverpassApiVectorSourceFactory } from "@briefkastenkarte/overpass-api";
import { ServiceOptions } from "@open-pioneer/runtime";
import VectorLayer from "ol/layer/Vector";
import { Circle, Fill, Style } from "ol/style";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

export const MAP_ID = "briefkastenkarte";
export const MAP_PROJECTION = "EPSG:3857";

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
                    center: [767539, 6657562],
                    zoom: 14,
                    maxZoom: 19,
                    constrainResolution: true,
                    projection: MAP_PROJECTION
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
        new SimpleLayer({
            title: "OpenStreetMap",
            id: "osm",
            isBaseLayer: true,
            olLayer: new TileLayer({
                source: new OSM()
            })
        })
    ];
}

function createOverpassLayers(vectorSourceFactory: OverpassApiVectorSourceFactory) {
    const baseUrl = "https://overpass-api.de/api/interpreter";
    const attributions = `<a href="https://www.openstreetmap.org/copyright/" title="Link: OpenStreetMap" aria-label="Link: OpenStreetMap" target="_blank">© OpenStreetMap contributors</a>`;

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
                    attributions,
                    mapProjection: MAP_PROJECTION
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
                    attributions,
                    mapProjection: MAP_PROJECTION
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
                    attributions,
                    mapProjection: MAP_PROJECTION
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
                    attributions,
                    mapProjection: MAP_PROJECTION
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
                    attributions,
                    mapProjection: MAP_PROJECTION
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
                    attributions,
                    mapProjection: MAP_PROJECTION
                })
            })
        })
    ];
}
