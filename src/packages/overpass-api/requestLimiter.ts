// SPDX-FileCopyrightText: 2023-2026 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-FileCopyrightText: 2025-2026 Briefkastenkarte project (https://github.com/briefkastenkarte)
// SPDX-License-Identifier: Apache-2.0

/**
 * Options for {@link createRequestLimiter}.
 */
export interface RequestLimiterOptions {
    /** Minimum time in milliseconds between two requests. Defaults to `1000`. */
    interval?: number;
}

/**
 * Controls outgoing request flow: at most one request per interval,
 * with automatic cancellation of superseded requests.
 */
export interface RequestLimiter {
    /**
     * Aborts any pending request, waits for the remaining interval,
     * and returns a fresh AbortController for the next request.
     */
    next(): Promise<AbortController>;

    /**
     * Releases the controller after a request completes or fails.
     * Should be called in a `finally` block.
     */
    release(controller: AbortController): void;
}

/**
 * Creates a RequestLimiter that ensures at most one request per `interval`.
 *
 * Each call to `next()` will:
 *  1. Abort any currently pending request.
 *  2. Wait until the minimum interval has elapsed since the last request.
 *  3. Return a fresh AbortController for the new request.
 *
 * Call `release(controller)` in a `finally` block to clean up.
 */
export function createRequestLimiter({
    interval = 1000
}: RequestLimiterOptions = {}): RequestLimiter {
    let lastRequestTime = 0;
    let pendingController: AbortController | null = null;

    return {
        async next(): Promise<AbortController> {
            pendingController?.abort("Superseded by newer request");

            const wait = interval - (Date.now() - lastRequestTime);
            if (wait > 0) {
                await new Promise<void>((resolve) => setTimeout(resolve, wait));
            }

            lastRequestTime = Date.now();
            pendingController = new AbortController();
            return pendingController;
        },

        release(controller: AbortController): void {
            if (pendingController === controller) {
                pendingController = null;
            }
        }
    };
}

export const requestLimiter: RequestLimiter = createRequestLimiter();
