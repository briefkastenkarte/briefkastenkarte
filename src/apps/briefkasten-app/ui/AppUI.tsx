// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { Box, Container, Flex } from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { useIntl } from "open-pioneer:react-hooks";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { SectionHeading, TitledSection } from "@open-pioneer/react-utils";
import { Geolocation } from "@open-pioneer/geolocation";
import { Notifier } from "@open-pioneer/notifier";
import { MAP_ID, MAP_PROJECTION } from "../map/MapConfigProviderImpl";
import { DefaultMapProvider } from "@open-pioneer/map";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { SearchComponent } from "./SearchComponent";
import { FilterComponent } from "./FilterComponent";

const POSITION_STYLE = new Style({
    image: new CircleStyle({
        radius: 8,
        fill: new Fill({
            color: "rgb(45, 125, 159)"
        }),
        stroke: new Stroke({
            color: "#FFF",
            width: 2
        })
    })
});

const ACCURACY_STYLE = new Style({
    stroke: new Stroke({
        color: "rgb(45, 125, 159)",
        width: 4
    }),
    fill: new Fill({
        color: "rgba(255, 255, 255, 0.5)"
    })
});

export function AppUI() {
    const intl = useIntl();

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Notifier position="bottom" />
            <TitledSection
                title={
                    <Box
                        role="region"
                        aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                        textAlign="center"
                        // py={1}
                    >
                        <SectionHeading size={"md"}>
                            {/* Open Pioneer Trails - Map Sample */}
                        </SectionHeading>
                    </Box>
                }
            >
                <Flex flex="1" direction="column" position="relative">
                    <DefaultMapProvider mapId={MAP_ID}>
                        <MapContainer
                            role="main"
                            aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                        >
                            <Container centerContent>
                                <SearchComponent />
                            </Container>

                            <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                                <Flex
                                    role="top-left"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.topLeft" })}
                                    direction="column"
                                    gap={1}
                                    padding={1}
                                >
                                    <ZoomIn />
                                    <ZoomOut />
                                    <Geolocation
                                        positionFeatureStyle={POSITION_STYLE}
                                        accuracyFeatureStyle={ACCURACY_STYLE}
                                    />
                                </Flex>
                            </MapAnchor>
                            <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                <Flex
                                    role="top-left"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                                    direction="column"
                                    gap={1}
                                    padding={1}
                                >
                                    <FilterComponent />
                                </Flex>
                            </MapAnchor>
                            <MapAnchor position="bottom-left" horizontalGap={0} verticalGap={0}>
                                <Box
                                    backgroundColor="rgba(255, 255, 255, 0.75)"
                                    padding={0.5}
                                    fontSize={"small"}
                                    role="bottom-left"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.bottomLeft" })}
                                >
                                    <CoordinateViewer
                                        displayProjectionCode={MAP_PROJECTION}
                                        precision={0}
                                    />
                                </Box>
                            </MapAnchor>
                        </MapContainer>
                    </DefaultMapProvider>
                </Flex>
            </TitledSection>
        </Flex>
    );
}
