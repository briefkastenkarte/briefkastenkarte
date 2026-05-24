// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequestLimiter } from "./requestLimiter";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("createRequestLimiter", () => {
    describe("next()", () => {
        it("returns an AbortController on first call", async () => {
            const requestLimiter = createRequestLimiter();
            const promise = requestLimiter.next();
            await vi.runAllTimersAsync();

            const controller = await promise;
            expect(controller).toBeInstanceOf(AbortController);
        });

        it("returns a new controller on each call", async () => {
            const requestLimiter = createRequestLimiter({ interval: 0 });

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c1 = await p1;

            requestLimiter.release(c1);

            const p2 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c2 = await p2;

            expect(c1).not.toBe(c2);
        });

        it("waits for the interval before resolving", async () => {
            const interval = 1000;
            const requestLimiter = createRequestLimiter({ interval });

            // First call resolves immediately (no previous request).
            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c1 = await p1;
            requestLimiter.release(c1);

            // Second call should wait ~1000 ms.
            let resolved = false;
            const p2 = requestLimiter.next().then((c) => {
                resolved = true;
                return c;
            });

            // Not yet resolved before the interval elapses.
            await vi.advanceTimersByTimeAsync(interval - 1);
            expect(resolved).toBe(false);

            // Resolved after the interval elapses.
            await vi.advanceTimersByTimeAsync(1);
            await p2;
            expect(resolved).toBe(true);
        });

        it("aborts the pending controller when a new request arrives", async () => {
            const requestLimiter = createRequestLimiter({ interval: 0 });

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c1 = await p1;

            // Start a second request without releasing the first.
            const p2 = requestLimiter.next();
            await vi.runAllTimersAsync();
            await p2;

            expect(c1.signal.aborted).toBe(true);
            expect(c1.signal.reason).toBe("Superseded by newer request");
        });

        it("does not abort a released controller when a new request arrives", async () => {
            const requestLimiter = createRequestLimiter({ interval: 0 });

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c1 = await p1;
            requestLimiter.release(c1); // properly released

            const p2 = requestLimiter.next();
            await vi.runAllTimersAsync();
            await p2;

            expect(c1.signal.aborted).toBe(false);
        });
    });

    describe("release()", () => {
        it("clears the pending controller", async () => {
            const requestLimiter = createRequestLimiter({ interval: 0 });

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c1 = await p1;

            requestLimiter.release(c1);

            // After release, calling next() must NOT abort c1.
            const p2 = requestLimiter.next();
            await vi.runAllTimersAsync();
            await p2;

            expect(c1.signal.aborted).toBe(false);
        });

        it("ignores a stale controller that is no longer pending", async () => {
            const requestLimiter = createRequestLimiter({ interval: 0 });

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            const c1 = await p1;

            const p2 = requestLimiter.next(); // c1 superseded → new controller pending
            await vi.runAllTimersAsync();
            const c2 = await p2;

            // Releasing the stale c1 must not affect c2.
            requestLimiter.release(c1);

            const p3 = requestLimiter.next();
            await vi.runAllTimersAsync();
            await p3;

            expect(c2.signal.aborted).toBe(true); // aborted by p3, not by stale release
        });
    });

    describe("options", () => {
        it("uses 1000 ms as default interval", async () => {
            const requestLimiter = createRequestLimiter();

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            requestLimiter.release(await p1);

            let resolved = false;
            const p2 = requestLimiter.next().then((c) => {
                resolved = true;
                return c;
            });

            await vi.advanceTimersByTimeAsync(999);
            expect(resolved).toBe(false);

            await vi.advanceTimersByTimeAsync(1);
            await p2;
            expect(resolved).toBe(true);
        });

        it("respects a custom interval", async () => {
            const requestLimiter = createRequestLimiter({ interval: 500 });

            const p1 = requestLimiter.next();
            await vi.runAllTimersAsync();
            requestLimiter.release(await p1);

            let resolved = false;
            const p2 = requestLimiter.next().then((c) => {
                resolved = true;
                return c;
            });

            await vi.advanceTimersByTimeAsync(499);
            expect(resolved).toBe(false);

            await vi.advanceTimersByTimeAsync(1);
            await p2;
            expect(resolved).toBe(true);
        });
    });
});
