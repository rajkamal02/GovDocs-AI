import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { config } from './config';
import { ENTITIES } from './entities';
import { CryptoService } from './common/crypto.service';
import { StorageService } from './common/storage.service';
import { ActivityService } from './common/activity.service';
import { AuthGuard } from './common/auth';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { DocumentsController } from './documents/documents.controller';
import { DocumentsService } from './documents/documents.service';
import { OcrService } from './documents/ocr.service';
import { AiService } from './processing/ai.service';
import { ProcessingController } from './processing/processing.controller';
import { ProcessingService } from './processing/processing.service';
import { PackagesController } from './packages/packages.controller';
import { PackagesService } from './packages/packages.service';
import { ShareController } from './share/share.controller';
import { ShareService } from './share/share.service';
import { AccountController, ActivityController, FoldersController, HealthController, PresetsController } from './misc/misc.controllers';

const db: any = config.db.type === 'postgres'
  ? { type: 'postgres', url: config.db.url, ssl: config.db.ssl ? { rejectUnauthorized: false } : false, entities: ENTITIES, synchronize: config.db.sync }
  : { type: 'sqljs', location: config.db.file, autoSave: true, entities: ENTITIES, synchronize: true };

@Module({
  imports: [TypeOrmModule.forRoot(db), TypeOrmModule.forFeature(ENTITIES), ScheduleModule.forRoot(), ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }])],
  controllers: [FilesController, DocumentsController, ProcessingController, PackagesController, ShareController, FoldersController, PresetsController, ActivityController, AccountController, HealthController],
  providers: [
    CryptoService, StorageService, ActivityService, FilesService, AiService, OcrService, DocumentsService, ProcessingService, PackagesService, ShareService, AuthGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useExisting: AuthGuard },
  ],
})
export class AppModule {}
