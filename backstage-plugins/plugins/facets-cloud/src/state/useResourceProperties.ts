import { useApi, errorApiRef } from '@backstage/core-plugin-api';
import { facetsApiRef } from '../api';
import { useCallback, useEffect, useState } from 'react';

export interface ResourceOutPropertiesResponse {
  attributes?: {};
  clusterId?: string;
  id?: string;
  interfaces?: {};
  resourceName?: string;
  resourceType?: string;
  updatedAt?: string;
}

export function useResourceProperties({
  environmentId,
  resourceType,
  resourceName,
}: {
  environmentId: string | undefined;
  resourceType: string | undefined;
  resourceName: string | undefined;
}) {
  const api = useApi(facetsApiRef);
  const errorApi = useApi(errorApiRef);
  const [interfaces, setInterfaces] = useState<any>();
  const [attributes, setAttributes] = useState<any>();
  const [loading, setLoading] = useState(true);

  const getResourceProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (api as any).getResourceProperties({
        environmentId,
        resourceType,
        resourceName,
      });
      setLoading(false);
      return res;
    } catch (e: any) {
      errorApi.post(e);
      setLoading(false);
      return Promise.reject(e);
    }
  }, [api, environmentId, errorApi, resourceName, resourceType]);

  useEffect(() => {
    getResourceProperties().then(b => {
      const res = b?.data;
      setInterfaces(res?.interfaces || {});
      setAttributes(res?.attributes || {});
    });
  }, [getResourceProperties]);

  return [
    {
      attributes,
      interfaces,
      loading,
    },
    {
      getResourceProperties,
    },
  ] as const;
}
