import type { Doc, Preset, Spec } from './types';

export const CATS: Record<string, { label: string; icon: string; color: string }> = {
  PASSPORT_PHOTO: { label: 'Passport Photo', icon: '📸', color: '#2563eb' }, SIGNATURE: { label: 'Signature', icon: '✍️', color: '#7c3aed' },
  AADHAAR: { label: 'Aadhaar', icon: '🪪', color: '#d97706' }, PAN_CARD: { label: 'PAN Card', icon: '💳', color: '#dc2626' },
  RESUME: { label: 'Resume', icon: '📄', color: '#059669' }, CERTIFICATE: { label: 'Certificate', icon: '🎓', color: '#4f46e5' },
  MARKSHEET: { label: 'Marksheet', icon: '📊', color: '#db2777' }, GOVT_ID: { label: 'Govt ID', icon: '🆔', color: '#ea580c' }, OTHER: { label: 'Other', icon: '📁', color: '#64748b' },
};
export const catOf = (c: string) => CATS[c] || CATS.OTHER;
export const bytes = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} KB` : b < 1073741824 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1073741824).toFixed(2)} GB`);
export const date = (d: string | number) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export function ago(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)} min ago`; if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return s < 604800 ? `${Math.floor(s / 86400)} d ago` : date(d);
}
export const fileIcon = (d: Pick<Doc, 'mimeType'>) => (d.mimeType.startsWith('image/') ? '🖼️' : d.mimeType === 'application/pdf' ? '📕' : '📝');
export const specText = (s: Spec) => [s.format?.toUpperCase(), s.minKB || s.maxKB ? `${s.minKB ?? 0}–${s.maxKB ?? '∞'} KB` : '', s.width && s.height ? `${s.width}×${s.height}px` : ''].filter(Boolean).join(' · ');

export function slotFor(p: Preset, doc: Pick<Doc, 'category'>) {
  return p.slots.find((s) => s.docCategory === doc.category)
    || (doc.category === 'PASSPORT_PHOTO' ? p.slots.find((s) => s.kind === 'photo') : doc.category === 'SIGNATURE' ? p.slots.find((s) => s.kind === 'signature') : p.slots.find((s) => s.kind === 'document'));
}
export const num = (v: any) => { const n = parseFloat(v); return isFinite(n) && n > 0 ? n : undefined; };
