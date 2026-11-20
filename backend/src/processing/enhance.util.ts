import sharp from 'sharp';
import { hex2rgb } from './image.util';
import { clamp } from '../common';

export interface Box { x: number; y: number; w: number; h: number } // normalised 0..1

/** Flood-fill from the image border: pixels similar to the border colour become "background". Works for plain walls/curtains. */
function findBackground(data: Buffer, w: number, h: number) {
  const ring = Math.max(2, Math.round(Math.min(w, h) * 0.01));
  let n = 0, s = [0, 0, 0], s2 = [0, 0, 0];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x < ring || y < ring || x >= w - ring || y >= h - ring) {
      const i = (y * w + x) * 3; n++;
      for (let c = 0; c < 3; c++) { const v = data[i + c]; s[c] += v; s2[c] += v * v; }
    }
  }
  const mean = s.map((v) => v / n);
  const sd = s2.map((v, c) => Math.sqrt(Math.max(0, v / n - mean[c] * mean[c])));
  const thr = Math.min(75, Math.max(28, 22 + 2.5 * ((sd[0] + sd[1] + sd[2]) / 3)));
  const thr2 = thr * thr;
  const mask = new Uint8Array(w * h), q = new Int32Array(w * h);
  let qh = 0, qt = 0;
  const close = (p: number) => { const i = p * 3; const a = data[i] - mean[0], b = data[i + 1] - mean[1], c = data[i + 2] - mean[2]; return a * a + b * b + c * c <= thr2; };
  const push = (p: number) => { if (!mask[p] && close(p)) { mask[p] = 1; q[qt++] = p; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (qh < qt) {
    const p = q[qh++], x = p % w;
    if (x > 0) push(p - 1); if (x < w - 1) push(p + 1); if (p >= w) push(p - w); if (p < w * (h - 1)) push(p + w);
  }
  return { mask, coverage: qt / (w * h) };
}

export async function enhancePhoto(input: Buffer, o: {
  width: number; height: number; bg: string; brightness: number | null; contrast: number;
  removeBg: boolean; centerFace: boolean; face: Box | null;
}) {
  const steps: string[] = [], warnings: string[] = [];
  const bg = hex2rgb(o.bg);
  const { data, info } = await sharp(input, { failOn: 'none' }).rotate()
    .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' }).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const px = Buffer.from(data);

  // 1) find the plain background (if asked) so tone is measured on the SUBJECT only
  let mask: Uint8Array | null = null;
  if (o.removeBg) {
    const f = findBackground(px, W, H);
    if (f.coverage < 0.04) warnings.push('Could not find a plain background to replace. Use a photo taken against a plain wall.');
    else if (f.coverage > 0.85) warnings.push('Background looks too similar to the subject, so background change was skipped.');
    else mask = f.mask;
  }

  // 2) brightness / contrast on the subject
  let factor = 1;
  if (o.brightness === null) {
    let sum = 0, cnt = 0;
    for (let i = 0; i < N; i += 5) if (!mask || !mask[i]) { const j = i * 3; sum += 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2]; cnt++; }
    factor = clamp(135 / Math.max(1, cnt ? sum / cnt : 135), 0.85, 1.3);
    steps.push(`Brightness auto-corrected (×${factor.toFixed(2)})`);
  } else if (o.brightness !== 0) { factor = 1 + o.brightness / 100; steps.push('Brightness adjusted'); }
  const k = 1 + o.contrast / 100;
  if (o.contrast) steps.push('Contrast adjusted');
  if (factor !== 1 || k !== 1) for (let i = 0; i < N * 3; i++) px[i] = clamp(((px[i] * factor) - 128) * k + 128, 0, 255);

  // 3) replace the background with a soft edge
  if (mask) {
    const alphaIn = Buffer.alloc(N);
    for (let i = 0; i < N; i++) alphaIn[i] = mask[i] ? 0 : 255;
    const alpha = await sharp(alphaIn, { raw: { width: W, height: H, channels: 1 } }).blur(1.6).raw().toBuffer();
    for (let i = 0; i < N; i++) {
      const a = alpha[i] / 255, j = i * 3;
      px[j] = px[j] * a + bg.r * (1 - a); px[j + 1] = px[j + 1] * a + bg.g * (1 - a); px[j + 2] = px[j + 2] * a + bg.b * (1 - a);
    }
    steps.unshift('Background replaced');
  }

  // 4) crop around the face (or smart-crop) and resize
  let img = sharp(px, { raw: { width: W, height: H, channels: 3 } });
  const ar = o.width / o.height;
  if (o.centerFace && o.face) {
    const fh = o.face.h * H, fcx = (o.face.x + o.face.w / 2) * W, fcy = (o.face.y + o.face.h / 2) * H;
    let ch = fh / 0.55, cw = ch * ar;
    const kk = Math.min(1, W / cw, H / ch); ch *= kk; cw *= kk;
    const left = clamp(fcx - cw / 2, 0, W - cw), top = clamp(fcy - ch * 0.48, 0, H - ch);
    img = img.extract({ left: Math.round(left), top: Math.round(top), width: Math.max(1, Math.round(cw)), height: Math.max(1, Math.round(ch)) }).resize(o.width, o.height, { fit: 'fill' });
    steps.push('Face detected and centred');
  } else if (o.centerFace) {
    img = img.resize(o.width, o.height, { fit: 'cover', position: sharp.strategy.attention });
    steps.push('Smart-cropped to the main subject');
    warnings.push('Exact face centring needs AI (set GEMINI_API_KEY and AI_IMAGES=true). Smart crop was used instead.');
  } else {
    img = img.resize(o.width, o.height, { fit: 'cover' });
  }
  steps.push(`Resized to ${o.width}×${o.height}px`);
  return { buffer: await img.jpeg({ quality: 95 }).toBuffer(), steps, warnings };
}

