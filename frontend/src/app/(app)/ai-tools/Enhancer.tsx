'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, Empty, Field, Input, Loading, PageHeader, Select, Toggle } from '@/components/ui';
import { ResultCard, useDocs, Thumb } from '@/components/shared';
import { useApi } from '@/lib/hooks';
import type { Result } from '@/lib/types';
import { catOf, num } from '@/lib/util';
import Link from 'next/link';

const PHOTO_PRESETS: [string, any][] = [['SSC', { width: '100', height: '120', minKB: '20', maxKB: '50' }], ['IBPS / SBI', { width: '200', height: '230', minKB: '20', maxKB: '50' }], ['Railway', { width: '200', height: '230', minKB: '20', maxKB: '50' }], ['UPSC', { width: '350', height: '350', minKB: '20', maxKB: '300' }], ['NEET / JEE', { width: '200', height: '230', minKB: '10', maxKB: '200' }]];
const SIG_PRESETS: [string, any][] = [['SSC / IBPS', { width: '140', height: '60', minKB: '10', maxKB: '20' }], ['Railway', { width: '190', height: '100', minKB: '10', maxKB: '20' }], ['UPSC', { width: '350', height: '120', minKB: '10', maxKB: '300' }], ['NEET / JEE', { width: '200', height: '80', minKB: '4', maxKB: '30' }]];
const BGS: [string, string][] = [['#ffffff', 'White'], ['#f1f5f9', 'Light grey'], ['#dbeafe', 'Light blue']];

