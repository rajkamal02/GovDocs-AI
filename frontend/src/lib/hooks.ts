'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { request, uploadXhr } from './api';
import { useToken } from './auth';

export function useApi() {
  const getToken = useToken();
  return useMemo(() => {
    const call = async (path: string, o: any = {}) => request(path, { ...o, token: await getToken() });
    return {
      get: <T = any>(p: string) => call(p) as Promise<T>,
      post: <T = any>(p: string, body?: any) => call(p, { method: 'POST', body: body ?? {} }) as Promise<T>,
      patch: <T = any>(p: string, body: any) => call(p, { method: 'PATCH', body }) as Promise<T>,
      del: <T = any>(p: string) => call(p, { method: 'DELETE' }) as Promise<T>,
      form: <T = any>(p: string, form: FormData) => call(p, { method: 'POST', form }) as Promise<T>,
      upload: async <T = any>(p: string, form: FormData, onProgress: (n: number) => void) => uploadXhr<T>(p, form, await getToken(), onProgress),
    };
  }, [getToken]);
}

export function useQuery<T = any>(path: string | null) {
  const api = useApi();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    if (!path) { setLoading(false); return; }
    setLoading(true);
    try { setData(await api.get<T>(path)); setError(''); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [api, path]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}
