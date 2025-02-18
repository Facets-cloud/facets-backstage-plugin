import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { settingsRouteRef } from './routes';
import { facetsApiRef } from './api';
import { FacetsApi } from './api/FacetsApi';

export const facetsCloudPlugin = createPlugin({
  id: 'facets-cloud',
  apis: [
    createApiFactory({
      api: facetsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        new FacetsApi({ discoveryApi, fetchApi, configApi }),
    }),
  ],
});

export const SettingsPage = facetsCloudPlugin.provide(
  createRoutableExtension({
    name: 'SettingsPage',
    component: () =>
      import('./components/SettingsPage').then(m => m.SettingsPage),
    mountPoint: settingsRouteRef,
  }),
);

export const ReleaseHistoryCard = facetsCloudPlugin.provide(
  createComponentExtension({
    name: 'ReleaseHistoryCard',
    component: {
      lazy: () =>
        import('./components/ReleaseHistoryCard').then(
          m => m.ReleaseHistoryCard,
        ),
    },
  }),
);

export const TerraformOutputCard = facetsCloudPlugin.provide(
  createComponentExtension({
    name: 'TerraformOutputCard',
    component: {
      lazy: () =>
        import('./components/TerraformOutputCard').then(
          m => m.TerraformOutputCard,
        ),
    },
  }),
);

export const EnvironmentOverviewCard = facetsCloudPlugin.provide(
  createComponentExtension({
    name: 'EnvironmentOverviewCard',
    component: {
      lazy: () =>
        import('./components/EnvironmentOverviewCard').then(
          m => m.EnvironmentOverviewCard,
        ),
    },
  }),
);
