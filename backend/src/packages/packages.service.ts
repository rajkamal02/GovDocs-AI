import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import JSZip from 'jszip';
import { CustomPreset } from '../entities';
import { DocumentsService } from '../documents/documents.service';
import { FilesService } from '../files/files.service';
import { ActivityService } from '../common/activity.service';
import { ProcessingService } from '../processing/processing.service';
import { findPreset } from '../presets/presets.data';
import { Slot } from '../types';
import { fmtKB, normCategory, normSpec, safeName } from '../common';

export function normSlots(raw: any): Slot[] {
  if (!Array.isArray(raw) || !raw.length) throw new BadRequestException('Add at least one file requirement.');
  const seen = new Set<string>();
  return raw.slice(0, 20).map((s: any, i: number) => {
    const label = safeName(String(s.label || `File ${i + 1}`)).slice(0, 60);
    let filename = safeName(String(s.filename || label).replace(/\.[a-z0-9]{2,4}$/i, '')).replace(/\s+/g, '_').toLowerCase();
    while (seen.has(filename)) filename += '_' + (i + 1);
    seen.add(filename);
    return { key: String(s.key || filename).slice(0, 40), label, kind: ['photo', 'signature'].includes(s.kind) ? s.kind : 'document', docCategory: normCategory(s.docCategory), filename, spec: normSpec(s.spec) };
  });
}

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(CustomPreset) private customs: Repository<CustomPreset>,
    private docs: DocumentsService, private proc: ProcessingService, private files: FilesService, private activity: ActivityService,
  ) {}

  async resolve(userId: string, b: { presetId?: string; slots?: any }): Promise<{ name: string; slots: Slot[] }> {
    if (b.presetId) {
      const p = findPreset(b.presetId);
      if (p) return { name: p.name, slots: p.slots };
      const c = await this.customs.findOne({ where: { id: b.presetId, userId } });
      if (c) return { name: c.name, slots: c.slots };
      throw new NotFoundException('Preset not found.');
    }
    return { name: 'Custom', slots: normSlots(b.slots) };
  }

  async buildZip(userId: string, b: { presetId?: string; slots?: any; items?: { slotKey: string; documentId: string }[]; name?: string }) {
    const { name, slots } = await this.resolve(userId, b);
    const zip = new JSZip();
    const report: any[] = [];
    for (const slot of slots) {
      const item = (b.items || []).find((i) => i.slotKey === slot.key);
      if (!item?.documentId) { report.push({ key: slot.key, label: slot.label, status: 'skipped' }); continue; }
      const doc = await this.docs.get(userId, item.documentId);
      try {
        const c = await this.proc.convert(await this.docs.buffer(userId, doc), doc.mimeType, slot.spec, slot.filename);
        zip.file(c.name, c.buffer);
        report.push({ key: slot.key, label: slot.label, status: c.meetsMax && c.meetsMin ? 'ok' : 'warning', file: c.name, size: c.buffer.length, sizeLabel: fmtKB(c.buffer.length), source: doc.name, warnings: c.warnings });
      } catch (e: any) {
        report.push({ key: slot.key, label: slot.label, status: 'error', source: doc.name, warnings: [e?.message || 'Could not process this file'] });
      }
    }
    if (!Object.keys(zip.files).length) throw new BadRequestException('Choose a file for at least one requirement.');
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const zipName = safeName((b.name || `${name}_READY`).replace(/\s+/g, '_')).replace(/\.zip$/i, '') + '.zip';
    return { buffer, zipName, report };
  }

  async build(userId: string, b: any) {
    const { buffer, zipName, report } = await this.buildZip(userId, b);
    const temp = await this.files.createTemp(userId, buffer, zipName, 'application/zip');
    await this.activity.log(userId, 'package', `Built ${zipName} (${report.filter((r) => r.file).length} files, ${fmtKB(buffer.length)})`, { presetId: b.presetId || null });
    return { ...temp, report };
  }
}
