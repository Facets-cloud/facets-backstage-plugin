import {
  coreServices,
  createBackendPlugin,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createFacetsApisService } from './services/FacetsApiService';

/**
 * facetsCloudPlugin backend plugin
 *
 * @public
 */
export const facetsCloudPlugin = createBackendPlugin({
  pluginId: 'facets-cloud',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        database: coreServices.database,
        userInfo: coreServices.userInfo,
      },
      async init({ logger, httpAuth, httpRouter, config, database, userInfo }) {
        const client = await database.getClient();
        const facetsApiService = await createFacetsApisService({
          logger,
          config,
          database,
        });

        const migrationsDir = resolvePackagePath(
          '@facets-cloud/backstage-plugin-backend',
          'migrations',
        );
        if (!database.migrations?.skip) {
          await client.migrate.latest({
            directory: migrationsDir,
          });
        }

        httpRouter.use(
          await createRouter({
            httpAuth,
            facetsApiService,
            userInfo
          }),
        );
      },
    });
  },
});
