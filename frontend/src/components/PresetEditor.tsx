'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useApi } from '@/lib/hooks';
import type { Slot } from '@/lib/types';
import { num } from '@/lib/util';

const blank = (): any => ({ label: 'Passport Photo', kind: 'photo', docCategory: 'PASSPORT_PHOTO', filename: 'photo', format: 'jpg', minKB: '20', maxKB: '50', width: '200', height: '230' });

export function toSlots(rows: any[]): Slot[] {
  return rows.map((r) => ({ key: r.filename, label: r.label, kind: r.kind, docCategory: r.docCategory, filename: r.filename,
    spec: { format: r.format, minKB: num(r.minKB), maxKB: num(r.maxKB), width: num(r.width), height: num(r.height) } }));
}

export function PresetEditor({ initial, onClose, onDone }: { initial?: any[]; onClose: () => void; onDone: () => void }) {
  const api = useApi();
  const [name, setName] = useState(''), [rows, setRows] = useState<any[]>(initial?.length ? initial : [blank()]), [busy, setBusy] = useState(false);
  const set = (i: number, k: string, v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const KIND: Record<string, [string, string]> = { photo: ['PASSPORT_PHOTO', 'photo'], signature: ['SIGNATURE', 'signature'], document: ['OTHER', 'document'] };
  const save = async () => { setBusy(true); try { await api.post('/presets/custom', { name, slots: toSlots(rows) }); toast.success('Preset saved'); onDone(); } catch (e: any) { toast.error(e.message); setBusy(false); } };
  return (
    <Modal title="Custom preset" sub="Exact limits copied from the official notice" onClose={onClose} wide>
      <div className="space-y-4">
        <Field label="Preset name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MPPSC 2026" maxLength={60} /></Field>
        {rows.map((r, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Type" className="col-span-2 sm:col-span-1"><Select value={r.kind} onChange={(e) => { const [c, f] = KIND[e.target.value]; setRows((x) => x.map((y, j) => (j === i ? { ...y, kind: e.target.value, docCategory: c, filename: f, label: e.target.value === 'photo' ? 'Passport Photo' : e.target.value === 'signature' ? 'Signature' : 'Document' } : y))); }}><option value="photo">Photo</option><option value="signature">Signature</option><option value="document">Document</option></Select></Field>
              <Field label="Label"><Input value={r.label} onChange={(e) => set(i, 'label', e.target.value)} /></Field>
              <Field label="File name"><Input value={r.filename} onChange={(e) => set(i, 'filename', e.target.value)} /></Field>
              <Field label="Format"><Select value={r.format} onChange={(e) => set(i, 'format', e.target.value)}><option value="jpg">JPG</option><option value="png">PNG</option><option value="pdf">PDF</option></Select></Field>
            </div>
            <div className="grid grid-cols-4 gap-3">{[['minKB', 'Min KB'], ['maxKB', 'Max KB'], ['width', 'Width px'], ['height', 'Height px']].map(([k, l]) => <Field key={k} label={l}><Input inputMode="decimal" value={r[k]} onChange={(e) => set(i, k, e.target.value)} /></Field>)}</div>
            {rows.length > 1 && <button onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="text-xs font-semibold text-red-600">Remove this file</button>}
          </div>
        ))}
        <div className="flex gap-2"><Button variant="secondary" onClick={() => setRows((r) => [...r, { ...blank(), label: 'Document', kind: 'document', docCategory: 'OTHER', filename: 'document' + (r.length + 1), format: 'pdf', minKB: '', maxKB: '300', width: '', height: '' }])}>+ Add file</Button><Button className="flex-1" loading={busy} disabled={!name.trim()} onClick={save}>Save preset</Button></div>
      </div>
    </Modal>
  );
}

