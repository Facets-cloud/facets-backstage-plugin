import { useApi, errorApiRef, alertApiRef } from '@backstage/core-plugin-api';
import { facetsApiRef } from '../api';
import { useCallback, useEffect, useState } from 'react';

export function useReleases({
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
  const alert = useApi(alertApiRef);

  const [releases, setReleases] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cpUrl, setCpUrl] = useState('');

  const getReleases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (api as any).getReleases({
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
    getReleases().then(b => {
      setReleases(b?.data?.content);
      setTotalPages(b?.data?.totalPages);
      setTotalElements(b?.data?.totalElements);
      setCpUrl(b?.facetsCpUrl);
    });
  }, [getReleases]);

  const triggerRelease = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (api as any).triggerRelease({
        environmentId,
        resourceType,
        resourceName,
      });
      setLoading(false);
      alert.post({
        message: 'Release Triggered',
        severity: 'success',
        display: 'transient',
      });
      return res;
    } catch (e: any) {
      errorApi.post(e);
      setLoading(false);
      return Promise.reject(e);
    }
  }, [api, environmentId, errorApi, resourceName, resourceType]);

  return [
    {
      releases,
      totalPages,
      totalElements,
      loading,
      cpUrl,
    },
    {
      getReleases,
      triggerRelease,
    },
  ] as const;
}
