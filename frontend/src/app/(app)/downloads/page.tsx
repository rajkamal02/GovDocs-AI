'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/ui';
import { useApi, useQuery } from '@/lib/hooks';
import type { Activity } from '@/lib/types';
import { ago } from '@/lib/util';

const TABS: [string, string, string][] = [['', 'All', ''], ['generate', 'Generated files', 'generate'], ['download', 'Downloads', 'download'], ['package', 'Packages', 'package'], ['upload', 'Uploads', 'upload'], ['share', 'Shares', 'share']];
const ICON: Record<string, string> = { upload: '⬆️', download: '⬇️', generate: '⚡', package: '📦', share: '🔗', ai: '🤖', delete: '🗑️' };

export default function Downloads() {
  const api = useApi(), [tab, setTab] = useState('');
  const { data, loading, error, reload } = useQuery<Activity[]>(`/activity?limit=300${tab ? `&kind=${tab}` : ''}`);
  const clear = async () => { if (!confirm('Clear your whole history? Files are not deleted.')) return; await api.del('/activity'); toast.success('History cleared'); reload(); };
  return (
    <>
      <PageHeader title="Downloads & History" sub="Everything you generated, converted, downloaded and shared" actions={<Button variant="secondary" onClick={clear}>Clear history</Button>} />
      <div className="mb-4 flex gap-2 overflow-x-auto">{TABS.map(([k, l]) => <button key={l} onClick={() => setTab(k)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${tab === k ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200'}`}>{l}</button>)}</div>
      {error ? <ErrorBox text={error} retry={reload} /> : loading && !data ? <Loading /> : !data?.length ? <Card><Empty icon="📥" title="Nothing here yet" text="Files you prepare and download will be listed here." /></Card> : (
        <Card className="divide-y divide-slate-100">{data.map((a) => <div key={a.id} className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">{ICON[a.kind] || '•'}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{a.message}</div><div className="text-xs capitalize text-slate-400">{a.kind}</div></div><div className="shrink-0 text-xs text-slate-400">{ago(a.createdAt)}</div></div>)}</Card>
      )}
    </>
  );
}
