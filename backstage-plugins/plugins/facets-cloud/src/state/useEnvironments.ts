import { useApi, errorApiRef } from '@backstage/core-plugin-api';
import { facetsApiRef } from '../api';
import { useCallback, useEffect, useState } from 'react';

export function useEnvironments({ project }: { project: string | undefined }) {
  const api = useApi(facetsApiRef);
  const errorApi = useApi(errorApiRef);

  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(false);
  // Initialize selectedEnv with value from localStorage or undefined
  const [selectedEnv, setSelectedEnv] = useState<string | undefined>(
    () => localStorage.getItem('facets_current_env') || undefined,
  );

  const getEnvironments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (api as any).getEnvironments({ project });
      setLoading(false);
      return res;
    } catch (e: any) {
      errorApi.post(e);
      setLoading(false);
      return Promise.reject(e);
    }
  }, [api, errorApi, project]);

  useEffect(() => {
    getEnvironments().then(b => {
      const envs =
        b?.map((env: any) => ({
          id: env?.cluster?.id,
          name: env?.cluster?.name,
        })) || [];

      setEnvironments(envs);
      // Validate the selectedEnv or default to the first environment
      if (envs.length > 0) {
        const isStoredEnvValid = envs.some(
          (env: any) => env.id === selectedEnv,
        );
        if (!isStoredEnvValid) {
          const firstEnv = envs[0]?.id;
          setSelectedEnv(firstEnv);
          localStorage.setItem('facets_current_env', firstEnv); // Update localStorage
        }
      }
    });
  }, [getEnvironments, selectedEnv]);

  const selectEnvironment = (envId: string) => {
    setSelectedEnv(envId);
  };

  return [
    {
      environments,
      loading,
      selectedEnv,
    },
    {
      getEnvironments,
      selectEnvironment,
    },
  ] as const;
}
