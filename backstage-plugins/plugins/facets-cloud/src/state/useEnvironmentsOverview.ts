import { useApi, errorApiRef } from '@backstage/core-plugin-api';
import { facetsApiRef } from '../api';
import { useCallback, useEffect, useState } from 'react';

export function useEnvironmentOverview({
  project,
  resourceType,
  resourceName,
}: {
  project: string | undefined;
  resourceType: string | undefined;
  resourceName: string | undefined;
}) {
  const api = useApi(facetsApiRef);
  const errorApi = useApi(errorApiRef);
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (api as any).getEnvironmentOverview({
        project,
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
  }, [api, errorApi, project, resourceName, resourceType]);

  useEffect(() => {
    getOverview().then(b => {
      setOverview(b);
    });
  }, [getOverview]);

  return [
    {
      overview,
      loading,
    },
    {
      getOverview,
    },
  ] as const;
}
