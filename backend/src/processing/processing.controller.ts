import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/auth';
import { User } from '../entities';
import { ProcessingService } from './processing.service';

@Controller('process')
export class ProcessingController {
  constructor(private svc: ProcessingService) {}
  @Post('generate') generate(@CurrentUser() u: User, @Body() b: any) { return this.svc.generate(u.id, b); }
  @Post('photo') photo(@CurrentUser() u: User, @Body() b: any) { return this.svc.photo(u.id, b); }
  @Post('signature') signature(@CurrentUser() u: User, @Body() b: any) { return this.svc.signature(u.id, b); }
  @Post('save') save(@CurrentUser() u: User, @Body() b: any) { return this.svc.saveToVault(u.id, b); }
  @Post('detect-requirements') @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }))
  detect(@CurrentUser() u: User, @Body('text') text: string, @UploadedFile() image?: Express.Multer.File) { return this.svc.detectRequirements(u.id, text, image); }
}
