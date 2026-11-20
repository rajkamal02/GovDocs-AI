'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge, Button, Field, Input, Modal, Select, Spinner, Toggle } from './ui';
import { useApi, useQuery } from '@/lib/hooks';
import type { Doc, Preset, Result, Spec } from '@/lib/types';
import { bytes, catOf, CATS, fileIcon, num, slotFor, specText } from '@/lib/util';

export const useDocs = (search = '') => useQuery<Doc[]>(`/documents${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export function Thumb({ d, className = 'h-24' }: { d: Doc; className?: string }) {
  const c = catOf(d.category);
  return d.thumbUrl
    ? <img src={d.thumbUrl} alt={d.name} loading="lazy" className={`${className} w-full object-cover`} />
    : <div className={`${className} grid w-full place-items-center text-4xl`} style={{ background: c.color + '14' }}>{fileIcon(d)}</div>;
}

export function ResultCard({ r, onSave, saving }: { r: Result; onSave?: () => void; saving?: boolean }) {
  const [gone, setGone] = useState(false);
  const isImg = r.mime.startsWith('image/');
  return (
    <div className="space-y-3">
      <div className={`overflow-hidden rounded-xl border border-slate-200 ${isImg ? 'checker' : 'bg-slate-50'}`}>
        {isImg ? <img src={r.url} alt="Result" className="mx-auto max-h-72 object-contain" /> : <div className="grid h-32 place-items-center text-5xl">{r.mime === 'application/pdf' ? '📕' : '📦'}</div>}
      </div>
      <div className={`rounded-xl p-3 text-sm ${r.meetsMax && r.meetsMin ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
        <div className="font-semibold">{r.meetsMax && r.meetsMin ? '✅ Ready to upload' : '⚠️ Check the notes below'}</div>
        <div className="mt-0.5 break-all">{r.name} · {bytes(r.size)}{r.width ? ` · ${r.width}×${r.height}px` : ''}</div>
      </div>
      {r.steps && r.steps.length > 0 && <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{r.steps.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>}
      {r.warnings?.map((w, i) => <div key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">⚠️ {w}</div>)}
      <div className="flex flex-wrap gap-2">
        <a href={gone ? undefined : r.url + '?dl=1'} onClick={() => setTimeout(() => setGone(true), 400)} className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${gone ? 'bg-slate-300' : 'bg-brand-600 hover:bg-brand-700'}`}>
          {gone ? 'Downloaded (temp copy deleted)' : '⬇️ Download'}
        </a>
        {onSave && !gone && <Button variant="secondary" onClick={onSave} loading={saving}>💾 Save to vault</Button>}
      </div>
      {!gone && <p className="text-[11px] text-slate-400">This is a temporary copy. It is deleted right after download. Your original is untouched.</p>}
    </div>
  );
}

export function SmartDownload({ doc, onClose, initial }: { doc: Doc; onClose: () => void; initial?: Spec }) {
  const api = useApi();
  const { data: presets } = useQuery<Preset[]>('/presets');
  const isPdf = doc.mimeType === 'application/pdf', isImg = doc.mimeType.startsWith('image/');
  const [f, setF] = useState({ format: initial?.format || (isPdf ? 'pdf' : isImg ? 'jpg' : 'original'), maxKB: String(initial?.maxKB ?? ''), minKB: String(initial?.minKB ?? ''), width: String(initial?.width ?? ''), height: String(initial?.height ?? ''), dpi: String(initial?.dpi ?? ''), fit: initial?.fit || 'contain', optimizePdf: true });
  const [preset, setPreset] = useState('');
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const set = (k: string, v: any) => { setF((p) => ({ ...p, [k]: v })); setRes(null); };

  const pick = (p: Preset) => {
    const s = slotFor(p, doc);
    if (!s) return toast.error(`${p.name} has no requirement for "${catOf(doc.category).label}".`);
    setPreset(p.id); setRes(null);
    setF((x) => ({ ...x, format: s.spec.format || x.format, maxKB: String(s.spec.maxKB ?? ''), minKB: String(s.spec.minKB ?? ''), width: String(s.spec.width ?? ''), height: String(s.spec.height ?? ''), dpi: String(s.spec.dpi ?? '') }));
  };
  const spec = (): Spec => ({ format: f.format, maxKB: num(f.maxKB), minKB: num(f.minKB), width: num(f.width), height: num(f.height), dpi: num(f.dpi), fit: f.fit, optimizePdf: f.optimizePdf });

  const generate = async () => {
    setBusy(true); setRes(null);
    try { setRes(await api.post<Result>('/process/generate', { documentId: doc.id, spec: spec(), presetId: preset || undefined })); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const original = async () => { try { const r = await api.get<{ url: string }>(`/documents/${doc.id}/url?download=1`); window.location.href = r.url + '?dl=1'; } catch (e: any) { toast.error(e.message); } };
  const save = async () => {
    if (!res) return; setSaving(true);
    try { await api.post('/process/save', { tempId: res.id, category: doc.category, name: res.name }); toast.success('Saved to your vault as a new file.'); setRes(null); } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const common = (presets || []).filter((p) => ['ssc-cgl', 'ssc-chsl', 'upsc-cse', 'rrb-ntpc', 'sbi-po', 'ibps-po', 'neet-ug', 'jee-main', 'up-police'].includes(p.id) || p.custom);

  return (
    <Modal title="Smart Download" sub={doc.name} onClose={onClose} wide>
      <div className="space-y-5">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Government preset</div>
          <div className="flex flex-wrap gap-2">
            {common.map((p) => <button key={p.id} onClick={() => pick(p)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${preset === p.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-200'}`}>{p.name}</button>)}
            <Link href="/presets" className="rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:text-brand-700">All presets →</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Output format">
            <Select value={f.format} onChange={(e) => set('format', e.target.value)}>
              <option value="original">Keep original</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WEBP</option><option value="pdf">PDF</option>
            </Select>
          </Field>
          <Field label="Max size (KB)"><Input inputMode="decimal" value={f.maxKB} onChange={(e) => set('maxKB', e.target.value)} placeholder="e.g. 50" /></Field>
          <Field label="Min size (KB)"><Input inputMode="decimal" value={f.minKB} onChange={(e) => set('minKB', e.target.value)} placeholder="e.g. 20" /></Field>
          <Field label="Width (px)"><Input inputMode="numeric" value={f.width} onChange={(e) => set('width', e.target.value)} placeholder="auto" /></Field>
          <Field label="Height (px)"><Input inputMode="numeric" value={f.height} onChange={(e) => set('height', e.target.value)} placeholder="auto" /></Field>
          <Field label="DPI"><Input inputMode="numeric" value={f.dpi} onChange={(e) => set('dpi', e.target.value)} placeholder="default" /></Field>
          {isImg && <Field label="Fit" className="col-span-2 sm:col-span-3"><Select value={f.fit} onChange={(e) => set('fit', e.target.value)}><option value="contain">Keep whole image (white padding if needed)</option><option value="cover">Fill the size (crop edges)</option><option value="fill">Stretch to exact size</option></Select></Field>}
        </div>
        {(isPdf || f.format === 'pdf') && <Toggle on={f.optimizePdf} onChange={(v) => set('optimizePdf', v)} label="Optimize PDF" hint="Compress images inside the PDF to fit the size limit" />}
        <p className="text-xs text-slate-500">Leave any box empty for “no limit”. Quality is chosen automatically to stay inside your size range.</p>
        {res ? <ResultCard r={res} onSave={save} saving={saving} /> : (
          <Button onClick={generate} loading={busy} size="lg" className="w-full">{busy ? 'Preparing…' : '⚡ Generate ready-to-upload file'}</Button>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-xs"><button onClick={original} className="font-semibold text-slate-500 hover:text-brand-700">Download original file</button><span className="text-slate-400">Original is never changed</span></div>
      </div>
    </Modal>
  );
}

export function PreviewModal({ doc, onClose, onSmart, onShare }: { doc: Doc; onClose: () => void; onSmart: () => void; onShare: () => void }) {
  const api = useApi();
  const [url, setUrl] = useState('');
  useEffect(() => { api.get<{ url: string }>(`/documents/${doc.id}/url`).then((r) => setUrl(r.url)).catch(() => undefined); }, [api, doc.id]);
  const c = catOf(doc.category);
  const download = async () => { const r = await api.get<{ url: string }>(`/documents/${doc.id}/url?download=1`); window.location.href = r.url + '?dl=1'; };
  return (
    <Modal title={doc.name} sub={`${c.label} · ${bytes(doc.size)}${doc.width ? ` · ${doc.width}×${doc.height}px` : ''}`} onClose={onClose} wide>
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {!url ? <div className="grid h-60 place-items-center text-brand-600"><Spinner className="h-6 w-6" /></div>
          : doc.mimeType.startsWith('image/') ? <img src={url} alt={doc.name} className="mx-auto max-h-[55vh] object-contain" />
          : doc.mimeType === 'application/pdf' ? <iframe src={url} title={doc.name} className="h-[55vh] w-full" />
          : <div className="grid h-48 place-items-center text-center text-sm text-slate-500"><div><div className="mb-2 text-5xl">📝</div>Preview is not available for Word files.<br />Download it to open.</div></div>}
      </div>
      <div className="flex flex-wrap gap-2"><Button onClick={onSmart}>⚡ Smart download</Button><Button variant="secondary" onClick={download}>⬇️ Original</Button><Button variant="secondary" onClick={onShare}>🔗 Share</Button></div>
    </Modal>
  );
}

export function DocSelect({ docs, value, onChange, prefer, placeholder = '— choose a file —' }: { docs: Doc[]; value: string; onChange: (id: string) => void; prefer?: string; placeholder?: string }) {
  const sorted = useMemo(() => [...docs].sort((a, b) => Number(b.category === prefer) - Number(a.category === prefer)), [docs, prefer]);
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {sorted.map((d) => <option key={d.id} value={d.id}>{catOf(d.category).icon} {d.name} · {bytes(d.size)}</option>)}
    </Select>
  );
}

export function ShareDialog({ target, onClose }: { target: { documentId?: string; recipe?: any; label?: string; docs?: Doc[] }; onClose: () => void }) {
  const api = useApi();
  const { data: presets } = useQuery<Preset[]>('/presets');
  const docs = target.docs || [];
  const [documentId, setDocumentId] = useState(target.documentId || '');
  const [presetId, setPresetId] = useState('');
  const [exp, setExp] = useState('24'), [pw, setPw] = useState(''), [limit, setLimit] = useState('');
  const [busy, setBusy] = useState(false), [link, setLink] = useState('');
  const doc = docs.find((d) => d.id === documentId);
  const create = async () => {
    setBusy(true);
    try {
      const body: any = { expiryHours: exp === 'never' ? undefined : Number(exp), password: pw || undefined, viewLimit: num(limit) };
      if (target.recipe) { body.recipe = target.recipe; body.label = target.label; }
      else {
        body.documentId = documentId;
        const p = presets?.find((x) => x.id === presetId);
        const s = p && doc ? slotFor(p, doc) : null;
        if (s) body.settings = s.spec;
      }
      const r = await api.post<{ link: string }>('/share', body);
      setLink(r.link);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <Modal title="Create share link" sub={target.label || doc?.name} onClose={onClose}>
      {link ? (
        <div className="space-y-4 text-center">
          <div className="text-5xl">✅</div><div className="font-display text-lg font-bold">Link ready</div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3"><span className="min-w-0 flex-1 truncate text-left text-sm text-brand-700">{link}</span><Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(link); toast.success('Link copied'); }}>Copy</Button></div>
          <Button className="w-full" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {!target.recipe && !target.documentId && <Field label="File to share"><DocSelect docs={docs} value={documentId} onChange={setDocumentId} /></Field>}
          {!target.recipe && (
            <Field label="Share a government-ready copy (optional)" hint="The receiver gets the file already resized for this portal.">
              <Select value={presetId} onChange={(e) => setPresetId(e.target.value)}><option value="">Original file</option>{presets?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expires after"><Select value={exp} onChange={(e) => setExp(e.target.value)}><option value="1">1 hour</option><option value="24">24 hours</option><option value="168">7 days</option><option value="720">30 days</option><option value="never">Never</option></Select></Field>
            <Field label="Max downloads"><Input inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="no limit" /></Field>
          </div>
          <Field label="Password (optional)"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="min 4 characters" autoComplete="new-password" /></Field>
          <Button className="w-full" size="lg" loading={busy} disabled={!target.recipe && !documentId} onClick={create}>🔗 Create link</Button>
        </div>
      )}
    </Modal>
  );
}

export const CategorySelect = ({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) => (
  <Select className={className} value={value} onChange={(e) => onChange(e.target.value)}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</Select>
);
export { Badge, specText };
