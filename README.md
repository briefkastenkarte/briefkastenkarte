[![Build and deploy](https://github.com/briefkastenkarte-de/briefkastenkarte/actions/workflows/test-and-build.yml/badge.svg?branch=main)](https://github.com/briefkastenkarte-de/briefkastenkarte/actions/workflows/test-and-build.yml)
[![Audit dependencies (daily)](https://github.com/briefkastenkarte-de/briefkastenkarte/actions/workflows/audit-dependencies.yml/badge.svg?branch=main)](https://github.com/briefkastenkarte-de/briefkastenkarte/actions/workflows/audit-dependencies.yml)

# briefkastenkarte

Visualizing mailbox locations based on data retrieved from [OpenStreetMap](https://www.openstreetmap.org/).

[CI/CD environment](https://briefkastenkarte-de.github.io/briefkastenkarte/) | [API documentation](https://briefkastenkarte-de.github.io/briefkastenkarte/docs/)

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 20 or later) and [pnpm](https://pnpm.io/) (Version 9.x) installed.

Then execute the following commands to get started:

```bash
$ git clone https://github.com/briefkastenkarte-de/briefkastenkarte.git   # Clone the repository
$ cd briefkastenkarte
$ pnpm install                                                            # Install dependencies
$ pnpm run dev                                                            # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

## See also

-   [Open Pioneer](https://github.com/open-pioneer/)
-   [Briefkastenkarte API documentation](https://briefkastenkarte-de.github.io/briefkastenkarte/docs/)

## License

Apache-2.0 (see `LICENSE` file)
