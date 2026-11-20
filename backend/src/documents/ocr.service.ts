import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fork } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { config } from '../config';
import { Document } from '../entities';
import { StorageService } from '../common/storage.service';
import { hasGhostscript, pdfPagesToJpg, pdfText } from '../processing/pdf.util';

/** Searchable text for uploaded files. One job at a time, in the background, image OCR in an isolated child process. */
@Injectable()
export class OcrService {
  private log = new Logger('OCR');
  private imgChain: Promise<any> = Promise.resolve();
  private pdfChain: Promise<any> = Promise.resolve();

  constructor(@InjectRepository(Document) private docs: Repository<Document>, private storage: StorageService) {}

  async enqueue(docId: string) {
    const d = await this.docs.findOne({ where: { id: docId }, select: ['id', 'mimeType'] });
    if (d?.mimeType === 'application/pdf') this.pdfChain = this.pdfChain.then(() => this.run(docId)).catch(() => undefined);
    else this.imgChain = this.imgChain.then(() => this.run(docId)).catch(() => undefined);
  }

  private ocrImageFile(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const cp = fork(path.join(__dirname, 'ocr.worker.js'));
      const timer = setTimeout(() => { cp.kill(); reject(new Error('OCR timed out')); }, 180000);
      cp.on('message', (m: any) => { clearTimeout(timer); m.ok ? resolve(m.text) : reject(new Error(m.error)); });
      cp.on('error', (e) => { clearTimeout(timer); reject(e); });
      cp.on('exit', () => { clearTimeout(timer); reject(new Error('OCR process ended')); });
      cp.send({ file, langs: config.ocrLangs.split('+'), cachePath: config.dataDir });
    });
  }

  private async run(docId: string) {
    const d = await this.docs.findOne({ where: { id: docId } });
    if (!d) return;
    let tmp: string | null = null;
    try {
      await this.docs.update(d.id, { ocrStatus: 'running' });
      const buf = await this.storage.get(d.userId, d.storageKey);
      let text = '';
      if (d.mimeType === 'application/pdf') {
        try { text = await pdfText(buf); } catch { /* try next method */ }
        if (text.trim().length < 20) {
          try { text = (await require('pdf-parse/lib/pdf-parse.js')(buf)).text || ''; } catch { /* scanned / unusual PDF */ }
        }
        if (text.trim().length < 20 && (await hasGhostscript())) { // scanned PDF: OCR the first pages
          const parts: string[] = [];
          for (const page of await pdfPagesToJpg(buf, 2)) {
            const t = path.join(os.tmpdir(), `govdocs-ocr-${randomUUID()}.png`);
            try { await fs.promises.writeFile(t, await sharp(page).greyscale().normalise().png().toBuffer()); parts.push(await this.ocrImageFile(t)); }
            finally { fs.promises.rm(t, { force: true }).catch(() => undefined); }
          }
          text = parts.join(' ');
        }
      } else if (d.mimeType.startsWith('image/')) {
        const png = await sharp(buf, { failOn: 'none' }).rotate().resize(2200, 2200, { fit: 'inside', withoutEnlargement: true }).greyscale().normalise().png().toBuffer();
        tmp = path.join(os.tmpdir(), `govdocs-ocr-${randomUUID()}.png`);
        await fs.promises.writeFile(tmp, png);
        text = await this.ocrImageFile(tmp);
      }
      text = text.replace(/\s+/g, ' ').trim().slice(0, 200000);
      await this.docs.update(d.id, { ocrText: text || null, ocrStatus: text ? 'done' : 'empty' });
    } catch (e: any) {
      this.log.warn(`OCR skipped for ${docId}: ${e?.message}`);
      await this.docs.update(d.id, { ocrStatus: 'failed' });
    } finally {
      if (tmp) fs.promises.rm(tmp, { force: true }).catch(() => undefined);
    }
  }
}
