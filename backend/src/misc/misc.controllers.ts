import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import JSZip from 'jszip';
import { AuthGuard, CurrentUser, Public } from '../common/auth';
import { Activity, CustomPreset, Document, Folder, ShareLink, TempFile, User } from '../entities';
import { config } from '../config';
import { PRESETS } from '../presets/presets.data';
import { normSlots } from '../packages/packages.service';
import { StorageService } from '../common/storage.service';
import { FilesService } from '../files/files.service';
import { ActivityService } from '../common/activity.service';
import { AiService } from '../processing/ai.service';
import { hasGhostscript, hasLibreOffice } from '../processing/pdf.util';
import { safeName } from '../common';

@Controller('folders')
export class FoldersController {
  constructor(@InjectRepository(Folder) private repo: Repository<Folder>, @InjectRepository(Document) private docs: Repository<Document>) {}
  @Get() async list(@CurrentUser() u: User) {
    const rows = await this.repo.find({ where: { userId: u.id }, order: { createdAt: 'ASC' } });
    const counts = await this.docs.createQueryBuilder('d').select('d.folderId', 'id').addSelect('COUNT(*)', 'n').where('d.userId = :u', { u: u.id }).groupBy('d.folderId').getRawMany();
    return rows.map((f) => ({ ...f, count: Number(counts.find((c) => c.id === f.id)?.n || 0) }));
  }
  @Post() create(@CurrentUser() u: User, @Body() b: any) {
    const name = safeName(String(b.name || ''), '');
    if (!name) throw new BadRequestException('Enter a folder name.');
    return this.repo.save(this.repo.create({ userId: u.id, name, icon: typeof b.icon === 'string' ? b.icon.slice(0, 4) : '📁' }));
  }
  @Patch(':id') async rename(@CurrentUser() u: User, @Param('id') id: string, @Body() b: any) {
    const f = await this.repo.findOne({ where: { id, userId: u.id } });
    if (!f) throw new NotFoundException('Folder not found.');
    if (b.name) f.name = safeName(String(b.name), f.name);
    return this.repo.save(f);
  }
  @Delete(':id') async remove(@CurrentUser() u: User, @Param('id') id: string) {
    await this.docs.update({ folderId: id, userId: u.id }, { folderId: null }); // files are kept, only the folder goes
    await this.repo.delete({ id, userId: u.id });
    return { ok: true };
  }
}

@Controller('presets')
export class PresetsController {
  constructor(@InjectRepository(CustomPreset) private repo: Repository<CustomPreset>) {}
  @Get() async list(@CurrentUser() u: User) {
    const mine = await this.repo.find({ where: { userId: u.id }, order: { createdAt: 'DESC' } });
    return [...PRESETS, ...mine.map((c) => ({ id: c.id, name: c.name, full: 'Your custom preset', category: 'Custom', color: '#0f766e', slots: c.slots, custom: true }))];
  }
  @Post('custom') async create(@CurrentUser() u: User, @Body() b: any) {
    const name = safeName(String(b.name || ''), '');
    if (!name) throw new BadRequestException('Give the preset a name.');
    const c = await this.repo.save(this.repo.create({ userId: u.id, name, slots: normSlots(b.slots) }));
    return { id: c.id, name: c.name, full: 'Your custom preset', category: 'Custom', color: '#0f766e', slots: c.slots, custom: true };
  }
  @Delete('custom/:id') async remove(@CurrentUser() u: User, @Param('id') id: string) { await this.repo.delete({ id, userId: u.id }); return { ok: true }; }
}

@Controller('activity')
export class ActivityController {
  constructor(@InjectRepository(Activity) private repo: Repository<Activity>) {}
  @Get() list(@CurrentUser() u: User, @Query('kind') kind?: string, @Query('limit') limit?: string) {
    const where: any = { userId: u.id };
    if (kind) where.kind = In(kind.split(',').slice(0, 8));
    return this.repo.find({ where, order: { createdAt: 'DESC' }, take: Math.min(500, Number(limit) || 100) });
  }
  @Delete() async clear(@CurrentUser() u: User) { await this.repo.delete({ userId: u.id }); return { ok: true }; }
}

