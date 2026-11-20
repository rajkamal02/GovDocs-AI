'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge, Button, Card, Empty, Input, Loading, PageHeader, Select } from '@/components/ui';
import { DocSelect, ShareDialog, useDocs } from '@/components/shared';
import { useApi, useQuery } from '@/lib/hooks';
import type { Preset } from '@/lib/types';
import { bytes, specText } from '@/lib/util';
import Link from 'next/link';

function Inner() {
  const api = useApi(), params = useSearchParams();
  const presets = useQuery<Preset[]>('/presets'), docs = useDocs();
  const [pid, setPid] = useState(params.get('preset') || ''), [map, setMap] = useState<Record<string, string>>({}), [busy, setBusy] = useState(false), [res, setRes] = useState<any>(null), [share, setShare] = useState(false), [gone, setGone] = useState(false);
  const preset = presets.data?.find((p) => p.id === pid);
  useEffect(() => { // pre-select the newest matching document for each requirement
    if (!preset || !docs.data) return;
    const m: Record<string, string> = {};
    preset.slots.forEach((s) => { const d = docs.data!.find((x) => x.category === s.docCategory); if (d) m[s.key] = d.id; });
    setMap(m); setRes(null); setGone(false);
  }, [pid, preset, docs.data]);
  if (presets.loading || docs.loading) return <Loading />;
  const items = Object.entries(map).filter(([, v]) => v).map(([slotKey, documentId]) => ({ slotKey, documentId }));
  const build = async () => { setBusy(true); setRes(null); setGone(false); try { setRes(await api.post('/packages/build', { presetId: pid, items })); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); } };
  const ST: Record<string, string> = { ok: '✅', warning: '⚠️', error: '❌', skipped: '⏭️' };
  return (
    <>
      <PageHeader title="Ready Packages" sub="Pick an exam, match your files, get one ZIP that is ready to upload" />
      <Card className="mb-5 p-5">
        <div className="mb-1 text-xs font-semibold text-slate-600">1. Choose exam / portal</div>
        <Select value={pid} onChange={(e) => setPid(e.target.value)}><option value="">— select —</option>{presets.data?.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.full}</option>)}</Select>
      </Card>
      {!docs.data?.length ? <Card><Empty icon="📂" title="Upload your documents first" text="Add your photo, signature and ID to the vault, then come back." action={<Link href="/upload" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Upload</Link>} /></Card>
      : preset && (
        <Card className="mb-5 divide-y divide-slate-100">
          <div className="p-5 pb-3 text-xs font-semibold text-slate-600">2. Match your files to each requirement</div>
          {preset.slots.map((s) => (
            <div key={s.key} className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr] sm:items-center">
              <div><div className="font-semibold">{s.kind === 'photo' ? '📸' : s.kind === 'signature' ? '✍️' : '📄'} {s.label}</div><div className="text-xs text-slate-500">→ {s.filename}.{s.spec.format} · {specText(s.spec)}</div></div>
              <DocSelect docs={docs.data!} prefer={s.docCategory} value={map[s.key] || ''} onChange={(v) => setMap((m) => ({ ...m, [s.key]: v }))} placeholder="Skip this file" />
            </div>
          ))}
          <div className="p-5"><Button size="lg" className="w-full" loading={busy} disabled={!items.length} onClick={build}>⚡ Build {preset.name.replace(/\s+/g, '_')}_READY.zip</Button></div>
        </Card>
      )}
      {res && (
        <Card className="animate-up p-5">
          <div className="mb-4 flex items-center gap-3"><span className="text-4xl">🎉</span><div><div className="font-display text-lg font-bold">{res.name}</div><div className="text-sm text-slate-500">{bytes(res.size)} · temporary copy, deleted after download</div></div></div>
          <ul className="mb-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {res.report.map((r: any) => <li key={r.key} className="flex flex-wrap items-start gap-3 p-3 text-sm"><span>{ST[r.status]}</span><div className="min-w-0 flex-1"><div className="font-semibold">{r.file || r.label} {r.sizeLabel && <span className="font-normal text-slate-500">· {r.sizeLabel}</span>}</div>{r.source && <div className="text-xs text-slate-400">from {r.source}</div>}{r.warnings?.map((w: string, i: number) => <div key={i} className="mt-1 text-xs text-amber-700">⚠️ {w}</div>)}</div>{r.status === 'skipped' && <Badge>skipped</Badge>}</li>)}
          </ul>
          <div className="flex flex-wrap gap-2">
            <a href={gone ? undefined : res.url + '?dl=1'} onClick={() => setTimeout(() => setGone(true), 400)} className={`inline-flex flex-1 items-center justify-center rounded-xl px-5 py-3 font-semibold text-white ${gone ? 'bg-slate-300' : 'bg-brand-600 hover:bg-brand-700'}`}>{gone ? 'Downloaded' : `⬇️ Download ${res.name}`}</a>
            <Button variant="secondary" onClick={() => setShare(true)}>🔗 Share as link</Button>
          </div>
        </Card>
      )}
      {share && <ShareDialog target={{ recipe: { presetId: pid, items }, label: `${preset?.name} ready package` }} onClose={() => setShare(false)} />}
    </>
  );
}
export default function Packages() { return <Suspense fallback={<Loading />}><Inner /></Suspense>; }
