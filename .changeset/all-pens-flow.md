---
"@briefkastenkarte/overpass-api": minor
---

Switch Overpass API requests from GET to POST to avoid HTTP 429 `Too Many Requests` responses. Add `requestLimiter.ts` with a `RequestLimiter` interface and `createRequestLimiter` factory that enforces a minimum interval of one second between outgoing requests. Integrate the limiter into `queryFeatures` so all requests are rate-limited automatically.
