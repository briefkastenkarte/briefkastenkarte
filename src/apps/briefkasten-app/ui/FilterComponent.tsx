// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { Toc } from "@open-pioneer/toc";
import { MdFilterAlt } from "react-icons/md";
import { useIntl } from "open-pioneer:react-hooks";

export function FilterComponent() {
    const intl = useIntl();

    return (
        <Drawer.Root closeOnInteractOutside={false}>
            <Drawer.Trigger asChild>
                <ToolButton
                    label={intl.formatMessage({ id: "filterLabel" })}
                    icon={<MdFilterAlt />}
                ></ToolButton>
            </Drawer.Trigger>
            <Portal>
                <Drawer.Positioner pointerEvents="none">
                    <Drawer.Content pointerEvents="auto">
                        <Drawer.Header>
                            <Drawer.Title>{intl.formatMessage({ id: "filterLabel" })}</Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body>
                            <Toc showBasemapSwitcher={false}></Toc>
                        </Drawer.Body>
                        <Drawer.Footer />
                        <Drawer.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}
