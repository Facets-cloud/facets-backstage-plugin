import {
  DatabaseService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { FacetsApisService, ReleaseImpactRequestParams } from './types';
import axios from 'axios';

export async function createFacetsApisService({
  logger,
  config,
  database,
}: {
  logger: LoggerService;
  config: RootConfigService;
  database: DatabaseService;
}): Promise<FacetsApisService> {
  logger.info('Initializing FacetsApisService');
  const facetsCpUrl = config.getString('facets-cloud.controlPlaneUrl');
  const facetsUserName = config.getOptionalString('facets-cloud.auth.username');
  const facetsAccessToken = config.getOptionalString(
    'facets-cloud.auth.accessToken',
  );

  return {
    async saveUserCredentials(input) {
      const { username, facets_username, facets_accessToken } = input;
      try {
        // Save or update user credentials in the "user_credentials" table
        const client = await database.getClient();

        await client('user_credentials')
          .insert({
            username,
            facets_username,
            facets_accessToken,
          })
          .onConflict('username') // Handle conflict on the `username` field
          .merge({
            facets_username,
            facets_accessToken,
            updated_at: client.fn.now(), // Update the timestamp on merge
          });

        logger.info(`Updated credentials for: ${username}`);
        return { username, facets_username, facets_accessToken };
      } catch (error: any) {
        logger.error('Error saving user credentials', error);
        throw new Error('Failed to save user credentials');
      }
    },

    async getUserCredentials(username) {
      try {
        // Retrieve user credentials from the "facets_user_credentials" table
        const client = await database.getClient();
        const result = await client
          .from('user_credentials')
          .select('facets_username', 'facets_accessToken')
          .where({ username })
          .first();

        if (!result) {
          logger.info(`Facets.Cloud credentials not found for: ${username}`);
          throw new Error('Credentials not found');
        }
        logger.info(`Retrieved credentials for: ${username}`);
        return result;
      } catch (error: any) {
        logger.error('Error retrieving user credentials', error);
        throw new Error('Failed to retrieve user credentials');
      }
    },

    async getReleaseImpacts({
      clusterId,
      resourceType,
      resourceName,
      triggeredBy,
      start,
      end,
      releaseType,
      pageSize,
      pageNumber,
      changeType,
      attribute,
      username,
      accessToken,
    }: ReleaseImpactRequestParams) {
      const params = new URLSearchParams();
      if (triggeredBy) params.append('triggeredBy', triggeredBy);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (releaseType) params.append('releaseType', releaseType);
      if (pageSize) params.append('pageSize', pageSize.toString());
      if (pageNumber) params.append('pageNumber', pageNumber.toString());
      if (changeType) params.append('changeType', changeType);
      if (attribute) params.append('attribute', attribute);

      const url = `${facetsCpUrl}/cc-ui/v1/clusters/${encodeURIComponent(
        clusterId,
      )}/resourceType/${encodeURIComponent(
        resourceType,
      )}/resourceName/${encodeURIComponent(
        resourceName,
      )}/release-impacts?${params.toString()}`;

      try {
        const response = await axios.get(url, {
          auth: {
            username: username || facetsUserName || '',
            password: accessToken || facetsAccessToken || '',
          },
        });
        return { data: response.data, facetsCpUrl };
      } catch (error: any) {
        logger.error('Error fetching release impacts', error);
        return null;
      }
    },

    async triggerRelease({
      clusterId,
      resourceType,
      resourceName,
      username,
      accessToken,
    }) {
      const url = `${facetsCpUrl}/cc-ui/v1/clusters/${encodeURIComponent(
        clusterId,
      )}/deployments/recipes/deployment/hotfix`;

      try {
        const response = await axios.post(
          url,
          {
            resourceList: [
              {
                resourceName: encodeURIComponent(resourceName),
                resourceType: encodeURIComponent(resourceType),
              },
            ],
          },
          {
            auth: {
              username: username || facetsUserName || '',
              password: accessToken || facetsAccessToken || '',
            },
          },
        );
        return { data: response.data, facetsCpUrl };
      } catch (error: any) {
        logger.error('Error fetching release impacts', error);
        return null;
      }
    },

    async getResourceOutProperties({
      clusterId,
      resourceType,
      resourceName,
      username,
      accessToken,
    }: ReleaseImpactRequestParams) {
      const url = `${facetsCpUrl}/cc-ui/v1/clusters/${encodeURIComponent(
        clusterId,
      )}/resourceType/${encodeURIComponent(
        resourceType,
      )}/resourceName/${encodeURIComponent(
        resourceName,
      )}/resource-out-properties`;

      try {
        const response = await axios.get(url, {
          auth: {
            username: username || facetsUserName || '',
            password: accessToken || facetsAccessToken || '',
          },
        });
        return { data: response.data };
      } catch (error: any) {
        logger.error('Error fetching release impacts', error);
        return null;
      }
    },

    async getEnvironments({ project, username, accessToken }) {
      const url = `${facetsCpUrl}/cc-ui/v1/stacks/${project}/clusters-overview`;

      try {
        const response = await axios.get(url, {
          auth: {
            username: username || facetsUserName || '',
            password: accessToken || facetsAccessToken || '',
          },
        });
        return response.data;
      } catch (error: any) {
        logger.error('Error', error);
        return [];
      }
    },

    async getEnvironmentOverviewForResource({
      project,
      resourceType,
      resourceName,
      username,
      accessToken,
    }) {
      const url = `${facetsCpUrl}/cc-ui/v1/dropdown/${encodeURIComponent(
        String(project),
      )}/resourceType/${encodeURIComponent(
        String(resourceType),
      )}/resourceName/${encodeURIComponent(
        String(resourceName),
      )}/resource-history-overview`;
      try {
        const response = await axios.get(url, {
          auth: {
            username: username || facetsUserName || '',
            password: accessToken || facetsAccessToken || '',
          },
        });
        return response.data;
      } catch (error: any) {
        logger.error('Error', error);
        return [];
      }
    },

    async getProject(name, username, accessToken) {
      const url = `${facetsCpUrl}/cc-ui/v1/stacks/${encodeURIComponent(
        String(name),
      )}`;
      try {
        const response = await axios.get(url, {
          auth: {
            username: username || facetsUserName || '',
            password: accessToken || facetsAccessToken || '',
          },
        });
        return response.data;
      } catch (error: any) {
        logger.error('Error', error);
        return null;
      }
    },
  };
}
