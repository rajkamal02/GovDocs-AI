import sharp from 'sharp';

export type Fmt = 'jpg' | 'png' | 'webp';
export interface ImgOpts {
  format: Fmt; width?: number; height?: number; fit?: 'contain' | 'cover' | 'fill';
  minKB?: number; maxKB?: number; quality?: number; dpi?: number; background?: string;
  allowDownscale?: boolean; keepAlpha?: boolean;
}
export interface ImgResult {
  buffer: Buffer; mime: string; ext: string; width: number; height: number; quality: number;
  meetsMax: boolean; meetsMin: boolean; warnings: string[];
}
export const MIME: Record<Fmt, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
export const hex2rgb = (h: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
  const n = m ? parseInt(m[1], 16) : 0xffffff;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

async function orientedSize(input: Buffer) {
  const m = await sharp(input, { failOn: 'none' }).metadata();
  const swap = (m.orientation || 1) >= 5;
  return { w: swap ? m.height! : m.width!, h: swap ? m.width! : m.height! };
}

async function render(input: Buffer, o: ImgOpts, scale: number, bg: { r: number; g: number; b: number }) {
  let p = sharp(input, { failOn: 'none' }).rotate();
  const alpha = o.keepAlpha ? 0 : 1;
  if (o.width && o.height) {
    p = p.resize(Math.max(1, Math.round(o.width * scale)), Math.max(1, Math.round(o.height * scale)), { fit: o.fit === 'fill' ? 'fill' : o.fit || 'contain', background: { ...bg, alpha } });
  } else if (o.width || o.height) {
    p = p.resize({ width: o.width ? Math.round(o.width * scale) : undefined, height: o.height ? Math.round(o.height * scale) : undefined, fit: 'inside' });
  } else if (scale < 1) {
    const s = await orientedSize(input);
    p = p.resize({ width: Math.max(1, Math.round(s.w * scale)) });
  }
  if (!o.keepAlpha) p = p.flatten({ background: bg });
  return p.raw().toBuffer({ resolveWithObject: true });
}

function encode(raw: Buffer, info: { width: number; height: number; channels: number }, fmt: Fmt, q: number, dpi?: number) {
  let p = sharp(raw, { raw: { width: info.width, height: info.height, channels: info.channels as any } });
  if (dpi) p = p.withMetadata({ density: dpi });
  if (fmt === 'jpg') return p.jpeg({ quality: q, chromaSubsampling: q >= 90 ? '4:4:4' : '4:2:0' }).toBuffer();
  if (fmt === 'webp') return p.webp({ quality: q }).toBuffer();
  return p.png({ compressionLevel: 9, palette: q < 100, quality: q }).toBuffer();
}

/** Resize + convert + hit a KB window. Picks the highest quality that stays under max; pads JPEG up to min if needed. */
export async function processImage(input: Buffer, o: ImgOpts): Promise<ImgResult> {
  const warnings: string[] = [];
  const bg = hex2rgb(o.background || '#ffffff');
  const maxB = o.maxKB ? Math.floor(o.maxKB * 1024) : Infinity;
  const minB = o.minKB ? Math.ceil(o.minKB * 1024) : 0;
  const dimsFixed = !!(o.width && o.height);
  let scale = 1, attempt = 0;

  for (;;) {
    const { data, info } = await render(input, o, scale, bg);
    const qHi = Math.min(100, o.quality || 100);
    let lo = 1, hi = qHi, best: Buffer | null = null, bq = 0;
    if (maxB === Infinity) {
      best = await encode(data, info, o.format, qHi, o.dpi); bq = qHi;
    } else {
      for (let i = 0; i < 8 && lo <= hi; i++) {
        const mid = (lo + hi) >> 1;
        const b = await encode(data, info, o.format, mid, o.dpi);
        if (b.length <= maxB) { best = b; bq = mid; lo = mid + 1; } else hi = mid - 1;
      }
    }
    if (best) {
      let meetsMin = best.length >= minB;
      if (!meetsMin && o.format === 'jpg') {
        best = Buffer.concat([best, Buffer.alloc(Math.min(maxB, minB + 64) - best.length)]);
        meetsMin = best.length >= minB;
        warnings.push(`Image was smaller than ${o.minKB} KB, so it was padded to reach the minimum size.`);
      } else if (!meetsMin) warnings.push(`Result (${Math.ceil(best.length / 1024)} KB) is below the ${o.minKB} KB minimum. Use JPG, or a larger width/height.`);
      return { buffer: best, mime: MIME[o.format], ext: o.format, width: info.width, height: info.height, quality: bq, meetsMax: true, meetsMin, warnings };
    }
    if ((!dimsFixed || o.allowDownscale) && attempt < 8) { scale *= 0.85; attempt++; continue; }
    const b = await encode(data, info, o.format, 1, o.dpi);
    warnings.push(`Could not get under ${o.maxKB} KB at ${info.width}×${info.height}px (smallest possible: ${Math.ceil(b.length / 1024)} KB). Try a smaller width/height.`);
    return { buffer: b, mime: MIME[o.format], ext: o.format, width: info.width, height: info.height, quality: 1, meetsMax: false, meetsMin: b.length >= minB, warnings };
  }
}

export async function makeThumb(input: Buffer): Promise<Buffer> {
  return sharp(input, { failOn: 'none' }).rotate().resize(360, 360, { fit: 'cover', position: 'attention' }).flatten({ background: '#ffffff' }).jpeg({ quality: 70 }).toBuffer();
}
export async function imageMeta(input: Buffer) {
  const s = await orientedSize(input);
  const st = await sharp(input, { failOn: 'none' }).rotate().greyscale().resize(64, 64, { fit: 'inside' }).stats();
  return { width: s.w, height: s.h, mean: st.channels[0].mean };
}
