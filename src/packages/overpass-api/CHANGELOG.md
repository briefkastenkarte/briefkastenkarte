# @briefkastenkarte/overpass-api

## 0.3.1

### Patch Changes

- 724e29e: Fix typos and i18n

## 0.3.0

### Minor Changes

- 4443c10: Bump version to 0.3.0 — skipping 0.2.0 which was published to npm unintentionally.

## 0.2.0

### Minor Changes

- 93e6dca: Switch Overpass API requests from GET to POST to avoid HTTP 429 `Too Many Requests` responses. Add `requestLimiter.ts` with a `RequestLimiter` interface and `createRequestLimiter` factory that enforces a minimum interval of one second between outgoing requests. Integrate the limiter into `queryFeatures` so all requests are rate-limited automatically.
- 045e907: Remove optional prop `attributions` from interface `OverpassApiVectorSourceOptions`.

    Used `additionalOptions.attributions` instead.

- a446d93: Update dependencies

## 0.1.1

### Patch Changes

- 613fb25: Update package documentation

## 0.1.0

### Minor Changes

- 1ddb5c5: Initial release.
