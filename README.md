[![Build and deploy](https://github.com/briefkastenkarte/briefkastenkarte/actions/workflows/test-and-build.yml/badge.svg?branch=main)](https://github.com/briefkastenkarte/briefkastenkarte/actions/workflows/test-and-build.yml)
[![Audit dependencies (daily)](https://github.com/briefkastenkarte/briefkastenkarte/actions/workflows/audit-dependencies.yml/badge.svg?branch=main)](https://github.com/briefkastenkarte/briefkastenkarte/actions/workflows/audit-dependencies.yml)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# briefkastenkarte

Visualizing mailbox locations based on data retrieved from [OpenStreetMap](https://www.openstreetmap.org/).

[CI/CD environment](https://briefkastenkarte.github.io/briefkastenkarte/) | [API documentation](https://briefkastenkarte.github.io/briefkastenkarte/docs/)

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 24 or later) and [pnpm](https://pnpm.io/) (Version 11.x) installed.

Then execute the following commands to get started:

```bash
$ git clone https://github.com/briefkastenkarte/briefkastenkarte.git   # Clone the repository
$ cd briefkastenkarte
$ pnpm install                                                            # Install dependencies
$ pnpm run dev                                                            # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

## Packages

This repository publishes the following packages:

| Name                                                                                             | Version                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@briefkastenkarte/overpass-api](./src/packages/overpass-api/)                                   | [![NPM Version](https://img.shields.io/npm/v/%40briefkastenkarte%2Foverpass-api)](https://www.npmjs.com/package/@briefkastenkarte/overpass-api)                                   |
| [@briefkastenkarte/photon-geocoder-search-source](./src/packages/photon-geocoder-search-source/) | [![NPM Version](https://img.shields.io/npm/v/%40briefkastenkarte%2Fphoton-geocoder-search-source)](https://www.npmjs.com/package/@briefkastenkarte/photon-geocoder-search-source) |

## See also

- [Open Pioneer](https://github.com/open-pioneer/)
- [Briefkastenkarte API documentation](https://briefkastenkarte.github.io/briefkastenkarte/docs/)

## License

Apache-2.0 (see `LICENSE` file)
