import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, TempFile } from '../entities';
import { DocumentsService } from '../documents/documents.service';
import { FilesService } from '../files/files.service';
import { StorageService } from '../common/storage.service';
import { ActivityService } from '../common/activity.service';
import { AiService } from './ai.service';
import { FileSpec } from '../types';
import { baseName, fmtKB, normCategory, normSpec, safeName, toNum } from '../common';
import { Fmt, processImage } from './image.util';
import { compressPdf, docxToPdf, imageToPdf, pdfFirstPageToImage } from './pdf.util';
import { cleanSignature, enhancePhoto } from './enhance.util';

export interface Converted { buffer: Buffer; mime: string; ext: string; name: string; warnings: string[]; meetsMax: boolean; meetsMin: boolean; width?: number; height?: number }

@Injectable()
export class ProcessingService {
  constructor(
    private docs: DocumentsService, private files: FilesService, private ai: AiService, private storage: StorageService, private activity: ActivityService,
    @InjectRepository(TempFile) private temps: Repository<TempFile>,
  ) {}

  /** Core engine: any supported file -> the requested format/size/dimensions. Never touches the original. */
  async convert(buf: Buffer, srcMime: string, spec: FileSpec, base: string): Promise<Converted> {
    const warnings: string[] = [];
    const src = srcMime.startsWith('image/') ? 'image' : srcMime === 'application/pdf' ? 'pdf' : 'docx';
    const target = spec.format && spec.format !== 'original' ? spec.format
      : src === 'image' ? (srcMime === 'image/png' ? 'png' : srcMime === 'image/webp' ? 'webp' : 'jpg') : src === 'pdf' ? 'pdf' : 'docx';
    if (src === 'docx' && target === 'docx') return { buffer: buf, mime: srcMime, ext: 'docx', name: `${base}.docx`, warnings, meetsMax: true, meetsMin: true };

    let work = buf, cur: 'image' | 'pdf' = src === 'docx' ? 'pdf' : (src as any);
    if (src === 'docx') work = await docxToPdf(buf);
    if (cur === 'pdf' && target !== 'pdf') { work = await pdfFirstPageToImage(work); cur = 'image'; warnings.push('Only the first page was converted.'); }

    const imgOpts = { width: spec.width, height: spec.height, fit: spec.fit, minKB: spec.minKB, maxKB: spec.maxKB, quality: spec.quality, dpi: spec.dpi, background: spec.background };
    if (cur === 'image' && target !== 'pdf') {
      const r = await processImage(work, { format: target as Fmt, ...imgOpts });
      return { buffer: r.buffer, mime: r.mime, ext: r.ext, name: `${base}.${r.ext}`, warnings: [...warnings, ...r.warnings], meetsMax: r.meetsMax, meetsMin: r.meetsMin, width: r.width, height: r.height };
    }
    if (cur === 'pdf') {
      const r = await compressPdf(work, spec.maxKB, spec.minKB, spec.optimizePdf !== false);
      return { buffer: r.buffer, mime: 'application/pdf', ext: 'pdf', name: `${base}.pdf`, warnings: [...warnings, ...r.warnings], meetsMax: r.meetsMax, meetsMin: r.meetsMin };
    }
    // image -> pdf
    let budget = spec.maxKB ? Math.max(3, spec.maxKB * 0.95 - 2) : undefined;
    for (let i = 0; ; i++) {
      const img = await processImage(work, { format: 'jpg', ...imgOpts, maxKB: budget, minKB: undefined, quality: spec.quality ?? (budget ? undefined : 85), allowDownscale: true });
      let pdf = await imageToPdf(img.buffer);
      if (!spec.maxKB || pdf.length <= spec.maxKB * 1024 || i >= 4) {
        let meetsMin = !spec.minKB || pdf.length >= spec.minKB * 1024;
        if (!meetsMin) { pdf = Buffer.concat([pdf, Buffer.from('\n%' + 'x'.repeat(spec.minKB! * 1024 - pdf.length) + '\n')]); meetsMin = true; warnings.push(`PDF was padded to reach ${spec.minKB} KB.`); }
        const meetsMax = !spec.maxKB || pdf.length <= spec.maxKB * 1024;
        if (!meetsMax) warnings.push(`PDF is ${Math.ceil(pdf.length / 1024)} KB (limit ${spec.maxKB} KB).`);
        return { buffer: pdf, mime: 'application/pdf', ext: 'pdf', name: `${base}.pdf`, warnings: [...warnings, ...img.warnings.filter((w) => !w.includes('smaller than'))], meetsMax, meetsMin };
      }
      budget = budget! * 0.85;
    }
  }

  private result(temp: any, r: { warnings: string[]; meetsMax: boolean; meetsMin: boolean; width?: number; height?: number }, extra: any = {}) {
    return { ...temp, width: r.width ?? null, height: r.height ?? null, meetsMax: r.meetsMax, meetsMin: r.meetsMin, warnings: r.warnings, ...extra };
  }

  async generate(userId: string, body: any) {
    const doc = await this.docs.get(userId, String(body.documentId || ''));
    const spec = normSpec(body.spec);
    const c = await this.convert(await this.docs.buffer(userId, doc), doc.mimeType, spec, baseName(doc.originalName));
    const temp = await this.files.createTemp(userId, c.buffer, c.name, c.mime);
    await this.activity.log(userId, 'generate', `Prepared ${c.name} (${fmtKB(c.buffer.length)})`, { documentId: doc.id, preset: body.presetId || null });
    return this.result(temp, c);
  }

