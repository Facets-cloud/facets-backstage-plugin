# Facets.cloud Backstage plugins

This repository contains [Backstage](https://backstage.io/) plugins to interact with the [Facets.cloud Platform](https://facets.cloud) from your Backstage Portal.

* [facets-cloud](./backstage-plugins/plugins/facets-cloud) Show environments, release history and Terraform outputs for resources deployed by Facets.cloud.
* [facets-cloud-backend](./backstage-plugins/plugins/facets-cloud-backend/) Backend API route for facets-cloud plugin.

## Development

To start the app, from backstage-plugins folder, run:

```sh
yarn install
yarn dev
```

Execute the tests using:

```sh
yarn test
```
