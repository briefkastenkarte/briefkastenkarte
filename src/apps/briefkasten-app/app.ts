// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./ui/AppUI";
import { NotifierProperties } from "@open-pioneer/notifier";

const element = createCustomElement({
    component: AppUI,
    appMetadata,
    config: {
        properties: {
            "@open-pioneer/notifier": {
                position: "bottom"
            } satisfies NotifierProperties
        }
    }
});

customElements.define("briefkasten-app", element);
