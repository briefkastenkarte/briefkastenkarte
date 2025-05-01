// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    entryPoints: ["index"],
    services: {
        VectorSourceFactory: {
            provides: "overpass-api.VectorSourceFactory",
            references: {
                httpService: "http.HttpService"
            }
        }
    },
    publishConfig: {
        strict: true
    }
});
