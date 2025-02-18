# @facets-cloud/backstage-plugin-backend

`@facets-cloud/backstage-plugin-backend` is a plugin for the Backstage backend app. It provides a route that `@facets-cloud/backstage-plugin` will use to connect to Facets.cloud API.

## Installation

1. Install `@facets-cloud/backstage-plugin-backend` plugin with,

```bash
yarn workspace backend add @facets-cloud/backstage-plugin-backend
```

2. Add the plugin in `./packages/backend/src/index.ts` to your backend,

```diff
+ backend.add(import('@facets-cloud/backstage-plugin-backend'));

backend.start();
```

3. Add `proxy` and `facets-cloud` configuration to `app-config.yaml`. Note that adding auth in config is *not* recommended and it should be configured at user level in Facets.cloud settings. If there is no auth configured for user, and there is auth configured in `app-config.yaml`, this common authentication will be used for making api calls to Facets.cloud

```diff
proxy:
  endpoints:
    '/facets/api':
      target: ${FACETS_CONTROL_PLANE_URL}

facets-cloud:
  controlPlaneUrl: ${FACETS_CONTROL_PLANE_URL}
  auth:
    username: ${FACETS_USER_NAME}
    accessToken: ${FACETS_ACCESS_TOKEN}
```