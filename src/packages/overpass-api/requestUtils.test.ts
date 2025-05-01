// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { expect, it } from "vitest";
import { createRequestUrl } from "./requestUtils";

it("create request url containing extent and Overpass API query", () => {
    const url = createRequestUrl(
        "https://overpass-api.de/api/interpreter",
        1000,
        "node[amenity=post_box];",
        [51.15685459468058, 6.7701059045906264, 51.256704355192745, 6.949339916232161]
    );
    expect(url).toMatchInlineSnapshot(
        '"https://overpass-api.de/api/interpreter/?data=[bbox:51.15685459468058,6.7701059045906264,51.256704355192745,6.949339916232161][out:xml][timeout:1000];(node[amenity=post_box];);out;%3E;out%20skel%20qt;"'
    );
});
