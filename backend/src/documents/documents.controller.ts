import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/auth';
import { User } from '../entities';
import { config } from '../config';
import { DocumentsService } from './documents.service';

const mem = { storage: memoryStorage(), limits: { fileSize: config.maxFileMB * 1024 * 1024 } };

@Controller('documents')
export class DocumentsController {
  constructor(private svc: DocumentsService) {}

  @Get() list(@CurrentUser() u: User, @Query() q: any) { return this.svc.list(u.id, q); }

  @Post('detect') @UseInterceptors(FileInterceptor('file', mem))
  detect(@UploadedFile() f: Express.Multer.File) { return this.svc.detect(f); }

  @Post() @UseInterceptors(FilesInterceptor('files', 50, mem))
  upload(@CurrentUser() u: User, @UploadedFiles() files: Express.Multer.File[], @Body() b: any) { return this.svc.upload(u.id, files, b); }

  @Get(':id') async one(@CurrentUser() u: User, @Param('id') id: string) { return this.svc.dto(await this.svc.get(u.id, id)); }
  @Get(':id/url') url(@CurrentUser() u: User, @Param('id') id: string, @Query('download') dl: string) { return this.svc.url(u.id, id, dl === '1'); }
  @Patch(':id') update(@CurrentUser() u: User, @Param('id') id: string, @Body() b: any) { return this.svc.update(u.id, id, b); }
  @Post(':id/ocr') ocr(@CurrentUser() u: User, @Param('id') id: string) { return this.svc.reOcr(u.id, id); }
  @Delete(':id') remove(@CurrentUser() u: User, @Param('id') id: string) { return this.svc.remove(u.id, id); }
}
