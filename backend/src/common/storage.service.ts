import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { config } from '../config';
import { CryptoService } from './crypto.service';

/** Encrypted blob storage. Every object is encrypted BEFORE it is written (disk or S3). */
@Injectable()
export class StorageService {
  private s3: any = null;
  constructor(private crypto: CryptoService) {
    fs.mkdirSync(config.storage.dir, { recursive: true });
  }
  get driver(): 's3' | 'local' { return config.storage.bucket ? 's3' : 'local'; }

  newKey(userId: string, kind: 'u' | 't' | 'th') { return `${kind}/${userId}/${randomUUID()}`; }

  private pathFor(key: string) {
    if (!/^(u|t|th)\/[\w-]+\/[\w-]+$/.test(key)) throw new Error('Invalid storage key');
    return path.join(config.storage.dir, key);
  }
  private async client() {
    if (!this.s3) { const { S3Client } = await import('@aws-sdk/client-s3'); this.s3 = new S3Client({ region: config.storage.region, ...(config.storage.endpoint ? { endpoint: config.storage.endpoint, forcePathStyle: true } : {}) }); }
    return this.s3;
  }

  async put(userId: string, key: string, data: Buffer) {
    const blob = this.crypto.encrypt(userId, data);
    if (this.driver === 's3') {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      await (await this.client()).send(new PutObjectCommand({ Bucket: config.storage.bucket, Key: key, Body: blob, ...(config.storage.endpoint ? {} : { ServerSideEncryption: 'AES256' }) }));
    } else {
      const p = this.pathFor(key);
      await fs.promises.mkdir(path.dirname(p), { recursive: true });
      await fs.promises.writeFile(p, blob);
    }
  }

  async get(userId: string, key: string): Promise<Buffer> {
    let blob: Buffer;
    if (this.driver === 's3') {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const out = await (await this.client()).send(new GetObjectCommand({ Bucket: config.storage.bucket, Key: key }));
      const chunks: Buffer[] = [];
      for await (const ch of out.Body as any) chunks.push(Buffer.from(ch));
      blob = Buffer.concat(chunks);
    } else {
      blob = await fs.promises.readFile(this.pathFor(key));
    }
    return this.crypto.decrypt(userId, blob);
  }

  async del(key: string | null | undefined) {
    if (!key) return;
    try {
      if (this.driver === 's3') {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        await (await this.client()).send(new DeleteObjectCommand({ Bucket: config.storage.bucket, Key: key }));
      } else {
        await fs.promises.rm(this.pathFor(key), { force: true });
      }
    } catch { /* already gone */ }
  }
}
