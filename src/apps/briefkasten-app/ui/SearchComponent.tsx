// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Box } from "@open-pioneer/chakra-integration";
import { useMapModel } from "@open-pioneer/map";
import { Search, SearchSelectEvent } from "@open-pioneer/search";
import { useService } from "open-pioneer:react-hooks";
import { AppModel } from "../AppModel";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

export function SearchComponent() {
    const { map } = useMapModel(); // uses default map configured in AppUI.tsx
    const appModel = useService<AppModel>("briefkasten-app.AppModel");
    const sources = useReactiveSnapshot(() => appModel.searchSources.getItems(), [appModel]);

    function onSearchResultSelected(event: SearchSelectEvent) {
        if (!map) {
            return;
        }

        const geometry = event.result.geometry;
        if (!geometry) {
            return;
        }

        appModel.highlightAndZoom(map, [geometry]);
    }

    function onSearchCleared() {
        appModel.clearHighlight();
    }

    return (
        <Box
            backgroundColor="white"
            borderWidth="1px"
            borderRadius="lg"
            padding={2}
            boxShadow="lg"
            className="search-box"
        >
            <Search
                sources={sources}
                maxResultsPerGroup={10}
                onSelect={onSearchResultSelected}
                onClear={onSearchCleared}
            />
        </Box>
    );
}
