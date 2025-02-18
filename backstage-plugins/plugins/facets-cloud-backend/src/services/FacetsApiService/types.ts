export interface ReleaseImpactRequestParams {
  clusterId: string;
  resourceType: string;
  resourceName: string;
  triggeredBy?: string;
  start?: string;
  end?: string;
  releaseType?: string;
  pageSize?: number;
  pageNumber?: number;
  changeType?: string;
  attribute?: string;
  username: string;
  accessToken: string;
}

export interface ResourceOutPropertiesRequestParams {
  clusterId: string;
  resourceType: string;
  resourceName: string;
  username: string;
  accessToken: string;
}

export interface ResourceOutPropertiesResponse {
  attributes?: {};
  clusterId?: string;
  id?: string;
  interfaces?: {};
  resourceName?: string;
  resourceType?: string;
  updatedAt?: string;
}

export interface FacetsApisService {
  saveUserCredentials(input: {
    username: string;
    facets_username: string;
    facets_accessToken: string;
  }): Promise<any>;

  getUserCredentials(
    username: string,
  ): Promise<{ facets_username: string; facets_accessToken: string }>;

  getReleaseImpacts(params: ReleaseImpactRequestParams): Promise<any>;

  triggerRelease({
    clusterId,
    resourceType,
    resourceName,
    username,
    accessToken,
  }: {
    clusterId: string;
    resourceType: string;
    resourceName: string;
    username: string;
    accessToken: string;
  }): Promise<any>;

  getResourceOutProperties(
    params: ResourceOutPropertiesRequestParams,
  ): Promise<any>;

  getEnvironments({
    project,
    username,
    accessToken,
  }: {
    project: string;
    username: string;
    accessToken: string;
  }): Promise<any[]>;

  getEnvironmentOverviewForResource({
    project,
    resourceType,
    resourceName,
    username,
    accessToken,
  }: {
    project: string;
    resourceType: string;
    resourceName: string;
    username: string;
    accessToken: string;
  }): Promise<any>;

  getProject(name: string, username: string, accessToken: string): Promise<any>;
}
