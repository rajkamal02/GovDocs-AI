import { BadRequestException, Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { config } from '../config';
import { Document, Folder, ShareLink } from '../entities';
import { StorageService } from '../common/storage.service';
import { ActivityService } from '../common/activity.service';
import { FilesService } from '../files/files.service';
import { AiService } from '../processing/ai.service';
import { OcrService } from './ocr.service';
import { imageMeta, makeThumb } from '../processing/image.util';
import { normCategory, safeName } from '../common';

const FOLDER_BY_CAT: Record<string, string> = { PASSPORT_PHOTO: 'Photos', SIGNATURE: 'Signatures', AADHAAR: 'Identity', PAN_CARD: 'Identity', GOVT_ID: 'Identity', CERTIFICATE: 'Certificates', MARKSHEET: 'Certificates', RESUME: 'Resume' };

/** Identify the real file type from its bytes (never trust the extension / browser MIME type). */
export function sniff(buf: Buffer, filename: string): { mime: string; ext: string } | null {
  const h = buf.subarray(0, 12);
  if (h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (h.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: 'png' };
  if (h.subarray(0, 4).toString() === 'RIFF' && h.subarray(8, 12).toString() === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (buf.subarray(0, 5).toString() === '%PDF-') return { mime: 'application/pdf', ext: 'pdf' };
  if (h[0] === 0x50 && h[1] === 0x4b && /\.docx$/i.test(filename)) return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' };
  return null;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private docs: Repository<Document>,
    @InjectRepository(Folder) private folders: Repository<Folder>,
    @InjectRepository(ShareLink) private shares: Repository<ShareLink>,
    private storage: StorageService, private files: FilesService, private ai: AiService, private ocr: OcrService, private activity: ActivityService,
  ) {}

  dto(d: Document, snippet?: string) {
    return {
      id: d.id, name: d.name, originalName: d.originalName, mimeType: d.mimeType, ext: d.ext, size: d.size, category: d.category,
      folderId: d.folderId, width: d.width, height: d.height, ocrStatus: d.ocrStatus, createdAt: d.createdAt, updatedAt: d.updatedAt,
      thumbUrl: d.thumbKey ? this.files.thumbUrl(d.userId, d.id) : null, matchSnippet: snippet || null,
    };
  }

  private checkFile(f: Express.Multer.File) {
    const name = Buffer.from(f.originalname, 'latin1').toString('utf8');
    if (f.size > config.maxFileMB * 1024 * 1024) throw new PayloadTooLargeException(`"${name}" is larger than ${config.maxFileMB} MB.`);
    const kind = sniff(f.buffer, name);
    if (!kind) throw new BadRequestException(`"${name}" is not a supported file. Use PDF, JPG, PNG, WEBP or DOCX.`);
    return { name, ...kind };
  }

  async detect(file: Express.Multer.File) {
    const { name, mime } = this.checkFile(file);
    return this.ai.detectCategory(name, file.buffer, mime);
  }

  async upload(userId: string, files: Express.Multer.File[], body: { folderId?: string; categories?: string; names?: string; autoFolder?: string }) {
    if (!files?.length) throw new BadRequestException('Choose at least one file.');
    const cats: string[] = this.parseList(body.categories), names: string[] = this.parseList(body.names);
    const userFolders = await this.folders.find({ where: { userId } });
    if (body.folderId && !userFolders.some((f) => f.id === body.folderId)) throw new BadRequestException('Folder not found.');
    const out: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const { name, mime, ext } = this.checkFile(f);
      const category = cats[i] ? normCategory(cats[i]) : (await this.ai.detectCategory(name, f.buffer, mime)).category;
      let folderId = body.folderId || null;
      if (!folderId && body.autoFolder !== 'false') folderId = userFolders.find((x) => x.name === FOLDER_BY_CAT[category])?.id || null;
      let width: number | null = null, height: number | null = null, thumbKey: string | null = null;
      if (mime.startsWith('image/')) {
        try {
          const m = await imageMeta(f.buffer); width = m.width; height = m.height;
          thumbKey = this.storage.newKey(userId, 'th');
          await this.storage.put(userId, thumbKey, await makeThumb(f.buffer));
        } catch { throw new BadRequestException(`"${name}" looks damaged and could not be read.`); }
      }
      const key = this.storage.newKey(userId, 'u');
      await this.storage.put(userId, key, f.buffer); // original, stored as-is (encrypted) - never modified
      const doc = await this.docs.save(this.docs.create({
        userId, folderId, name: safeName(names[i] || name), originalName: safeName(name), mimeType: mime, ext, size: f.size,
        storageKey: key, thumbKey, category, width, height, ocrStatus: mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'none' : 'queued',
      }));
      if (doc.ocrStatus === 'queued') this.ocr.enqueue(doc.id);
      await this.activity.log(userId, 'upload', `Uploaded ${doc.name}`, { documentId: doc.id });
      out.push(this.dto(doc));
    }
    return out;
  }

  private parseList(s?: string): string[] { try { const v = JSON.parse(s || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } }

  async list(userId: string, q: { search?: string; category?: string; folderId?: string; sort?: string }) {
    const qb = this.docs.createQueryBuilder('d').where('d.userId = :userId', { userId });
    if (q.category) qb.andWhere('d.category = :c', { c: q.category });
    if (q.folderId === 'none') qb.andWhere('d.folderId IS NULL'); else if (q.folderId) qb.andWhere('d.folderId = :f', { f: q.folderId });
    const term = (q.search || '').trim().toLowerCase();
    if (term) qb.andWhere('(LOWER(d.name) LIKE :s OR LOWER(d.ocrText) LIKE :s)', { s: `%${term.replace(/[%_]/g, '')}%` });
    const sorts: Record<string, [string, 'ASC' | 'DESC']> = { date_desc: ['d.createdAt', 'DESC'], date_asc: ['d.createdAt', 'ASC'], name_asc: ['d.name', 'ASC'], name_desc: ['d.name', 'DESC'], size_desc: ['d.size', 'DESC'], size_asc: ['d.size', 'ASC'] };
    const [col, dir] = sorts[q.sort || 'date_desc'] || sorts.date_desc;
    const rows = await qb.orderBy(col, dir).limit(1000).getMany();
    return rows.map((d) => {
      let snip: string | undefined;
      if (term && d.ocrText && !d.name.toLowerCase().includes(term)) {
        const i = d.ocrText.toLowerCase().indexOf(term);
        if (i >= 0) snip = '…' + d.ocrText.slice(Math.max(0, i - 40), i + term.length + 60) + '…';
      }
      return this.dto({ ...d, ocrText: null } as Document, snip);
    });
  }

  async get(userId: string, id: string): Promise<Document> {
    const d = await this.docs.findOne({ where: { id, userId } });
    if (!d) throw new NotFoundException('Document not found.');
    return d;
  }
  async buffer(userId: string, d: Document) { return this.storage.get(userId, d.storageKey); }

  async update(userId: string, id: string, b: { name?: string; folderId?: string | null; category?: string }) {
    const d = await this.get(userId, id);
    if (typeof b.name === 'string') d.name = safeName(b.name, d.name);
    if (b.category) d.category = normCategory(b.category);
    if (b.folderId !== undefined) {
      if (b.folderId && !(await this.folders.findOne({ where: { id: b.folderId, userId } }))) throw new BadRequestException('Folder not found.');
      d.folderId = b.folderId || null;
    }
    return this.dto(await this.docs.save(d));
  }

  async url(userId: string, id: string, download: boolean) {
    const d = await this.get(userId, id);
    if (download) await this.activity.log(userId, 'download', `Downloaded original ${d.name}`, { documentId: d.id });
    return { url: this.files.docUrl(userId, d.id, 600), name: d.originalName };
  }

  async remove(userId: string, id: string) {
    const d = await this.get(userId, id);
    await this.storage.del(d.storageKey); await this.storage.del(d.thumbKey);
    await this.shares.delete({ documentId: d.id });
    await this.docs.delete({ id: d.id });
    await this.activity.log(userId, 'delete', `Deleted ${d.name}`);
    return { ok: true };
  }

  async reOcr(userId: string, id: string) {
    const d = await this.get(userId, id);
    if (d.mimeType.includes('wordprocessing')) throw new BadRequestException('Text search is available for PDFs and images.');
    await this.docs.update(d.id, { ocrStatus: 'queued' }); this.ocr.enqueue(d.id);
    return { ok: true };
  }
}
