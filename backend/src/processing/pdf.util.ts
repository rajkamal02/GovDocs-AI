import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';

const run = promisify(execFile);
const GS = process.platform === 'win32' ? 'gswin64c' : 'gs';
const cache: Record<string, boolean> = {};
async function has(bin: string, args: string[]) {
  const k = bin + args.join();
  if (cache[k] === undefined) { try { await run(bin, args, { timeout: 8000 }); cache[k] = true; } catch { cache[k] = false; } }
  return cache[k];
}
export const hasGhostscript = () => has(GS, ['-v']);
export const hasLibreOffice = () => has('soffice', ['--version']);

async function withTmp<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'govdocs-'));
  try { return await fn(dir); } finally { await fs.promises.rm(dir, { recursive: true, force: true }); }
}

/** Last resort: turn each page into a JPEG and rebuild the PDF (always shrinks, but text is no longer selectable). */
async function rasterFallback(input: Buffer, maxB: number): Promise<Buffer | null> {
  if (!(await hasGhostscript())) return null;
  let best: Buffer | null = null;
  await withTmp(async (dir) => {
    const inp = path.join(dir, 'in.pdf');
    await fs.promises.writeFile(inp, input);
    for (const [dpi, q] of [[110, 55], [90, 40], [72, 32], [60, 25], [48, 20], [36, 15]]) {
      for (const f of await fs.promises.readdir(dir)) if (f.startsWith('pg-')) await fs.promises.rm(path.join(dir, f));
      try { await run(GS, ['-sDEVICE=jpeg', `-r${dpi}`, `-dJPEGQ=${q}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${path.join(dir, 'pg-%03d.jpg')}`, inp], { timeout: 180000 }); } catch { continue; }
      const pages = (await fs.promises.readdir(dir)).filter((f) => f.startsWith('pg-')).sort();
      if (!pages.length) continue;
      const pdf = await PDFDocument.create();
      for (const pf of pages) {
        const img = await pdf.embedJpg(await fs.promises.readFile(path.join(dir, pf)));
        const k = 72 / dpi;
        pdf.addPage([img.width * k, img.height * k]).drawImage(img, { x: 0, y: 0, width: img.width * k, height: img.height * k });
      }
      best = Buffer.from(await pdf.save({ useObjectStreams: true }));
      if (best.length <= maxB) break;
    }
  });
  return best;
}

