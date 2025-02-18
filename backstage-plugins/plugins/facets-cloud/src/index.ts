import { Entity } from '@backstage/catalog-model';

export {
  facetsCloudPlugin,
  facetsCloudPlugin as plugin,
  SettingsPage,
  ReleaseHistoryCard,
  TerraformOutputCard,
  EnvironmentOverviewCard,
} from './plugin';

export const getFacetsConfig = (entity: Entity) => {
  const project = entity.metadata?.annotations?.['facets.cloud/project'];
  const resourceType =
    entity.metadata?.annotations?.['facets.cloud/resourceType'];
  const resourceName =
    entity.metadata?.annotations?.['facets.cloud/resourceName'];

  return {
    configExists: project && resourceName && resourceType,
    project,
    resourceName,
    resourceType,
  };
};

export * from './api';