export function Enhancer({ mode }: { mode: 'photo' | 'signature' }) {
  const api = useApi(), docs = useDocs(), isPhoto = mode === 'photo';
  const want = isPhoto ? 'PASSPORT_PHOTO' : 'SIGNATURE';
  const [docId, setDocId] = useState('');
  const [f, setF] = useState<any>(isPhoto ? { width: '200', height: '230', minKB: '20', maxKB: '50', format: 'jpg', bg: '#ffffff', removeBg: true, centerFace: true, auto: true, brightness: 0, contrast: 0 } : { width: '140', height: '60', minKB: '10', maxKB: '20', format: 'jpg', removeBg: true, smooth: true, autoCrop: true, transparent: false, darken: 40 });
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [res, setRes] = useState<Result | null>(null), [up, setUp] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const set = (k: string, v: any) => { setF((p: any) => ({ ...p, [k]: v })); setRes(null); };
  const images = (docs.data || []).filter((d) => d.mimeType.startsWith('image/')).sort((a, b) => Number(b.category === want) - Number(a.category === want));
  const doc = images.find((d) => d.id === docId);

  const upload = async (file: File) => {
    setUp(true);
    try { const fd = new FormData(); fd.append('files', file); fd.append('categories', JSON.stringify([want])); const [d] = await api.form<any[]>('/documents', fd); await docs.reload(); setDocId(d.id); toast.success('Added to your vault'); }
    catch (e: any) { toast.error(e.message); } finally { setUp(false); }
  };
  const run = async () => {
    setBusy(true); setRes(null);
    try {
      const body: any = { documentId: docId, width: num(f.width), height: num(f.height), minKB: num(f.minKB), maxKB: num(f.maxKB), format: f.format, removeBg: f.removeBg };
      if (isPhoto) Object.assign(body, { bg: f.bg, centerFace: f.centerFace, brightness: f.auto ? 'auto' : Number(f.brightness), contrast: Number(f.contrast) });
      else Object.assign(body, { smooth: f.smooth, autoCrop: f.autoCrop, transparent: f.transparent, darken: Number(f.darken) });
      setRes(await api.post<Result>(isPhoto ? '/process/photo' : '/process/signature', body));
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const save = async () => { if (!res) return; setSaving(true); try { await api.post('/process/save', { tempId: res.id, category: want, name: res.name }); toast.success('Saved to your vault as a new file.'); setRes(null); docs.reload(); } catch (e: any) { toast.error(e.message); } finally { setSaving(false); } };
  if (docs.loading) return <Loading />;

  return (
    <>
      <PageHeader title={isPhoto ? 'Passport Photo Maker' : 'Signature Cleaner'} sub={isPhoto ? 'White background, centred crop and exact size - in one go' : 'Clean paper, darker ink, tight crop and exact size'} />
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold">1. Choose {isPhoto ? 'photo' : 'signature'}</h2>
            {images.length ? <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto">{images.map((d) => <button key={d.id} onClick={() => { setDocId(d.id); setRes(null); }} className={`overflow-hidden rounded-xl border-2 text-left ${docId === d.id ? 'border-brand-600' : 'border-transparent hover:border-brand-200'}`}><Thumb d={d} className="h-20" /><div className="truncate px-1 py-0.5 text-[10px]">{catOf(d.category).icon} {d.name}</div></button>)}</div> : <p className="text-sm text-slate-500">No images in your vault yet.</p>}
            <input ref={ref} type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <Button variant="secondary" className="mt-3 w-full" loading={up} onClick={() => ref.current?.click()}>⬆️ Upload a new {isPhoto ? 'photo' : 'signature'}</Button>
          </Card>
          <Card className="space-y-4 p-5">
            <h2 className="font-display font-bold">2. Settings</h2>
            <div className="flex flex-wrap gap-2">{(isPhoto ? PHOTO_PRESETS : SIG_PRESETS).map(([n, v]) => <button key={n} onClick={() => { setF((p: any) => ({ ...p, ...v })); setRes(null); }} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-200 hover:text-brand-700">{n}</button>)}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Width (px)"><Input inputMode="numeric" value={f.width} onChange={(e) => set('width', e.target.value)} /></Field>
              <Field label="Height (px)"><Input inputMode="numeric" value={f.height} onChange={(e) => set('height', e.target.value)} /></Field>
              <Field label="Min size (KB)"><Input inputMode="decimal" value={f.minKB} onChange={(e) => set('minKB', e.target.value)} /></Field>
              <Field label="Max size (KB)"><Input inputMode="decimal" value={f.maxKB} onChange={(e) => set('maxKB', e.target.value)} /></Field>
              <Field label="Format" className="col-span-2"><Select value={f.format} onChange={(e) => set('format', e.target.value)}><option value="jpg">JPG</option><option value="png">PNG</option>{isPhoto && <option value="webp">WEBP</option>}</Select></Field>
            </div>
            {isPhoto ? <>
              <Toggle on={f.removeBg} onChange={(v) => set('removeBg', v)} label="Replace background" hint="Works best on a plain wall" />
              {f.removeBg && <Field label="Background colour"><div className="flex gap-2">{BGS.map(([c, n]) => <button key={c} onClick={() => set('bg', c)} className={`flex-1 rounded-xl border-2 px-2 py-2 text-xs font-semibold ${f.bg === c ? 'border-brand-600' : 'border-slate-200'}`}><span className="mr-1 inline-block h-3 w-3 rounded-full border border-slate-300 align-middle" style={{ background: c }} />{n}</button>)}</div></Field>}
              <Toggle on={f.centerFace} onChange={(v) => set('centerFace', v)} label="Centre the face" hint="Crops to the passport proportions" />
              <Toggle on={f.auto} onChange={(v) => set('auto', v)} label="Auto brightness" />
              {!f.auto && <Field label={`Brightness ${f.brightness}`}><input type="range" min={-50} max={50} value={f.brightness} onChange={(e) => set('brightness', e.target.value)} className="w-full" /></Field>}
              <Field label={`Contrast ${f.contrast}`}><input type="range" min={-50} max={50} value={f.contrast} onChange={(e) => set('contrast', e.target.value)} className="w-full" /></Field>
            </> : <>
              <Toggle on={f.removeBg} onChange={(v) => set('removeBg', v)} label="Remove paper / background" />
              <Toggle on={f.transparent} onChange={(v) => set('transparent', v)} label="Transparent PNG" hint="Only for portals that accept PNG" />
              <Toggle on={f.autoCrop} onChange={(v) => set('autoCrop', v)} label="Crop tightly around the ink" />
              <Toggle on={f.smooth} onChange={(v) => set('smooth', v)} label="Smooth rough edges" />
              <Field label={`Darken ink ${f.darken}%`}><input type="range" min={0} max={100} value={f.darken} onChange={(e) => set('darken', e.target.value)} className="w-full" /></Field>
            </>}
            <Button size="lg" className="w-full" loading={busy} disabled={!docId} onClick={run}>{isPhoto ? '✨ Make my photo' : '🧹 Clean signature'}</Button>
          </Card>
        </div>
        <Card className="h-fit p-5">
          <h2 className="mb-3 font-display font-bold">Result</h2>
          {!res ? (doc ? <div className="grid grid-cols-2 gap-3"><div><div className="mb-1 text-xs font-semibold text-slate-500">Your file</div><div className="overflow-hidden rounded-xl border border-slate-200"><Thumb d={doc} className="h-48" /></div></div><div className="grid place-items-center rounded-xl bg-slate-50 text-center text-sm text-slate-400"><div>{busy ? 'Working…' : 'Press the button to see the result'}</div></div></div> : <Empty icon={isPhoto ? '📸' : '✍️'} title="Pick a file to start" />)
            : <div className="space-y-3">{res.sourceUrl && <div className="grid grid-cols-2 gap-3"><div><div className="mb-1 text-xs font-semibold text-slate-500">Before</div><div className="grid h-40 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={res.sourceUrl} alt="Before" className="max-h-40 object-contain" /></div></div><div><div className="mb-1 text-xs font-semibold text-emerald-700">After</div><div className={`grid h-40 place-items-center overflow-hidden rounded-xl border border-emerald-200 ${f.transparent ? 'checker' : 'bg-white'}`}><img src={res.url} alt="After" className="max-h-40 object-contain" /></div></div></div>}<ResultCard r={res} onSave={save} saving={saving} /></div>}
        </Card>
      </div>
    </>
  );
}
