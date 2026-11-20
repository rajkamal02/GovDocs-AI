'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Input, Spinner } from '@/components/ui';
import { request } from '@/lib/api';

export default function PublicShare() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<any>(null), [err, setErr] = useState(''), [pw, setPw] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
  useEffect(() => { request(`/share/public/${token}`).then(setInfo).catch((e) => setErr(e.message)); }, [token]);
  const go = async () => {
    setBusy(true); setErr('');
    try { const r = await request<{ url: string }>(`/share/public/${token}/access`, { method: 'POST', body: { password: pw } }); window.location.href = r.url; setDone(true); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  const bad = info && info.status !== 'active';
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 to-violet-50 p-4">
      <Card className="w-full max-w-md p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-2xl">🏛️</div>
        {!info && !err && <Spinner className="h-6 w-6 text-brand-600" />}
        {!info && err && <><div className="mb-1 text-4xl">🔍</div><h1 className="font-display text-xl font-bold">Link not found</h1><p className="mt-1 text-sm text-slate-500">{err}</p></>}
        {bad && <><div className="mb-1 text-4xl">⛔</div><h1 className="font-display text-xl font-bold">This link is no longer available</h1><p className="mt-1 text-sm text-slate-500">It has {info.status === 'limit' ? 'reached its download limit' : info.status}. Ask the sender for a new one.</p></>}
        {info && !bad && (
          <div className="space-y-4">
            <div><div className="text-sm text-slate-500">Someone shared a file with you</div><h1 className="mt-1 break-words font-display text-xl font-bold">{info.label}</h1></div>
            {info.requiresPassword && <Input type="password" placeholder="Enter password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} autoComplete="off" />}
            {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
            <Button size="lg" className="w-full" loading={busy} disabled={info.requiresPassword && !pw} onClick={go}>{done ? '✅ Downloading…' : '⬇️ Download'}</Button>
            <p className="text-[11px] text-slate-400">Shared securely with GovDocs AI. The link may expire.</p>
          </div>
        )}
      </Card>
    </main>
  );
}
