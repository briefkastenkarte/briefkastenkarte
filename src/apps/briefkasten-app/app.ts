// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./ui/AppUI";

const element = createCustomElement({
    component: AppUI,
    theme,
    appMetadata
});

customElements.define("briefkasten-app", element);
