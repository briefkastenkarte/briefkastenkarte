// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { assert, expect, it } from "vitest";
import { _createVectorSource, transformExtent } from "./createVectorSource";
import { HttpService } from "@open-pioneer/http";

const DUMMY_HTTP_SERVICE = {
    fetch() {
        throw new Error("Not implemented (dummy http service).");
    }
} satisfies Partial<HttpService> as HttpService;

it("expect additionalOptions are set on vector-source", () => {
    const additionalOptions = {
        overlaps: false,
        wrapX: false,
        format: undefined
    };

    const vectorSource = _createVectorSource(
        {
            baseUrl: "",
            query: "",
            additionalOptions: additionalOptions,
            mapProjection: "EPSG:3857"
        },
        {
            httpService: DUMMY_HTTP_SERVICE
        }
    );
    assert.isTrue(
        !vectorSource.getOverlaps() &&
            vectorSource.getWrapX() === false &&
            vectorSource.getFormat() === null // OpenLayers returns `null` instead of `undefined`
    );
});

it("expect bounding box is correctly transformed", () => {
    const bbox = transformExtent(
        [761127.8442525809, 6652177.966820163, 773950.1557474191, 6662946.033179837],
        "EPSG:3857"
    );

    expect(bbox).toEqual([
        51.17426894743056, 6.83732775661036, 51.23487504988219, 6.952512540545906
    ]);
});
