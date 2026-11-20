'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Badge, Button, Card, Empty, ErrorBox, Field, Input, Loading, Modal, PageHeader, Select } from '@/components/ui';
import { CategorySelect, PreviewModal, ShareDialog, SmartDownload, Thumb } from '@/components/shared';
import { useApi, useQuery } from '@/lib/hooks';
import type { Doc, Folder } from '@/lib/types';
import { bytes, catOf, CATS, date, fileIcon } from '@/lib/util';

export default function Vault() {
  const api = useApi();
  const [search, setSearch] = useState(''), [q, setQ] = useState(''), [cat, setCat] = useState(''), [folder, setFolder] = useState(''), [sort, setSort] = useState('date_desc'), [view, setView] = useState<'grid' | 'list'>('grid');
  useEffect(() => { const t = setTimeout(() => setQ(search), 300); return () => clearTimeout(t); }, [search]);
  const qs = new URLSearchParams({ ...(q && { search: q }), ...(cat && { category: cat }), ...(folder && { folderId: folder }), sort }).toString();
  const docs = useQuery<Doc[]>(`/documents?${qs}`), folders = useQuery<Folder[]>('/folders'), all = useQuery<Doc[]>('/documents');
  const [prev, setPrev] = useState<Doc | null>(null), [smart, setSmart] = useState<Doc | null>(null), [share, setShare] = useState<Doc | null>(null), [edit, setEdit] = useState<Doc | null>(null), [folderModal, setFolderModal] = useState<Folder | 'new' | null>(null);
  const [drag, setDrag] = useState(false), [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => { docs.reload(); folders.reload(); all.reload(); };
  const remove = async (d: Doc) => { if (!confirm(`Delete "${d.name}" permanently? Share links to it will stop working.`)) return; try { await api.del(`/documents/${d.id}`); toast.success('Deleted'); refresh(); } catch (e: any) { toast.error(e.message); } };
  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files); if (!list.length) return; setUploading(true);
    try { const f = new FormData(); list.forEach((x) => f.append('files', x)); if (folder) f.append('folderId', folder); await api.form('/documents', f); toast.success(`${list.length} file${list.length > 1 ? 's' : ''} uploaded`); refresh(); } catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };
  const total = all.data?.length || 0;

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={(e) => e.currentTarget === e.target && setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }} className="relative min-h-[60vh]">
      {drag && <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-brand-600/10"><div className="rounded-3xl border-4 border-dashed border-brand-600 bg-white px-10 py-8 text-xl font-bold text-brand-700">Drop files to upload</div></div>}
      <PageHeader title="My Documents" sub={`${total} file${total === 1 ? '' : 's'} · encrypted · originals are never modified`} actions={<><input ref={fileRef} type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.webp,.docx" onChange={(e) => e.target.files && upload(e.target.files)} /><Button onClick={() => fileRef.current?.click()} loading={uploading}>⬆️ Quick upload</Button><Link href="/upload" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:border-brand-200">Upload center</Link></>} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">🔍</span><Input className="pl-9" placeholder="Search names and text inside PDFs / photos…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select className="w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All types</option>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</Select>
        <Select className="w-auto" value={sort} onChange={(e) => setSort(e.target.value)}><option value="date_desc">Newest</option><option value="date_asc">Oldest</option><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="size_desc">Largest</option><option value="size_asc">Smallest</option></Select>
        <div className="flex rounded-xl bg-slate-100 p-1">{(['grid', 'list'] as const).map((v) => <button key={v} onClick={() => setView(v)} aria-label={v} className={clsx('rounded-lg px-3 text-lg', view === v ? 'bg-white shadow' : 'text-slate-500')}>{v === 'grid' ? '⊞' : '☰'}</button>)}</div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[{ id: '', name: 'All files', icon: '📁', count: total }, ...(folders.data || [])].map((f: any) => (
          <button key={f.id || 'all'} onClick={() => setFolder(f.id)} onDoubleClick={() => f.id && setFolderModal(f)} title={f.id ? 'Double-click to rename or delete' : ''} className={clsx('flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition', folder === f.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200')}>{f.icon || '📁'} {f.name}<span className={folder === f.id ? 'text-white/70' : 'text-slate-400'}>{f.count}</span></button>
        ))}
        <button onClick={() => setFolderModal('new')} className="shrink-0 rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:text-brand-700">➕ New folder</button>
      </div>

      {docs.error ? <ErrorBox text={docs.error} retry={docs.reload} /> : docs.loading && !docs.data ? <Loading /> : !docs.data?.length ? (
        <Card><Empty icon={q || cat || folder ? '🔎' : '📂'} title={q || cat || folder ? 'Nothing found' : 'Your vault is empty'} text={q || cat || folder ? 'Try another search or filter.' : 'Drag files here or use Upload. Photo, signature, Aadhaar, marksheets - keep them all in one place.'} /></Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {docs.data.map((d) => (
            <Card key={d.id} className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
              <button onClick={() => setPrev(d)} className="block w-full text-left"><Thumb d={d} className="h-32" />
                <div className="p-3"><div className="truncate text-sm font-semibold" title={d.name}>{d.name}</div><div className="mt-1 flex items-center justify-between gap-1"><Badge color={catOf(d.category).color}>{catOf(d.category).label}</Badge><span className="text-[11px] text-slate-400">{bytes(d.size)}</span></div>{d.matchSnippet && <div className="mt-2 line-clamp-2 rounded bg-yellow-50 px-1.5 py-1 text-[11px] text-slate-600">{d.matchSnippet}</div>}</div></button>
              <div className="grid grid-cols-4 border-t border-slate-100 text-center text-base">{[['⚡', 'Smart download', () => setSmart(d)], ['🔗', 'Share', () => setShare(d)], ['✏️', 'Rename / move', () => setEdit(d)], ['🗑️', 'Delete', () => remove(d)]].map(([i, t, f]: any) => <button key={t} title={t} aria-label={t} onClick={f} className="py-2 hover:bg-slate-50">{i}</button>)}</div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {docs.data.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
              <button onClick={() => setPrev(d)} className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg text-xl" style={{ background: catOf(d.category).color + '1a' }}>{d.thumbUrl ? <img src={d.thumbUrl} alt="" className="h-full w-full object-cover" /> : fileIcon(d)}</button>
              <button onClick={() => setPrev(d)} className="min-w-0 flex-1 text-left"><div className="truncate text-sm font-semibold">{d.name}</div><div className="truncate text-xs text-slate-500">{bytes(d.size)} · {date(d.createdAt)}{d.matchSnippet ? ` · ${d.matchSnippet}` : ''}</div></button>
              <span className="hidden sm:block"><Badge color={catOf(d.category).color}>{catOf(d.category).label}</Badge></span>
              <div className="flex">{[['⚡', 'Smart download', () => setSmart(d)], ['🔗', 'Share', () => setShare(d)], ['✏️', 'Rename / move', () => setEdit(d)], ['🗑️', 'Delete', () => remove(d)]].map(([i, t, f]: any) => <button key={t} title={t} aria-label={t} onClick={f} className="rounded-lg p-2 hover:bg-slate-100">{i}</button>)}</div>
            </div>
          ))}
        </Card>
      )}

      {prev && <PreviewModal doc={prev} onClose={() => setPrev(null)} onSmart={() => { setSmart(prev); setPrev(null); }} onShare={() => { setShare(prev); setPrev(null); }} />}
      {smart && <SmartDownload doc={smart} onClose={() => { setSmart(null); refresh(); }} />}
      {share && <ShareDialog target={{ documentId: share.id, docs: all.data || [] }} onClose={() => setShare(null)} />}
      {edit && <EditDoc doc={edit} folders={folders.data || []} onClose={() => setEdit(null)} onDone={() => { setEdit(null); refresh(); }} />}
      {folderModal && <FolderModal f={folderModal} onClose={() => setFolderModal(null)} onDone={() => { setFolderModal(null); setFolder(''); refresh(); }} />}
    </div>
  );
}

function EditDoc({ doc, folders, onClose, onDone }: { doc: Doc; folders: Folder[]; onClose: () => void; onDone: () => void }) {
  const api = useApi();
  const [name, setName] = useState(doc.name), [cat, setCat] = useState(doc.category), [folderId, setFolderId] = useState(doc.folderId || ''), [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); try { await api.patch(`/documents/${doc.id}`, { name, category: cat, folderId: folderId || null }); toast.success('Saved'); onDone(); } catch (e: any) { toast.error(e.message); setBusy(false); } };
  return (
    <Modal title="Rename or move" sub={doc.originalName} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
        <Field label="Document type"><CategorySelect value={cat} onChange={setCat} /></Field>
        <Field label="Folder"><Select value={folderId} onChange={(e) => setFolderId(e.target.value)}><option value="">No folder</option>{folders.map((f) => <option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}</Select></Field>
        <p className="text-xs text-slate-400">Renaming only changes the label in your vault. Downloads keep the original file name.</p>
        <Button className="w-full" loading={busy} onClick={save} disabled={!name.trim()}>Save</Button>
      </div>
    </Modal>
  );
}

function FolderModal({ f, onClose, onDone }: { f: Folder | 'new'; onClose: () => void; onDone: () => void }) {
  const api = useApi();
  const isNew = f === 'new';
  const [name, setName] = useState(isNew ? '' : (f as Folder).name), [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); try { isNew ? await api.post('/folders', { name }) : await api.patch(`/folders/${(f as Folder).id}`, { name }); onDone(); } catch (e: any) { toast.error(e.message); setBusy(false); } };
  const del = async () => { if (!confirm('Delete this folder? Your files stay in the vault.')) return; try { await api.del(`/folders/${(f as Folder).id}`); onDone(); } catch (e: any) { toast.error(e.message); } };
  return (
    <Modal title={isNew ? 'New folder' : 'Edit folder'} onClose={onClose}>
      <div className="space-y-4"><Field label="Folder name"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. SSC CGL 2026" onKeyDown={(e) => e.key === 'Enter' && name.trim() && save()} /></Field>
        <div className="flex gap-2">{!isNew && <Button variant="danger" onClick={del}>Delete folder</Button>}<Button className="flex-1" loading={busy} disabled={!name.trim()} onClick={save}>{isNew ? 'Create' : 'Save'}</Button></div></div>
    </Modal>
  );
}
