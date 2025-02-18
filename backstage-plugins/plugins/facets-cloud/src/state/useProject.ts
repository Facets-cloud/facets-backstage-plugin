import { useApi, errorApiRef } from '@backstage/core-plugin-api';
import { facetsApiRef } from '../api';
import { useCallback, useEffect, useState } from 'react';

export function useProject({ name }: { name: string | undefined }) {
  const api = useApi(facetsApiRef);
  const errorApi = useApi(errorApiRef);

  const [project, setProject] = useState();
  const [vcsUrl, setVcsUrl] = useState();

  const getProject = useCallback(async () => {
    try {
      return await (api as any).getProject(name);
    } catch (e: any) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  }, [api, errorApi, name]);

  useEffect(() => {
    if (name) {
      getProject().then(b => {
        setProject(b);
        setVcsUrl(b?.vcsUrl?.slice(0, -4));
      });
    }
  }, [getProject, name]);

  return [
    {
      project,
      vcsUrl,
    },
    {
      getProject,
    },
  ] as const;
}