export async function cleanSignature(input: Buffer, o: { removeBg: boolean; darken: number; smooth: boolean; autoCrop: boolean; transparent: boolean }) {
  const steps: string[] = [], warnings: string[] = [];
  let p = sharp(input, { failOn: 'none' }).rotate().flatten({ background: '#ffffff' }).greyscale()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
  if (o.smooth) p = p.blur(0.6);
  const { data, info } = await p.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const hist = new Uint32Array(256);
  for (let i = 0; i < N; i++) hist[data[i]]++;
  const pct = (f: number) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= N * f) return v; } return 255; };
  const ink = pct(0.01), bg = pct(0.85);
  if (bg - ink < 30) warnings.push('Low contrast: signature may not be clear. Use dark ink on white paper with good light.');
  const gamma = 1 + o.darken / 40;
  const out = Buffer.alloc(N);
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let i = 0; i < N; i++) {
    let t = clamp((data[i] - ink) / Math.max(1, bg - ink), 0, 1);
    t = Math.pow(t, gamma);
    if (o.removeBg && t > 0.92) t = 1;
    out[i] = Math.round(t * 255);
    if (t < 0.55) { const x = i % W, y = (i / W) | 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  steps.push(o.removeBg ? 'Background cleaned to pure white' : 'Contrast stretched', `Ink darkened (${o.darken}%)`);
  let raw = out, channels = 1;
  if (o.transparent) {
    raw = Buffer.alloc(N * 4);
    for (let i = 0; i < N; i++) { raw[i * 4] = 0; raw[i * 4 + 1] = 0; raw[i * 4 + 2] = 0; raw[i * 4 + 3] = 255 - out[i]; }
    channels = 4;
    steps.push('Transparent background');
  }
  let img = sharp(raw, { raw: { width: W, height: H, channels: channels as any } });
  if (o.autoCrop && maxX > minX && maxY > minY) {
    const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04) + 2;
    const left = Math.max(0, minX - pad), top = Math.max(0, minY - pad);
    img = img.extract({ left, top, width: Math.min(W - left, maxX - minX + 2 * pad), height: Math.min(H - top, maxY - minY + 2 * pad) });
    steps.push('Cropped tightly around the signature');
  } else if (o.autoCrop) warnings.push('No clear ink found to crop around.');
  return { buffer: await img.png().toBuffer(), steps, warnings };
}
