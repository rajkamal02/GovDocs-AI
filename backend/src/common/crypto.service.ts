import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { masterKeyMaterial } from '../config';

/** AES-256-GCM encryption with a separate key derived (HKDF) for every user, plus HMAC-signed URL tokens. */
@Injectable()
export class CryptoService {
  private master = crypto.createHash('sha256').update(masterKeyMaterial()).digest();
  private signKey = Buffer.from(crypto.hkdfSync('sha256', this.master, Buffer.from('govdocs'), Buffer.from('token-signing'), 32));

  private userKey(userId: string) {
    return Buffer.from(crypto.hkdfSync('sha256', this.master, Buffer.from('govdocs'), Buffer.from('user:' + userId), 32));
  }

  encrypt(userId: string, data: Buffer): Buffer {
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv('aes-256-gcm', this.userKey(userId), iv);
    const enc = Buffer.concat([c.update(data), c.final()]);
    return Buffer.concat([iv, c.getAuthTag(), enc]);
  }

  decrypt(userId: string, blob: Buffer): Buffer {
    if (blob.length < 29) throw new Error('Corrupt file');
    const d = crypto.createDecipheriv('aes-256-gcm', this.userKey(userId), blob.subarray(0, 12));
    d.setAuthTag(blob.subarray(12, 28));
    return Buffer.concat([d.update(blob.subarray(28)), d.final()]);
  }

  sign(payload: Record<string, any>, ttlSec: number): string {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec })).toString('base64url');
    const sig = crypto.createHmac('sha256', this.signKey).update(body).digest('base64url');
    return `${body}.${sig}`;
  }

  verify(token: string): Record<string, any> | null {
    const [body, sig] = String(token || '').split('.');
    if (!body || !sig) return null;
    const expect = crypto.createHmac('sha256', this.signKey).update(body).digest();
    let given: Buffer;
    try { given = Buffer.from(sig, 'base64url'); } catch { return null; }
    if (given.length !== expect.length || !crypto.timingSafeEqual(given, expect)) return null;
    try {
      const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      return p.exp && p.exp > Date.now() / 1000 ? p : null;
    } catch { return null; }
  }
}