  private async imageDoc(userId: string, id: any): Promise<{ doc: Document; buf: Buffer }> {
    const doc = await this.docs.get(userId, String(id || ''));
    if (!doc.mimeType.startsWith('image/')) throw new BadRequestException('Please choose an image (JPG, PNG or WEBP).');
    return { doc, buf: await this.docs.buffer(userId, doc) };
  }

  async photo(userId: string, b: any) {
    const { doc, buf } = await this.imageDoc(userId, b.documentId);
    const width = toNum(b.width, 20, 4000) ?? 200, height = toNum(b.height, 20, 4000) ?? 230;
    const format = (['jpg', 'png', 'webp'].includes(b.format) ? b.format : 'jpg') as Fmt;
    const face = b.centerFace === false ? null : await this.ai.faceBox(buf);
    const brightness = b.brightness === undefined || b.brightness === null || b.brightness === 'auto' ? null : toNum(b.brightness, -50, 50) ?? 0;
    const e = await enhancePhoto(buf, {
      width, height, bg: typeof b.bg === 'string' ? b.bg : '#ffffff', brightness, contrast: toNum(b.contrast, -50, 50) ?? 0,
      removeBg: b.removeBg !== false, centerFace: b.centerFace !== false, face,
    });
    const r = await processImage(e.buffer, { format, width, height, fit: 'fill', minKB: toNum(b.minKB, 0.1, 100000), maxKB: toNum(b.maxKB, 0.1, 100000), dpi: toNum(b.dpi, 36, 1200) });
    if (r.meetsMax) e.steps.push(`Compressed to ${fmtKB(r.buffer.length)}`);
    const name = `${baseName(doc.originalName)}_photo.${r.ext}`;
    const temp = await this.files.createTemp(userId, r.buffer, name, r.mime);
    await this.activity.log(userId, 'generate', `Enhanced passport photo ${name} (${fmtKB(r.buffer.length)})`, { documentId: doc.id });
    return this.result(temp, { ...r, warnings: [...e.warnings, ...r.warnings] }, { steps: e.steps, sourceUrl: this.files.docUrl(userId, doc.id, 900) });
  }

  async signature(userId: string, b: any) {
    const { doc, buf } = await this.imageDoc(userId, b.documentId);
    const transparent = b.transparent === true;
    const format = (transparent ? 'png' : ['jpg', 'png'].includes(b.format) ? b.format : 'jpg') as Fmt;
    const c = await cleanSignature(buf, { removeBg: b.removeBg !== false, darken: toNum(b.darken, 0, 100) ?? 40, smooth: b.smooth !== false, autoCrop: b.autoCrop !== false, transparent });
    const r = await processImage(c.buffer, {
      format, width: toNum(b.width, 20, 4000), height: toNum(b.height, 20, 4000), fit: 'contain', keepAlpha: transparent,
      minKB: toNum(b.minKB, 0.1, 100000), maxKB: toNum(b.maxKB, 0.1, 100000), dpi: toNum(b.dpi, 36, 1200), background: '#ffffff',
    });
    if (r.meetsMax) c.steps.push(`Compressed to ${fmtKB(r.buffer.length)}`);
    const name = `${baseName(doc.originalName)}_clean.${r.ext}`;
    const temp = await this.files.createTemp(userId, r.buffer, name, r.mime);
    await this.activity.log(userId, 'generate', `Cleaned signature ${name} (${fmtKB(r.buffer.length)})`, { documentId: doc.id });
    return this.result(temp, { ...r, warnings: [...c.warnings, ...r.warnings] }, { steps: c.steps, sourceUrl: this.files.docUrl(userId, doc.id, 900) });
  }

  async detectRequirements(userId: string, text: string, image?: Express.Multer.File) {
    if (!text?.trim() && !image) throw new BadRequestException('Paste the requirement text or upload a screenshot.');
    if (image && !/^image\//.test(image.mimetype)) throw new BadRequestException('The screenshot must be an image.');
    const r = await this.ai.detectRequirements((text || '').slice(0, 20000), image?.buffer);
    await this.activity.log(userId, 'ai', `Detected requirements (${r.items.length} files, ${r.source === 'ai' ? 'AI' : 'rules'})`);
    return r;
  }

  /** Save a processed result into the vault as a NEW document (the original stays untouched). */
  async saveToVault(userId: string, b: { tempId: string; name?: string; category?: string; folderId?: string }) {
    const t = await this.files.getTempBuffer(userId, String(b.tempId || ''));
    if (!t) throw new BadRequestException('This result has expired. Please process the file again.');
    const name = safeName(b.name || t.row.filename);
    const file: any = { buffer: t.buf, size: t.buf.length, originalname: Buffer.from(name, 'utf8').toString('latin1'), mimetype: t.row.mime };
    const [doc] = await this.docs.upload(userId, [file], { folderId: b.folderId, categories: JSON.stringify([normCategory(b.category)]) });
    await this.files.removeTemp(t.row);
    return doc;
  }
}
