import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
  ConfigApi,
} from '@backstage/core-plugin-api';

/** @public */
export const facetsApiRef = createApiRef({
  id: 'plugin.facets.service',
});

/** @public */
export class FacetsApi {
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    configApi: ConfigApi;
  }) {
    this.fetchApi = options.fetchApi;
    this.configApi = options.configApi;
  }

  async getReleases({
    environmentId,
    resourceType,
    resourceName,
  }: {
    environmentId: string;
    resourceType: string;
    resourceName: string;
  }) {
    try {
      const url = this.getApiUrl(
        `/environments/${environmentId}/resourceType/${resourceType}/resourceName/${resourceName}/releases`,
      );
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to fetch releases');
    }
  }

  async getResourceProperties({
    environmentId,
    resourceType,
    resourceName,
  }: {
    environmentId: string;
    resourceType: string;
    resourceName: string;
  }) {
    try {
      const url = this.getApiUrl(
        `/environments/${environmentId}/resourceType/${resourceType}/resourceName/${resourceName}/resource-out-properties`,
      );
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(
        error.message || 'Unable to fetch resource our properties',
      );
    }
  }

  async triggerRelease({
    environmentId,
    resourceType,
    resourceName,
  }: {
    environmentId: string;
    resourceType: string;
    resourceName: string;
  }) {
    try {
      const url = this.getApiUrl(
        `/environments/${environmentId}/resourceType/${resourceType}/resourceName/${resourceName}/release`,
      );
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to release');
    }
  }

  async getEnvironments({ project }: { project: string }) {
    try {
      const url = this.getApiUrl(`/projects/${project}/environments`);
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to fetch environments');
    }
  }

  async getEnvironmentOverview({
    project,
    resourceType,
    resourceName,
  }: {
    project: string;
    resourceType: string;
    resourceName: string;
  }) {
    try {
      if (!(project && resourceType && resourceName)) {
        throw new Error('Missing project and resource details');
      }
      const url = this.getApiUrl(
        `/projects/${project}/resourceType/${resourceType}/resourceName/${resourceName}/environments/overview`,
      );
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to fetch environment overview');
    }
  }

  async getProject(name: string) {
    try {
      const url = this.getApiUrl(`/projects/${name}`);
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to fetch project details');
    }
  }

  async getUserConfig() {
    try {
      const url = this.getApiUrl(`/credentials`);
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to fetch user configurations');
    }
  }

  async saveUserConfig({
    facets_username,
    facets_accessToken,
  }: {
    facets_username: string;
    facets_accessToken: string;
  }) {
    try {
      const url = this.getApiUrl(`/credentials`);
      const response = await this.fetchApi.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Ensure the server knows you're sending JSON
        },
        body: JSON.stringify({ facets_username, facets_accessToken }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Unable to save user configurations');
    }
  }

  private getApiUrl(endpoint: string) {
    return `${this.configApi.getString(
      'backend.baseUrl',
    )}/api/facets-cloud${endpoint}`;
  }
}
