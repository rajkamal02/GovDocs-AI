import { BadRequestException } from '@nestjs/common';
import { FileSpec, CATEGORIES } from './types';

export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
export const toNum = (v: any, min: number, max: number): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return isFinite(n) ? clamp(n, min, max) : undefined;
};
export const baseName = (n: string) => n.replace(/\.[^.\\/]+$/, '');
export function safeName(s: string, fallback = 'file'): string {
  const out = (s || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 120);
  return out && out !== '.' && out !== '..' ? out : fallback;
}
export function normCategory(c: any): string {
  return (CATEGORIES as readonly string[]).includes(c) ? c : 'OTHER';
}
export function normSpec(raw: any): FileSpec {
  if (!raw || typeof raw !== 'object') return {};
  const f = String(raw.format || '').toLowerCase().replace('jpeg', 'jpg');
  const spec: FileSpec = {};
  if (['jpg', 'png', 'webp', 'pdf', 'original'].includes(f)) spec.format = f as any;
  spec.minKB = toNum(raw.minKB, 0.1, 500000);
  spec.maxKB = toNum(raw.maxKB, 0.1, 500000);
  spec.width = toNum(raw.width, 1, 12000);
  spec.height = toNum(raw.height, 1, 12000);
  spec.dpi = toNum(raw.dpi, 36, 1200);
  spec.quality = toNum(raw.quality, 1, 100);
  if (['contain', 'cover', 'fill'].includes(raw.fit)) spec.fit = raw.fit;
  if (typeof raw.background === 'string' && /^#?[0-9a-f]{6}$/i.test(raw.background)) spec.background = raw.background;
  if (typeof raw.optimizePdf === 'boolean') spec.optimizePdf = raw.optimizePdf;
  if (spec.minKB && spec.maxKB && spec.minKB > spec.maxKB) throw new BadRequestException('Min size cannot be larger than max size.');
  Object.keys(spec).forEach((k) => (spec as any)[k] === undefined && delete (spec as any)[k]);
  return spec;
}
export const fmtKB = (bytes: number) => `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
