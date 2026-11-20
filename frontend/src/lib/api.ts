export const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function msg(j: any, status: number) {
  const m = j?.message;
  return Array.isArray(m) ? m.join(', ') : m || (status === 401 ? 'Please sign in again.' : status === 429 ? 'Too many requests. Wait a minute and try again.' : `Something went wrong (${status}).`);
}

export async function request<T = any>(path: string, o: { method?: string; body?: any; form?: FormData; token?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (o.token) headers.Authorization = `Bearer ${o.token}`;
  let body: any;
  if (o.form) body = o.form; else if (o.body !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(o.body); }
  let res: Response;
  try { res = await fetch(API + path, { method: o.method || 'GET', headers, body, cache: 'no-store' }); }
  catch { throw new Error('Cannot reach the server. Is the backend running on port 4000?'); }
  const text = await res.text();
  let j: any = null; try { j = text ? JSON.parse(text) : null; } catch { /* not json */ }
  if (!res.ok) throw new Error(msg(j, res.status));
  return j as T;
}

/** Upload with a real progress bar (fetch cannot report upload progress). */
export function uploadXhr<T = any>(path: string, form: FormData, token: string | null, onProgress: (pct: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', API + path);
    if (token) x.setRequestHeader('Authorization', `Bearer ${token}`);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => { let j: any = null; try { j = JSON.parse(x.responseText); } catch { /* */ } x.status < 300 ? resolve(j) : reject(new Error(msg(j, x.status))); };
    x.onerror = () => reject(new Error('Upload failed. Check your connection and that the backend is running.'));
    x.send(form);
  });
}
