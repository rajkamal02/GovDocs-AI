import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { config } from '../config';
import { ShareLink } from '../entities';
import { DocumentsService } from '../documents/documents.service';
import { FilesService } from '../files/files.service';
import { ActivityService } from '../common/activity.service';
import { ProcessingService } from '../processing/processing.service';
import { PackagesService, normSlots } from '../packages/packages.service';
import { baseName, normSpec, safeName, toNum } from '../common';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(ShareLink) private repo: Repository<ShareLink>,
    private docs: DocumentsService, private files: FilesService, private proc: ProcessingService, private pkgs: PackagesService, private activity: ActivityService,
  ) {}

  private status(l: ShareLink) {
    if (l.revoked) return 'revoked';
    if (l.expiresAt && l.expiresAt < Date.now()) return 'expired';
    if (l.viewLimit && l.downloads >= l.viewLimit) return 'limit';
    return 'active';
  }
  private dto(l: ShareLink) {
    return { id: l.id, token: l.token, link: `${config.frontendUrl}/s/${l.token}`, label: l.label, targetType: l.targetType, hasPassword: !!l.passwordHash, expiresAt: l.expiresAt, viewLimit: l.viewLimit, views: l.views, downloads: l.downloads, status: this.status(l), createdAt: l.createdAt };
  }

  async list(userId: string) { return (await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } })).map((l) => this.dto(l)); }

  async create(userId: string, b: any) {
    const link = this.repo.create({ userId, token: randomBytes(9).toString('base64url'), views: 0, downloads: 0, revoked: false, settings: null, recipe: null, documentId: null, passwordHash: null, expiresAt: null, viewLimit: null });
    if (b.recipe) {
      const r = b.recipe;
      await this.pkgs.resolve(userId, r); // validates preset/slots
      if (!Array.isArray(r.items) || !r.items.length) throw new BadRequestException('Choose files for the package.');
      for (const it of r.items) await this.docs.get(userId, String(it.documentId));
      link.targetType = 'package';
      link.recipe = { presetId: r.presetId || null, slots: r.presetId ? null : normSlots(r.slots), items: r.items.map((i: any) => ({ slotKey: String(i.slotKey), documentId: String(i.documentId) })) };
      link.label = safeName(b.label || 'Document package');
    } else {
      const d = await this.docs.get(userId, String(b.documentId || ''));
      link.targetType = 'document'; link.documentId = d.id;
      link.settings = b.settings ? normSpec(b.settings) : null;
      link.label = safeName(b.label || d.name);
    }
    const hours = toNum(b.expiryHours, 0.05, 24 * 365);
    if (hours) link.expiresAt = Date.now() + hours * 3600_000;
    const limit = toNum(b.viewLimit, 1, 10000);
    if (limit) link.viewLimit = Math.round(limit);
    if (typeof b.password === 'string' && b.password) {
      if (b.password.length < 4) throw new BadRequestException('Password must be at least 4 characters.');
      link.passwordHash = await bcrypt.hash(b.password, 10);
    }
    const saved = await this.repo.save(link);
    await this.activity.log(userId, 'share', `Created share link "${saved.label}"`);
    return this.dto(saved);
  }

  async revoke(userId: string, id: string) {
    const l = await this.repo.findOne({ where: { id, userId } });
    if (!l) throw new NotFoundException('Link not found.');
    l.revoked = true; await this.repo.save(l);
    return { ok: true };
  }
  async remove(userId: string, id: string) { await this.repo.delete({ id, userId }); return { ok: true }; }

  private async byToken(token: string) {
    const l = await this.repo.findOne({ where: { token: String(token).slice(0, 40) } });
    if (!l) throw new NotFoundException('This link does not exist.');
    return l;
  }

  async publicInfo(token: string) {
    const l = await this.byToken(token);
    l.views++; await this.repo.save(l);
    const status = this.status(l);
    return { label: status === 'active' ? l.label : null, requiresPassword: !!l.passwordHash, status, kind: l.targetType };
  }

  async access(token: string, password?: string) {
    const l = await this.byToken(token);
    const s = this.status(l);
    if (s !== 'active') throw new ForbiddenException(s === 'limit' ? 'This link reached its download limit.' : `This link is ${s}.`);
    if (l.passwordHash && !(await bcrypt.compare(String(password || ''), l.passwordHash))) throw new ForbiddenException('Wrong password.');
    let url: string, name: string;
    if (l.targetType === 'document') {
      const d = await this.docs.get(l.userId, l.documentId!);
      if (l.settings && Object.keys(l.settings).length) {
        const c = await this.proc.convert(await this.docs.buffer(l.userId, d), d.mimeType, l.settings, baseName(d.originalName));
        const t = await this.files.createTemp(l.userId, c.buffer, c.name, c.mime, 10);
        url = t.url; name = c.name;
      } else { url = this.files.docUrl(l.userId, d.id, 300); name = d.originalName; }
    } else {
      const { buffer, zipName } = await this.pkgs.buildZip(l.userId, { presetId: l.recipe.presetId || undefined, slots: l.recipe.slots, items: l.recipe.items, name: l.label });
      const t = await this.files.createTemp(l.userId, buffer, zipName, 'application/zip', 10);
      url = t.url; name = zipName;
    }
    l.downloads++; await this.repo.save(l);
    await this.activity.log(l.userId, 'share', `Someone downloaded "${l.label}" from a share link`);
    return { url: `${url}?dl=1`, name };
  }
}
