# @briefkastenkarte/overpass-api

This package provides utilities to work with Overpass API services for [Open Pioneer](https://github.com/open-pioneer/) projects.

More information about Overpass API see:

-   [Overpass API website](http://overpass-api.de/)
-   [Overpass API OpenStreetMap Wiki](https://wiki.openstreetmap.org/wiki/Overpass_API)

## Usage

This vector source should be used together with an [OpenLayers vector layer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html).

Inject the vector source factory by referencing `"overpass-api.VectorSourceFactory"`:

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        YourService: {
            // ...
            references: {
                vectorSourceFactory: "overpass-api.VectorSourceFactory"
            }
        }
    }
});
```

and use it inside a VectorLayer:

```ts
const vectorSourceFactory = ...; // injected

const vectorLayer = new VectorLayer({
    source: vectorSourceFactory.createVectorSource({
        baseUrl = "https://overpass-api.de/api/interpreter",
        query: "node[amenity=post_box];",
        mapProjection: "EPSG:3857",
        additionalOptions: {
            attributions: `<a href="https://www.openstreetmap.org/copyright/" title="Link: OpenStreetMap" aria-label="Link: OpenStreetMap" target="_blank">© OpenStreetMap contributors</a>`
        }
    })
});
```

Additional options of the `VectorSource` (see [OpenLayers documentation](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html)) can be given by the property `additionalOptions`.

### Rewriting request URLs

The optional `rewriteUrl` option can be used to modify the feature requests made by the vector source.
Note that modifying the vector source's URL requires some care: existing query parameters should not be overwritten unless you know what you're doing.
The vector source may add additional query parameters in the future, which might conflict the changes done by custom `rewriteUrl` implementations.

Example:

```ts
vectorSourceFactory.createVectorSource({
    baseUrl = "https://overpass-api.de/api/interpreter",
    query: "node[amenity=post_box];",
    mapProjection: "EPSG:3857",

    rewriteUrl(url) {
        url.searchParams.set("property", "value");
        return url;
    }
});
```

## License

Apache-2.0 (see `LICENSE` file)
