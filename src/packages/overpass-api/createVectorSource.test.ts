// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { assert, it } from "vitest";
import { _createVectorSource } from "./createVectorSource";
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
        { baseUrl: "", query: "", additionalOptions: additionalOptions },
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