/** Compress a PDF with Ghostscript (several strengths until it fits maxKB). Falls back to pdf-lib re-save. */
export async function compressPdf(input: Buffer, maxKB?: number, minKB?: number, optimize = true) {
  const warnings: string[] = [];
  const maxB = maxKB ? maxKB * 1024 : Infinity;
  let best = input;
  if (optimize && (await hasGhostscript())) {
    const ladder: string[][] = [
      ['-dPDFSETTINGS=/printer'], ['-dPDFSETTINGS=/ebook'], ['-dPDFSETTINGS=/screen'],
      ...[110, 90, 72, 60, 48].map((r) => ['-dPDFSETTINGS=/screen', '-dDownsampleColorImages=true', '-dDownsampleGrayImages=true', `-dColorImageResolution=${r}`, `-dGrayImageResolution=${r}`, `-dMonoImageResolution=${r * 2}`]),
    ];
    await withTmp(async (dir) => {
      const inp = path.join(dir, 'in.pdf');
      await fs.promises.writeFile(inp, input);
      for (let i = 0; i < ladder.length; i++) {
        const out = path.join(dir, `out${i}.pdf`);
        try {
          await run(GS, ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-dNOPAUSE', '-dQUIET', '-dBATCH', ...ladder[i], `-sOutputFile=${out}`, inp], { timeout: 120000 });
          const buf = await fs.promises.readFile(out);
          if (buf.length < best.length) best = buf;
          if (best.length <= maxB) break;
        } catch { /* try next level */ }
      }
    });
    if (best.length > maxB) {
      const r = await rasterFallback(input, maxB);
      if (r && r.length < best.length) { best = r; warnings.push('To fit the size limit, pages were converted to images (text can no longer be selected).'); }
    }
  } else if (optimize) {
    try {
      const doc = await PDFDocument.load(input, { ignoreEncryption: true });
      const buf = Buffer.from(await doc.save({ useObjectStreams: true }));
      if (buf.length < best.length) best = buf;
    } catch { /* keep original */ }
    if (best.length > maxB) warnings.push('Ghostscript is not installed, so strong PDF compression is unavailable. Install it (see README) and try again.');
  }
  const meetsMax = best.length <= maxB;
  if (!meetsMax) warnings.push(`PDF is still ${Math.ceil(best.length / 1024)} KB (limit ${maxKB} KB).`);
  if (minKB && best.length < minKB * 1024) {
    best = Buffer.concat([best, Buffer.from('\n%' + 'x'.repeat(Math.max(0, minKB * 1024 - best.length)) + '\n')]);
    warnings.push(`PDF was smaller than ${minKB} KB, so it was padded.`);
  }
  return { buffer: best, meetsMax, meetsMin: !minKB || best.length >= minKB * 1024, warnings };
}

export async function imageToPdf(img: Buffer): Promise<Buffer> {
  const meta = await sharp(img, { failOn: 'none' }).metadata();
  const isJpg = meta.format === 'jpeg';
  const data = isJpg ? img : await sharp(img, { failOn: 'none' }).png().toBuffer();
  const pdf = await PDFDocument.create();
  const emb = isJpg ? await pdf.embedJpg(data) : await pdf.embedPng(data);
  const k = Math.min(1, 842 / Math.max(emb.width, emb.height));
  const page = pdf.addPage([emb.width * k, emb.height * k]);
  page.drawImage(emb, { x: 0, y: 0, width: emb.width * k, height: emb.height * k });
  return Buffer.from(await pdf.save({ useObjectStreams: true }));
}

export async function pdfFirstPageToImage(pdf: Buffer): Promise<Buffer> {
  if (!(await hasGhostscript())) throw new BadRequestException('Converting a PDF to an image needs Ghostscript on the server (see README).');
  return withTmp(async (dir) => {
    const inp = path.join(dir, 'in.pdf'), out = path.join(dir, 'out.jpg');
    await fs.promises.writeFile(inp, pdf);
    await run(GS, ['-sDEVICE=jpeg', '-r150', '-dJPEGQ=95', '-dFirstPage=1', '-dLastPage=1', '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${out}`, inp], { timeout: 90000 });
    return fs.promises.readFile(out);
  });
}

export async function docxToPdf(docx: Buffer): Promise<Buffer> {
  if (!(await hasLibreOffice())) throw new BadRequestException('Converting DOCX needs LibreOffice on the server (see README). You can still download the original DOCX.');
  return withTmp(async (dir) => {
    const inp = path.join(dir, 'in.docx');
    await fs.promises.writeFile(inp, docx);
    await run('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', dir, inp], { timeout: 120000 });
    return fs.promises.readFile(path.join(dir, 'in.pdf'));
  });
}

/** Text layer of a PDF via Ghostscript's txtwrite (robust on all PDF versions). */
export async function pdfText(pdf: Buffer): Promise<string> {
  if (!(await hasGhostscript())) return '';
  return withTmp(async (dir) => {
    const inp = path.join(dir, 'in.pdf'), out = path.join(dir, 'out.txt');
    await fs.promises.writeFile(inp, pdf);
    await run(GS, ['-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=txtwrite', `-sOutputFile=${out}`, inp], { timeout: 90000 });
    return fs.promises.readFile(out, 'utf8');
  });
}

/** First pages of a PDF as JPEGs (used to OCR scanned PDFs). */
export async function pdfPagesToJpg(pdf: Buffer, maxPages = 2): Promise<Buffer[]> {
  if (!(await hasGhostscript())) return [];
  return withTmp(async (dir) => {
    const inp = path.join(dir, 'in.pdf');
    await fs.promises.writeFile(inp, pdf);
    await run(GS, ['-sDEVICE=jpeg', '-r150', '-dJPEGQ=85', '-dFirstPage=1', `-dLastPage=${maxPages}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${path.join(dir, 'pg-%d.jpg')}`, inp], { timeout: 120000 });
    const names = (await fs.promises.readdir(dir)).filter((f) => f.startsWith('pg-')).sort();
    return Promise.all(names.map((n) => fs.promises.readFile(path.join(dir, n))));
  });
}
