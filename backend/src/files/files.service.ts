import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { config } from '../config';
import { Document, TempFile } from '../entities';
import { CryptoService } from '../common/crypto.service';
import { StorageService } from '../common/storage.service';

@Injectable()
export class FilesService {
  constructor(
    private crypto: CryptoService,
    private storage: StorageService,
    @InjectRepository(TempFile) private temps: Repository<TempFile>,
    @InjectRepository(Document) private docs: Repository<Document>,
  ) {}

  url(token: string) { return `${config.publicApiUrl}/api/files/${token}`; }
  docUrl(userId: string, docId: string, ttlSec = 900) { return this.url(this.crypto.sign({ t: 'd', i: docId, u: userId }, ttlSec)); }
  thumbUrl(userId: string, docId: string) { return this.url(this.crypto.sign({ t: 'th', i: docId, u: userId }, 3600)); }

  /** Processed copies live here (encrypted, auto-deleted after download or TTL). Originals are never touched. */
  async createTemp(userId: string, buf: Buffer, filename: string, mime: string, ttlMin = config.tempTtlMin) {
    const key = this.storage.newKey(userId, 't');
    await this.storage.put(userId, key, buf);
    const row = await this.temps.save(this.temps.create({ userId, storageKey: key, filename, mime, size: buf.length, expiresAt: Date.now() + ttlMin * 60000 }));
    return { id: row.id, name: filename, size: buf.length, mime, url: this.url(this.crypto.sign({ t: 't', i: row.id, u: userId }, ttlMin * 60)) };
  }

  async getTempBuffer(userId: string, tempId: string) {
    const row = await this.temps.findOne({ where: { id: tempId, userId } });
    if (!row || row.expiresAt < Date.now()) return null;
    return { row, buf: await this.storage.get(userId, row.storageKey) };
  }

  async resolve(token: string): Promise<{ buf: Buffer; filename: string; mime: string; temp?: TempFile } | null> {
    const p = this.crypto.verify(token);
    if (!p) return null;
    try {
      if (p.t === 't') {
        const r = await this.getTempBuffer(p.u, p.i);
        return r ? { buf: r.buf, filename: r.row.filename, mime: r.row.mime, temp: r.row } : null;
      }
      const d = await this.docs.findOne({ where: { id: p.i, userId: p.u } });
      if (!d) return null;
      if (p.t === 'th') return d.thumbKey ? { buf: await this.storage.get(p.u, d.thumbKey), filename: 'thumb.jpg', mime: 'image/jpeg' } : null;
      return { buf: await this.storage.get(p.u, d.storageKey), filename: d.originalName || d.name, mime: d.mimeType };
    } catch { return null; }
  }

  async removeTemp(row: TempFile) {
    await this.storage.del(row.storageKey);
    await this.temps.delete({ id: row.id });
  }

  @Cron('*/10 * * * *')
  async cleanup() {
    const old = await this.temps.find({ where: { expiresAt: LessThan(Date.now()) } });
    for (const r of old) await this.removeTemp(r);
  }
}
