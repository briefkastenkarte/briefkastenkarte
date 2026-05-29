# @briefkastenkarte/photon-geocoder-search-source

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

An [Open Pioneer](https://github.com/open-pioneer) `SearchSource` that queries the free [Photon Geocoder](https://photon.komoot.io/) service and integrates it with the `@open-pioneer/search` package.

## Features

- Implements `SearchSource` from `@open-pioneer/search` out of the box
- Filters results by OSM feature type (e.g. `"house"`, `"street"`, `"city"`)
- Reprojects geometries from `EPSG:4326` to any map projection via OpenLayers
- Configurable language, location bias, and result limit

## Usage

```ts
import { PhotonGeocoder } from "@briefkastenkarte/photon-geocoder-search-source";

// httpService is injected by the Open Pioneer runtime
const geocoder = new PhotonGeocoder({
    label: "Address search",
    filteredTypes: ["house", "street", "city"],
    httpService, // @open-pioneer/http HttpService
    lang: "de", // optional – API language (default: "de")
    lat: 51.961563, // optional – latitude  (default: Münster, DE)
    lon: 7.628202, // optional – longitude (default: Münster, DE)
    limit: 50 // optional – max raw results (default: 100)
});
```

Then pass the geocoder to whatever component consumes `SearchSource[]`:

```tsx
<Search sources={[geocoder]} />
```

## License

Apache-2.0 (see `LICENSE` file)
