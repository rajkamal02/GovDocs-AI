import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../common/auth';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private files: FilesService) {}

  /** Signed, expiring URL. Access = possession of the token. Temp files are deleted after ?dl=1. */
  @Public()
  @Get(':token')
  async serve(@Param('token') token: string, @Query('dl') dl: string, @Res() res: Response) {
    const r = await this.files.resolve(token);
    if (!r) throw new NotFoundException('This link has expired or the file was already downloaded.');
    const inline = !dl && /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(r.mime);
    res.set({
      'Content-Type': r.mime,
      'Content-Length': String(r.buf.length),
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(r.filename)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    if (dl && r.temp) await this.files.removeTemp(r.temp); // processed copy is removed the moment it is handed over
    res.end(r.buf);
  }
}
