// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de"],
    services: {
        MapConfigProviderImpl: {
            provides: ["map.MapConfigProvider"],
            references: {
                vectorSourceFactory: "overpass-api.VectorSourceFactory"
            }
        },
        AppModel: {
            provides: "briefkasten-app.AppModel",
            references: {
                httpService: "http.HttpService",
                mapRegistry: "map.MapRegistry"
            }
        }
    },
    ui: {
        references: ["map.MapRegistry", "briefkasten-app.AppModel", "notifier.NotificationService"]
    }
});