@Controller('account')
export class AccountController {
  constructor(
    @InjectRepository(User) private users: Repository<User>, @InjectRepository(Document) private docs: Repository<Document>,
    @InjectRepository(Folder) private folders: Repository<Folder>, @InjectRepository(Activity) private acts: Repository<Activity>,
    @InjectRepository(ShareLink) private shares: Repository<ShareLink>, @InjectRepository(CustomPreset) private presets: Repository<CustomPreset>,
    @InjectRepository(TempFile) private temps: Repository<TempFile>,
    private storage: StorageService, private files: FilesService, private activity: ActivityService, private guard: AuthGuard,
  ) {}

  @Get('me') me(@CurrentUser() u: User) { return { id: u.id, email: u.email, name: u.name, devMode: !config.clerkSecret }; }

  @Get('stats') async stats(@CurrentUser() u: User) {
    const rows = await this.docs.find({ where: { userId: u.id }, select: ['id', 'category', 'size'] });
    const by: Record<string, { category: string; count: number; bytes: number }> = {};
    for (const d of rows) { const e = (by[d.category] ||= { category: d.category, count: 0, bytes: 0 }); e.count++; e.bytes += d.size; }
    const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
    const acts = await this.acts.find({ where: { userId: u.id }, select: ['kind', 'createdAt'] });
    return {
      documents: rows.length, bytes: rows.reduce((a, d) => a + d.size, 0), byCategory: Object.values(by),
      generatedThisMonth: acts.filter((a) => a.kind === 'generate' && a.createdAt >= month).length,
      downloads: acts.filter((a) => a.kind === 'download' || a.kind === 'generate' || a.kind === 'package').length,
      shares: await this.shares.count({ where: { userId: u.id } }),
    };
  }

  @Post('export') async export(@CurrentUser() u: User) {
    const folders = await this.folders.find({ where: { userId: u.id } });
    const docs = await this.docs.find({ where: { userId: u.id } });
    if (!docs.length) throw new BadRequestException('You have no documents to export.');
    const zip = new JSZip(); const used = new Set<string>();
    for (const d of docs) {
      const dir = safeName(folders.find((f) => f.id === d.folderId)?.name || 'Unfiled');
      let p = `${dir}/${d.originalName}`, n = 1;
      while (used.has(p)) p = `${dir}/${n++}_${d.originalName}`;
      used.add(p);
      zip.file(p, await this.storage.get(u.id, d.storageKey));
    }
    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
    await this.activity.log(u.id, 'download', `Exported all documents (${docs.length} files)`);
    return this.files.createTemp(u.id, buf, 'GovDocs_export.zip', 'application/zip', 15);
  }

  private async wipeDocs(userId: string) {
    for (const d of await this.docs.find({ where: { userId } })) { await this.storage.del(d.storageKey); await this.storage.del(d.thumbKey); }
    await this.docs.delete({ userId }); await this.shares.delete({ userId });
  }
  @Delete('documents') async deleteDocs(@CurrentUser() u: User) { await this.wipeDocs(u.id); await this.activity.log(u.id, 'delete', 'Deleted all documents'); return { ok: true }; }

  @Delete() async deleteAccount(@CurrentUser() u: User) {
    await this.wipeDocs(u.id);
    for (const t of await this.temps.find({ where: { userId: u.id } })) await this.files.removeTemp(t);
    await this.acts.delete({ userId: u.id }); await this.presets.delete({ userId: u.id }); await this.folders.delete({ userId: u.id });
    await this.users.delete({ id: u.id }); this.guard.forget(u.clerkId);
    return { ok: true };
  }
}

@Controller('health')
export class HealthController {
  constructor(private ai: AiService, private storage: StorageService) {}
  @Public() @Get() async health() {
    return {
      ok: true, db: config.db.type === 'postgres' ? 'PostgreSQL' : 'Local file (sql.js)', storage: this.storage.driver === 's3' ? 'AWS S3 (encrypted)' : 'Local disk (encrypted)',
      auth: config.clerkSecret ? 'Clerk' : 'Dev mode (no login)', ghostscript: await hasGhostscript(), libreoffice: await hasLibreOffice(),
      ai: this.ai.enabled, aiImages: this.ai.imagesEnabled, ocrLangs: config.ocrLangs, maxFileMB: config.maxFileMB, tempTtlMinutes: config.tempTtlMin,
    };
  }
}
