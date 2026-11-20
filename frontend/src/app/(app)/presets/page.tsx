'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, ErrorBox, Input, Loading, PageHeader } from '@/components/ui';
import { PresetEditor } from '@/components/PresetEditor';
import { useApi, useQuery } from '@/lib/hooks';
import type { Preset } from '@/lib/types';
import { specText } from '@/lib/util';

export default function Presets() {
  const api = useApi();
  const { data, loading, error, reload } = useQuery<Preset[]>('/presets');
  const [tab, setTab] = useState('All'), [q, setQ] = useState(''), [edit, setEdit] = useState(false);
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  const cats = ['All', ...Array.from(new Set(data.map((p) => p.category)))];
  const list = data.filter((p) => (tab === 'All' || p.category === tab) && (p.name + p.full).toLowerCase().includes(q.toLowerCase()));
  const del = async (p: Preset) => { if (!confirm(`Delete preset "${p.name}"?`)) return; await api.del(`/presets/custom/${p.id}`); reload(); };
  return (
    <>
      <PageHeader title="Government Presets" sub="One tap to match a portal's photo, signature and document rules" actions={<Button onClick={() => setEdit(true)}>➕ Custom preset</Button>} />
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">⚠️ These are typical values. Every recruitment notice can change them. <b>Always compare with the official notification</b>, or paste it into the <Link href="/ai-tools/requirement-detector" className="font-semibold underline">AI Requirement Reader</Link> and save the exact numbers as your own preset.</div>
      <div className="mb-5 flex flex-wrap gap-2"><Input className="max-w-xs" placeholder="Search exam…" value={q} onChange={(e) => setQ(e.target.value)} /><div className="flex gap-2 overflow-x-auto">{cats.map((c) => <button key={c} onClick={() => setTab(c)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${tab === c ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200'}`}>{c}</button>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id} className="flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
            <div className="px-5 py-4" style={{ background: p.color + '12' }}><div className="flex items-start justify-between gap-2"><div><div className="font-display text-xl font-extrabold" style={{ color: p.color }}>{p.name}</div><div className="text-xs text-slate-500">{p.full}</div></div><Badge color={p.color}>{p.category}</Badge></div></div>
            <ul className="flex-1 space-y-2 px-5 py-4 text-xs">{p.slots.map((s) => <li key={s.key} className="flex gap-2"><span>{s.kind === 'photo' ? '📸' : s.kind === 'signature' ? '✍️' : '📄'}</span><span className="font-semibold">{s.label}:</span><span className="text-slate-500">{specText(s.spec)}</span></li>)}</ul>
            <div className="flex gap-2 border-t border-slate-100 p-4"><Link href={`/packages?preset=${p.id}`} className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">📦 Build ready ZIP</Link>{p.custom && <Button variant="danger" onClick={() => del(p)}>🗑️</Button>}</div>
          </Card>
        ))}
      </div>
      {edit && <PresetEditor onClose={() => setEdit(false)} onDone={() => { setEdit(false); reload(); }} />}
    </>
  );
}
