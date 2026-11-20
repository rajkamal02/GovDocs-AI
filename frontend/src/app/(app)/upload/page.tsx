'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, PageHeader, Select, Spinner } from '@/components/ui';
import { CategorySelect } from '@/components/shared';
import { useApi, useQuery } from '@/lib/hooks';
import type { Folder } from '@/lib/types';
import { bytes, catOf, fileIcon } from '@/lib/util';

interface Item { id: string; file: File; name: string; category: string; detected: string; detecting: boolean; progress: number; status: 'ready' | 'uploading' | 'done' | 'error'; error?: string }
const OK = /\.(pdf|jpe?g|png|webp|docx)$/i;

export default function UploadPage() {
  const api = useApi();
  const folders = useQuery<Folder[]>('/folders');
  const [items, setItems] = useState<Item[]>([]), [drag, setDrag] = useState(false), [folderId, setFolderId] = useState(''), [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const patch = (id: string, p: Partial<Item>) => setItems((x) => x.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const add = (list: FileList | File[]) => {
    const files = Array.from(list).filter((f) => { if (!OK.test(f.name)) { toast.error(`"${f.name}" is not supported. Use PDF, JPG, PNG, WEBP or DOCX.`); return false; } return true; });
    const fresh: Item[] = files.map((file) => ({ id: Math.random().toString(36).slice(2), file, name: file.name, category: 'OTHER', detected: '', detecting: true, progress: 0, status: 'ready' }));
    setItems((x) => [...x, ...fresh]);
    fresh.forEach(async (it) => {
      try { const f = new FormData(); f.append('file', it.file); const r = await api.form<{ category: string; source: string }>('/documents/detect', f); patch(it.id, { category: r.category, detected: r.source, detecting: false }); }
      catch { patch(it.id, { detecting: false }); }
    });
  };

  const run = async () => {
    setBusy(true);
    for (const it of items.filter((i) => i.status !== 'done')) {
      patch(it.id, { status: 'uploading', progress: 0, error: undefined });
      try {
        const f = new FormData(); f.append('files', it.file); f.append('categories', JSON.stringify([it.category])); f.append('names', JSON.stringify([it.name]));
        if (folderId) f.append('folderId', folderId);
        await api.upload('/documents', f, (p) => patch(it.id, { progress: p }));
        patch(it.id, { status: 'done', progress: 100 });
      } catch (e: any) { patch(it.id, { status: 'error', error: e.message }); }
    }
    setBusy(false);
    toast.success('Upload finished');
  };
  const pending = items.filter((i) => i.status !== 'done').length, done = items.filter((i) => i.status === 'done').length;

  return (
    <>
      <PageHeader title="Upload Center" sub="PDF, JPG, PNG, WEBP, DOCX · no limit on how many · encrypted on arrival" />
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }} onClick={() => ref.current?.click()}
        className={`mb-6 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition sm:p-14 ${drag ? 'border-brand-600 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-200'}`}>
        <div className="mb-3 text-6xl">{drag ? '⬇️' : '☁️'}</div>
        <div className="font-display text-xl font-bold">{drag ? 'Drop to add' : 'Drag & drop files here'}</div>
        <div className="mt-1 text-sm text-slate-500">or tap to choose from your phone / computer</div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">{['PDF', 'JPG', 'PNG', 'WEBP', 'DOCX'].map((x) => <Badge key={x}>{x}</Badge>)}</div>
        <input ref={ref} type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.webp,.docx" onChange={(e) => { e.target.files && add(e.target.files); e.target.value = ''; }} />
      </div>

      {items.length > 0 && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="font-display font-bold">{items.length} file{items.length > 1 ? 's' : ''} · {done} uploaded</div>
            <div className="flex items-center gap-2"><span className="text-xs text-slate-500">Save into</span><Select className="w-auto py-2" value={folderId} onChange={(e) => setFolderId(e.target.value)}><option value="">Automatic folder</option>{folders.data?.map((f) => <option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}</Select></div>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((it) => (
              <div key={it.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: catOf(it.category).color + '1a' }}>{fileIcon({ mimeType: it.file.type || (it.file.name.endsWith('.pdf') ? 'application/pdf' : 'image/') })}</div>
                <div className="min-w-[160px] flex-1">
                  <Input className="py-1.5" value={it.name} disabled={it.status !== 'ready'} onChange={(e) => patch(it.id, { name: e.target.value })} />
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                    <span>{bytes(it.file.size)}</span>
                    {it.status === 'uploading' && <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-600 transition-all" style={{ width: it.progress + '%' }} /></div>}
                    {it.status === 'done' && <span className="font-semibold text-emerald-600">✅ Uploaded</span>}
                    {it.status === 'error' && <span className="font-semibold text-red-600">⚠️ {it.error}</span>}
                    {it.detecting && <span className="flex items-center gap-1"><Spinner className="h-3 w-3" /> detecting…</span>}
                    {!it.detecting && it.detected && it.status === 'ready' && <span className="text-brand-700">Detected: {catOf(it.category).label} ({it.detected})</span>}
                  </div>
                </div>
                <CategorySelect className="w-44 py-2" value={it.category} onChange={(v) => patch(it.id, { category: v })} />
                {it.status === 'ready' && <button onClick={() => setItems((x) => x.filter((i) => i.id !== it.id))} aria-label="Remove" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">✕</button>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-slate-100 p-4">
            <Button className="flex-1" size="lg" loading={busy} disabled={!pending} onClick={run}>⬆️ Upload {pending} file{pending === 1 ? '' : 's'}</Button>
            {done > 0 && <Link href="/vault" className="inline-flex items-center rounded-xl border border-slate-200 px-5 text-sm font-semibold hover:border-brand-200">Open vault</Link>}
          </div>
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-3">{[['🔒', 'Encrypted', 'Each file is AES-256 encrypted before it is saved.'], ['🧠', 'Auto-detected', 'Type is guessed from the name and image shape. You can change it.'], ['🔎', 'Searchable', 'Text inside PDFs and photos is indexed so you can search it.']].map(([i, t, d]) => <Card key={t} className="flex gap-3 p-4"><span className="text-2xl">{i}</span><div><div className="text-sm font-semibold">{t}</div><div className="text-xs text-slate-500">{d}</div></div></Card>)}</div>
    </>
  );
}
