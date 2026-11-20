'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, ErrorBox, Loading, PageHeader } from '@/components/ui';
import { useApi, useQuery } from '@/lib/hooks';
import { API } from '@/lib/api';
import { bytes, catOf } from '@/lib/util';

const Row = ({ k, v, ok }: { k: string; v: string; ok?: boolean }) => <div className="flex items-center justify-between gap-3 py-2 text-sm"><span className="text-slate-600">{k}</span><span className={`font-semibold ${ok === false ? 'text-amber-600' : ok ? 'text-emerald-600' : ''}`}>{v}</span></div>;

export default function Settings() {
  const api = useApi(), me = useQuery<any>('/account/me'), stats = useQuery<any>('/account/stats'), [health, setHealth] = useState<any>(null), [busy, setBusy] = useState('');
  const loadHealth = async () => { try { setHealth(await (await fetch(API + '/health')).json()); } catch { setHealth({ error: true }); } };
  if (!health) loadHealth();
  if (stats.error) return <ErrorBox text={stats.error} retry={stats.reload} />;
  if (stats.loading || !stats.data) return <Loading />;
  const s = stats.data, h = health || {};

  const exportAll = async () => { setBusy('export'); try { const r = await api.post<{ url: string }>('/account/export'); window.location.href = r.url + '?dl=1'; } catch (e: any) { toast.error(e.message); } finally { setBusy(''); } };
  const wipe = async () => { if (!confirm('Permanently delete ALL your documents and share links? This cannot be undone.')) return; await api.del('/account/documents'); toast.success('All documents deleted'); stats.reload(); };
  const kill = async () => { if (!confirm('Delete your account data permanently?') || !confirm('Really sure? Everything will be erased.')) return; await api.del('/account'); toast.success('Account data deleted'); window.location.href = '/'; };

  return (
    <>
      <PageHeader title="Settings" sub="Your data, your control" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h2 className="mb-2 font-display font-bold">Account</h2><div className="divide-y divide-slate-100"><Row k="Name" v={me.data?.name || '—'} /><Row k="Email" v={me.data?.email || '—'} /><Row k="Login" v={me.data?.devMode ? 'Local mode (no login)' : 'Secure sign-in (Clerk)'} /></div></Card>
        <Card className="p-5">
          <h2 className="mb-2 font-display font-bold">Storage</h2>
          <div className="mb-3 flex items-end justify-between"><div className="font-display text-3xl font-bold">{bytes(s.bytes)}</div><div className="text-sm text-slate-500">{s.documents} files · no limit</div></div>
          <div className="space-y-2">{s.byCategory.map((c: any) => <div key={c.category} className="flex items-center gap-2 text-xs"><span className="w-28 truncate">{catOf(c.category).icon} {catOf(c.category).label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: Math.max(3, (c.bytes / Math.max(1, s.bytes)) * 100) + '%', background: catOf(c.category).color }} /></div><span className="w-16 text-right text-slate-500">{bytes(c.bytes)}</span></div>)}</div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-2 font-display font-bold">Privacy & security</h2>
          <ul className="space-y-1.5 text-sm text-slate-600"><li>🔒 Files are AES-256-GCM encrypted before they are stored.</li><li>🛡️ Originals are never modified.</li><li>🗑️ Processed copies are deleted right after download (or within {h.tempTtlMinutes || 60} min).</li><li>🔗 Download links are signed and expire quickly.</li><li>🤖 Images are {h.aiImages ? <b className="text-amber-600">sent to AI (turned on)</b> : <b>never sent to any AI</b>}.</li></ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-2 font-display font-bold">System status</h2>
          {!health ? <div className="py-4 text-sm text-slate-400">Checking…</div> : h.error ? <div className="text-sm text-red-600">Cannot reach the backend.</div> : <div className="divide-y divide-slate-100">
            <Row k="Database" v={h.db} /><Row k="File storage" v={h.storage} /><Row k="Max file size" v={`${h.maxFileMB} MB`} />
            <Row k="Strong PDF compression (Ghostscript)" v={h.ghostscript ? 'Ready' : 'Not installed'} ok={h.ghostscript} /><Row k="DOCX conversion (LibreOffice)" v={h.libreoffice ? 'Ready' : 'Not installed'} ok={h.libreoffice} /><Row k="AI (Gemini)" v={h.ai ? 'Connected' : 'Off (built-in rules)'} ok={h.ai} />
          </div>}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-display font-bold">Your data</h2>
          <div className="flex flex-wrap gap-2"><Button variant="secondary" loading={busy === 'export'} onClick={exportAll}>📦 Export everything (ZIP)</Button><Button variant="danger" onClick={wipe}>🗑️ Delete all documents</Button><Button variant="danger" onClick={kill}>❌ Delete my account data</Button></div>
        </Card>
      </div>
    </>
  );
}
