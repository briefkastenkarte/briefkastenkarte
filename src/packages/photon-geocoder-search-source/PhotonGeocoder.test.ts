// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PhotonGeocoder } from "./PhotonGeocoder";
import type { HttpService } from "@open-pioneer/http";

const MOCK_RESPONSE = {
    features: [
        {
            geometry: {
                type: "Point",
                coordinates: [7.628202, 51.961563]
            },
            properties: {
                osm_id: 12345,
                osm_value: "residential",
                name: "Musterstraße 1",
                city: "Münster",
                postcode: "48143",
                country: "Deutschland",
                type: "house"
            }
        },
        {
            geometry: {
                type: "Point",
                coordinates: [7.62, 51.96]
            },
            properties: {
                osm_id: 67890,
                osm_value: "city",
                name: "Münster",
                city: "",
                postcode: "",
                country: "Deutschland",
                type: "city" // filtered out in the test below
            }
        }
    ]
};

function makeMockHttpService(data: unknown): HttpService {
    return {
        fetch: vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(data)
        })
    } as unknown as HttpService;
}

describe("PhotonGeocoder", () => {
    let httpService: HttpService;
    let geocoder: PhotonGeocoder;

    beforeEach(() => {
        httpService = makeMockHttpService(MOCK_RESPONSE);
        geocoder = new PhotonGeocoder({
            label: "Test Geocoder",
            filteredTypes: ["house"],
            httpService
        });
    });

    it("exposes the configured label", () => {
        expect(geocoder.label).toBe("Test Geocoder");
    });

    it("returns only features matching filteredTypes", async () => {
        const results = await geocoder.search("Musterstraße", {
            mapProjection: "EPSG:3857",
            signal: undefined
        } as never);

        // Only "house" type passes the filter; "city" is excluded
        expect(results).toHaveLength(1);
        expect(results[0]!.id).toBe(12345);
    });

    it("builds a readable label from feature properties", async () => {
        const results = await geocoder.search("Muster", {
            mapProjection: "EPSG:3857",
            signal: undefined
        } as never);

        expect(results[0]!.label).toBe("Musterstraße 1 (48143, Münster, Deutschland)");
    });

    it("throws when the HTTP request fails", async () => {
        const badHttp = {
            fetch: vi.fn().mockResolvedValue({ ok: false, status: 500 })
        } as unknown as HttpService;

        const badGeocoder = new PhotonGeocoder({
            label: "Bad",
            filteredTypes: ["house"],
            httpService: badHttp
        });

        await expect(
            badGeocoder.search("fail", { mapProjection: "EPSG:3857" } as never)
        ).rejects.toThrow("Request failed: 500");
    });

    it("passes custom lang/lat/lon/limit to the API URL", async () => {
        const customGeocoder = new PhotonGeocoder({
            label: "Custom",
            filteredTypes: ["house"],
            httpService,
            lang: "en",
            lat: 52.5,
            lon: 13.4,
            limit: 10
        });

        await customGeocoder.search("Berlin", { mapProjection: "EPSG:3857" } as never);

        const fetchMock = httpService.fetch as ReturnType<typeof vi.fn>;
        const firstCall = fetchMock.mock.calls[0];
        expect(firstCall, "fetch was never called").toBeDefined();
        const calledUrl = firstCall![0] as URL;
        expect(calledUrl.searchParams.get("lang")).toBe("en");
        expect(calledUrl.searchParams.get("lat")).toBe("52.5");
        expect(calledUrl.searchParams.get("lon")).toBe("13.4");
        expect(calledUrl.searchParams.get("limit")).toBe("10");
    });
});
