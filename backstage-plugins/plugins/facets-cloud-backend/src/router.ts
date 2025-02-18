import {
  HttpAuthService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { FacetsApisService } from './services/FacetsApiService/types';

export async function createRouter({
  httpAuth,
  facetsApiService,
  userInfo,
}: {
  httpAuth: HttpAuthService;
  facetsApiService: FacetsApisService;
  userInfo: UserInfoService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const facetsConfigSchema = z.object({
    facets_username: z.string(),
    facets_accessToken: z.string(),
  });

  router.post('/credentials', async (req, res) => {
    const parsed = facetsConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    try {
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const info = await userInfo.getUserInfo(credentials);
      // Call the service to save the user credentials
      const result = await facetsApiService.saveUserCredentials({
        username: info.userEntityRef,
        facets_username: parsed.data.facets_username,
        facets_accessToken: parsed.data.facets_accessToken,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save user credentials' });
    }
  });

  router.get('/credentials', async (req, res) => {
    try {
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const info = await userInfo.getUserInfo(credentials);
      const result = await facetsApiService.getUserCredentials(
        info.userEntityRef,
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user credentials' });
    }
  });

  // Route for fetching release impacts
  router.get(
    '/environments/:clusterId/resourceType/:resourceType/resourceName/:resourceName/releases',
    async (req, res) => {
      const { clusterId, resourceType, resourceName } = req.params;
      const {
        triggeredBy,
        start,
        end,
        releaseType,
        pageSize,
        pageNumber,
        changeType,
        attribute,
      } = req.query as Record<string, string | undefined>;

      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const info = await userInfo.getUserInfo(credentials);
      const { facets_username: username, facets_accessToken: accessToken } =
        await facetsApiService.getUserCredentials(info.userEntityRef);

      const result = await facetsApiService.getReleaseImpacts({
        clusterId,
        resourceType,
        resourceName,
        triggeredBy,
        start,
        end,
        releaseType,
        pageSize: pageSize ? Number(pageSize) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        changeType,
        attribute,
        username,
        accessToken,
      });

      res.json(result);
    },
  );

  // Route for triggering a new release
  router.get(
    '/environments/:clusterId/resourceType/:resourceType/resourceName/:resourceName/release',
    async (req, res) => {
      const { clusterId, resourceType, resourceName } = req.params;

      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const info = await userInfo.getUserInfo(credentials);
      const { facets_username: username, facets_accessToken: accessToken } =
        await facetsApiService.getUserCredentials(info.userEntityRef);

      const result = await facetsApiService.triggerRelease({
        clusterId,
        resourceType,
        resourceName,
        username,
        accessToken,
      });

      res.json(result);
    },
  );

  // Route for fetching resource out properties
  router.get(
    '/environments/:clusterId/resourceType/:resourceType/resourceName/:resourceName/resource-out-properties',
    async (req, res) => {
      const { clusterId, resourceType, resourceName } = req.params;
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const info = await userInfo.getUserInfo(credentials);
      const { facets_username: username, facets_accessToken: accessToken } =
        await facetsApiService.getUserCredentials(info.userEntityRef);
      const result = await facetsApiService.getResourceOutProperties({
        clusterId,
        resourceType,
        resourceName,
        username,
        accessToken,
      });

      res.json(result);
    },
  );

  router.get('/projects/:project/environments', async (req, res) => {
    const { project } = req.params;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const info = await userInfo.getUserInfo(credentials);
    const { facets_username: username, facets_accessToken: accessToken } =
      await facetsApiService.getUserCredentials(info.userEntityRef);
    const result = await facetsApiService.getEnvironments({
      project,
      username,
      accessToken,
    });
    res.json(result);
  });

  router.get(
    '/projects/:project/resourceType/:resourceType/resourceName/:resourceName/environments/overview',
    async (req, res) => {
      const { project, resourceType, resourceName } = req.params;
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const info = await userInfo.getUserInfo(credentials);
      const { facets_username: username, facets_accessToken: accessToken } =
        await facetsApiService.getUserCredentials(info.userEntityRef);
      const result = await facetsApiService.getEnvironmentOverviewForResource({
        project,
        resourceName,
        resourceType,
        username,
        accessToken,
      });
      res.json(result);
    },
  );

  router.get('/projects/:name', async (req, res) => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const info = await userInfo.getUserInfo(credentials);
    const { facets_username: username, facets_accessToken: accessToken } =
      await facetsApiService.getUserCredentials(info.userEntityRef);
    res.json(
      await facetsApiService.getProject(req.params.name, username, accessToken),
    );
  });
  return router;
}
