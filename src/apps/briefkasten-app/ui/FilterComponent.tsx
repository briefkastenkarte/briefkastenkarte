// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025 Briefkastenkarte project (https://github.com/briefkastenkarte-de)
// SPDX-License-Identifier: Apache-2.0
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { Toc } from "@open-pioneer/toc";
import { useRef } from "react";
import { MdFilterAlt } from "react-icons/md";
import { useIntl } from "open-pioneer:react-hooks";

export function FilterComponent() {
    const intl = useIntl();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <ToolButton
                label={intl.formatMessage({ id: "filterLabel" })}
                icon={<MdFilterAlt />}
                ref={btnRef}
                onClick={onOpen}
            ></ToolButton>
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
                isFullHeight={false}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>{intl.formatMessage({ id: "filterLabel" })}</DrawerHeader>

                    <DrawerBody>
                        <Toc showBasemapSwitcher={false}></Toc>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button onClick={onClose} w="100%">
                            {intl.formatMessage({ id: "close" })}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
