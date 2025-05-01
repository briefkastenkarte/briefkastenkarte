// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { OverpassApiVectorSourceOptions, OverpassApiVectorSourceFactory } from "./api";
import { createVectorSource } from "./createVectorSource";
import { HttpService } from "@open-pioneer/http";
import { ServiceOptions } from "@open-pioneer/runtime";

interface References {
    httpService: HttpService;
}

export class VectorSourceFactory implements OverpassApiVectorSourceFactory {
    #httpService: HttpService;

    constructor({ references }: ServiceOptions<References>) {
        this.#httpService = references.httpService;
    }

    createVectorSource(options: OverpassApiVectorSourceOptions): VectorSource<Feature<Geometry>> {
        return createVectorSource(options, this.#httpService);
    }
}
