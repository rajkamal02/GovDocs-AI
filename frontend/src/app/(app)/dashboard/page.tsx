'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, ErrorBox, Loading, PageHeader, Empty } from '@/components/ui';
import { PreviewModal, SmartDownload, ShareDialog, Thumb, useDocs } from '@/components/shared';
import { useQuery } from '@/lib/hooks';
import type { Activity, Doc } from '@/lib/types';
import { ago, bytes, catOf } from '@/lib/util';

const ICON: Record<string, string> = { upload: '⬆️', download: '⬇️', generate: '⚡', package: '📦', share: '🔗', ai: '🤖', delete: '🗑️' };

export default function Dashboard() {
  const stats = useQuery<any>('/account/stats'), docs = useDocs(), acts = useQuery<Activity[]>('/activity?limit=8'), me = useQuery<any>('/account/me');
  const [prev, setPrev] = useState<Doc | null>(null), [dl, setDl] = useState<Doc | null>(null), [share, setShare] = useState<Doc | null>(null);
  if (stats.error) return <ErrorBox text={stats.error} retry={stats.reload} />;
  if (stats.loading || !stats.data) return <Loading />;
  const s = stats.data;
  const cards = [['🗂️', 'Documents', s.documents, 'in your vault'], ['💾', 'Storage used', bytes(s.bytes), 'no limit'], ['⚡', 'Prepared', s.generatedThisMonth, 'this month'], ['🔗', 'Share links', s.shares, 'created']];
  return (
    <>
      <PageHeader title={`Welcome${me.data?.name ? ', ' + me.data.name.split(' ')[0] : ''} 👋`} sub="Everything for your next application, ready in a few taps." />
      {me.data?.devMode && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Running in <b>local mode</b> (no login). Add Clerk keys to turn on sign-up, OTP and multi-device login. See README.</div>}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([i, t, v, sub]) => <Card key={t as string} className="p-4"><div className="text-2xl">{i}</div><div className="mt-2 font-display text-2xl font-bold">{v}</div><div className="text-sm font-medium">{t}</div><div className="text-xs text-slate-400">{sub}</div></Card>)}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['/upload', '⬆️', 'Upload documents', 'bg-brand-50 text-brand-700'], ['/presets', '🎯', 'Govt presets', 'bg-violet-50 text-violet-700'], ['/ai-tools', '🤖', 'AI tools', 'bg-emerald-50 text-emerald-700'], ['/packages', '📦', 'Build ready ZIP', 'bg-orange-50 text-orange-700']].map(([h, i, t, c]) =>
          <Link key={h} href={h} className={`rounded-2xl p-4 text-center font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${c}`}><div className="mb-1 text-3xl">{i}</div><div className="text-sm">{t}</div></Link>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Recent documents</h2><Link href="/vault" className="text-sm font-semibold text-brand-700">View all →</Link></div>
          {docs.data && docs.data.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {docs.data.slice(0, 8).map((d) => <button key={d.id} onClick={() => setPrev(d)} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"><Thumb d={d} /><div className="p-2.5"><div className="truncate text-sm font-medium">{d.name}</div><div className="text-xs text-slate-400">{catOf(d.category).label} · {bytes(d.size)}</div></div></button>)}
            </div>
          ) : <Card><Empty icon="📂" title="No documents yet" text="Upload your photo, signature and ID once. Use them for every application." action={<Link href="/upload" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Upload now</Link>} /></Card>}
        </div>
        <Card className="h-fit p-4">
          <h2 className="mb-3 font-display text-lg font-bold">Recent activity</h2>
          {acts.data?.length ? <ul className="space-y-3">{acts.data.map((a) => <li key={a.id} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm">{ICON[a.kind] || '•'}</span><div className="min-w-0"><div className="truncate text-sm">{a.message}</div><div className="text-xs text-slate-400">{ago(a.createdAt)}</div></div></li>)}</ul> : <p className="py-6 text-center text-sm text-slate-400">Nothing yet.</p>}
        </Card>
      </div>
      {prev && <PreviewModal doc={prev} onClose={() => setPrev(null)} onSmart={() => { setDl(prev); setPrev(null); }} onShare={() => { setShare(prev); setPrev(null); }} />}
      {dl && <SmartDownload doc={dl} onClose={() => setDl(null)} />}
      {share && <ShareDialog target={{ documentId: share.id, docs: docs.data || [] }} onClose={() => setShare(null)} />}
    </>
  );
}
