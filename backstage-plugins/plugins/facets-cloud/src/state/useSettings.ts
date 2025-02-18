import { useApi, errorApiRef, alertApiRef } from '@backstage/core-plugin-api';
import { facetsApiRef } from '../api';
import { useCallback, useEffect, useState } from 'react';

export function useSettings() {
  const logger = console;
  const api = useApi(facetsApiRef);
  const errorApi = useApi(errorApiRef);
  const alert = useApi(alertApiRef);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{
    facets_username: string;
    facets_accessToken: string;
  }>();

  const getUserCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (api as any).getUserConfig();
      setLoading(false);
      return res;
    } catch (e: any) {
      errorApi.post(e);
      setLoading(false);
      return Promise.reject(e);
    }
  }, [api, errorApi]);

  const saveUserCredentials = useCallback(
    async (credentialsToUpdate: {
      facets_username: string;
      facets_accessToken: string;
    }) => {
      try {
        setLoading(true);
        const res = await (api as any).saveUserConfig(credentialsToUpdate);
        setLoading(false);
        alert.post({
          message: 'Updated Credentials',
          severity: 'success',
          display: 'transient',
        });
        return res;
      } catch (e: any) {
        errorApi.post(e);
        setLoading(false);
        return Promise.reject(e);
      }
    },
    [alert, api, errorApi],
  );

  useEffect(() => {
    getUserCredentials().then(b => {
      setCredentials(b);
    });
  }, [logger, getUserCredentials]);

  return [
    {
      credentials,
      loading,
    },
    {
      getUserCredentials,
      saveUserCredentials,
    },
  ] as const;
}
