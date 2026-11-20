'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Modal, PageHeader, Select, Spinner, Textarea } from '@/components/ui';
import { DocSelect, SmartDownload, useDocs } from '@/components/shared';
import { PresetEditor } from '@/components/PresetEditor';
import { useApi } from '@/lib/hooks';
import type { ReqItem, Doc } from '@/lib/types';

export default function Detector() {
  const api = useApi(), docs = useDocs();
  const [text, setText] = useState(''), [img, setImg] = useState<File | null>(null), [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ exam: string | null; items: ReqItem[]; notes: string | null; source: string } | null>(null);
  const [pickFor, setPickFor] = useState<ReqItem | null>(null), [docId, setDocId] = useState(''), [apply, setApply] = useState<{ doc: Doc; item: ReqItem } | null>(null), [save, setSave] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const detect = async () => {
    setBusy(true); setRes(null);
    try { const f = new FormData(); f.append('text', text); if (img) f.append('image', img); setRes(await api.form('/process/detect-requirements', f)); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const upd = (i: number, k: string, v: string) => setRes((r) => r && { ...r, items: r.items.map((x, j) => (j === i ? { ...x, [k]: ['minKB', 'maxKB', 'width', 'height'].includes(k) ? (v === '' ? undefined : Number(v)) : v } : x)) });
  const rows = (res?.items || []).map((it) => ({ label: it.label, kind: it.kind === 'photo' || it.kind === 'signature' ? it.kind : 'document', docCategory: it.kind === 'photo' ? 'PASSPORT_PHOTO' : it.kind === 'signature' ? 'SIGNATURE' : 'OTHER',
    filename: it.kind === 'photo' ? 'photo' : it.kind === 'signature' ? 'signature' : it.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24) || 'document', format: it.format === 'png' || it.format === 'pdf' ? it.format : it.kind === 'document' && !it.format ? 'pdf' : 'jpg',
    minKB: it.minKB ?? '', maxKB: it.maxKB ?? '', width: it.width ?? '', height: it.height ?? '' }));

  return (
    <>
      <PageHeader title="Requirement Reader" sub="Turn the official notice into exact file settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold">1. Paste the notice</h2>
          <Textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Photograph: JPEG, 20 KB to 50 KB, 200 x 230 pixels, white background.\nSignature: JPEG, 10-20 KB, 140 x 60 pixels.\nDocuments: PDF, max 300 KB.'} />
          <div className="my-3 text-center text-xs text-slate-400">— or —</div>
          <button onClick={() => ref.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:border-brand-200">{img ? `✅ ${img.name}` : '🖼️ Upload a screenshot of the instructions'}</button>
          <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => setImg(e.target.files?.[0] || null)} />
          {img && <button className="mt-1 text-xs text-red-600" onClick={() => setImg(null)}>Remove screenshot</button>}
          <Button className="mt-4 w-full" size="lg" loading={busy} disabled={!text.trim() && !img} onClick={detect}>🤖 Read requirements</Button>
          <p className="mt-3 text-[11px] text-slate-400">Notice text is public information. It is only sent to an AI service if you set a Gemini key; otherwise built-in rules read it on your own server.</p>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold">2. Check & use</h2>
          {busy && <div className="grid place-items-center py-16 text-brand-600"><Spinner className="h-7 w-7" /></div>}
          {!busy && !res && <div className="py-16 text-center text-sm text-slate-400"><div className="mb-2 text-5xl">📄</div>Results appear here</div>}
          {res && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">{res.exam && <Badge color="#2563eb">{res.exam}</Badge>}<Badge color={res.source === 'ai' ? '#059669' : '#64748b'}>{res.source === 'ai' ? 'AI' : 'Built-in rules'}</Badge></div>
              {!res.items.length && <p className="text-sm text-slate-500">No file requirements found. Paste the section that mentions size, format or pixels.</p>}
              {res.items.map((it, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2"><Input className="py-1.5 font-semibold" value={it.label} onChange={(e) => upd(i, 'label', e.target.value)} /><Select className="w-28 py-1.5" value={it.format || ''} onChange={(e) => upd(i, 'format', e.target.value)}><option value="">any</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="pdf">PDF</option></Select></div>
                  <div className="grid grid-cols-4 gap-2">{[['minKB', 'Min KB'], ['maxKB', 'Max KB'], ['width', 'Width'], ['height', 'Height']].map(([k, l]) => <label key={k} className="text-[10px] font-semibold text-slate-500">{l}<Input className="mt-0.5 px-2 py-1.5" inputMode="decimal" value={(it as any)[k] ?? ''} onChange={(e) => upd(i, k, e.target.value)} /></label>)}</div>
                  {it.notes && <div className="text-xs text-amber-700">⚠️ {it.notes}</div>}
                  <Button size="sm" variant="secondary" onClick={() => { setPickFor(it); setDocId(''); }}>⚡ Apply to a file</Button>
                </div>
              ))}
              {res.notes && <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{res.notes}</div>}
              {res.items.length > 0 && <Button className="w-full" variant="secondary" onClick={() => setSave(true)}>💾 Save these as my preset</Button>}
            </div>
          )}
        </Card>
      </div>
      {pickFor && (
        <Modal title="Which file?" sub={pickFor.label} onClose={() => setPickFor(null)}>
          <div className="space-y-4"><DocSelect docs={docs.data || []} value={docId} onChange={setDocId} prefer={pickFor.kind === 'photo' ? 'PASSPORT_PHOTO' : pickFor.kind === 'signature' ? 'SIGNATURE' : undefined} /><Button className="w-full" disabled={!docId} onClick={() => { setApply({ doc: docs.data!.find((d) => d.id === docId)!, item: pickFor }); setPickFor(null); }}>Continue</Button></div>
        </Modal>
      )}
      {apply && <SmartDownload doc={apply.doc} onClose={() => setApply(null)} initial={{ format: apply.item.format, minKB: apply.item.minKB, maxKB: apply.item.maxKB, width: apply.item.width, height: apply.item.height, dpi: apply.item.dpi }} />}
      {save && <PresetEditor initial={rows} onClose={() => setSave(false)} onDone={() => { setSave(false); toast.success('Find it under Govt Presets'); }} />}
    </>
  );
}
