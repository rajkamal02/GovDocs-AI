import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ type: 'varchar' }) clerkId: string;
  @Column({ type: 'varchar', nullable: true }) email: string | null;
  @Column({ type: 'varchar', nullable: true }) name: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Column({ type: 'varchar' }) name: string;
  @Column({ type: 'varchar', nullable: true }) icon: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Column({ type: 'varchar', nullable: true }) folderId: string | null;
  @Column({ type: 'varchar' }) name: string;
  @Column({ type: 'varchar' }) originalName: string;
  @Column({ type: 'varchar' }) mimeType: string;
  @Column({ type: 'varchar' }) ext: string;
  @Column({ type: 'float' }) size: number;
  @Column({ type: 'varchar' }) storageKey: string;
  @Column({ type: 'varchar', nullable: true }) thumbKey: string | null;
  @Column({ type: 'varchar', default: 'OTHER' }) category: string;
  @Column({ type: 'text', nullable: true }) ocrText: string | null;
  @Column({ type: 'varchar', default: 'none' }) ocrStatus: string;
  @Column({ type: 'integer', nullable: true }) width: number | null;
  @Column({ type: 'integer', nullable: true }) height: number | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('activity')
export class Activity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Column({ type: 'varchar' }) kind: string; // upload | download | generate | package | share | ai
  @Column({ type: 'varchar' }) message: string;
  @Column({ type: 'simple-json', nullable: true }) meta: any;
  @CreateDateColumn() createdAt: Date;
}

@Entity('share_links')
export class ShareLink {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Index({ unique: true }) @Column({ type: 'varchar' }) token: string;
  @Column({ type: 'varchar' }) label: string;
  @Column({ type: 'varchar' }) targetType: string; // document | package
  @Column({ type: 'varchar', nullable: true }) documentId: string | null;
  @Column({ type: 'simple-json', nullable: true }) settings: any;
  @Column({ type: 'simple-json', nullable: true }) recipe: any;
  @Column({ type: 'varchar', nullable: true }) passwordHash: string | null;
  @Column({ type: 'float', nullable: true }) expiresAt: number | null;
  @Column({ type: 'integer', nullable: true }) viewLimit: number | null;
  @Column({ type: 'integer', default: 0 }) views: number;
  @Column({ type: 'integer', default: 0 }) downloads: number;
  @Column({ type: 'boolean', default: false }) revoked: boolean;
  @CreateDateColumn() createdAt: Date;
}

@Entity('custom_presets')
export class CustomPreset {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Column({ type: 'varchar' }) name: string;
  @Column({ type: 'simple-json' }) slots: any;
  @CreateDateColumn() createdAt: Date;
}

@Entity('temp_files')
export class TempFile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Column({ type: 'varchar' }) storageKey: string;
  @Column({ type: 'varchar' }) filename: string;
  @Column({ type: 'varchar' }) mime: string;
  @Column({ type: 'float' }) size: number;
  @Column({ type: 'float' }) expiresAt: number;
  @CreateDateColumn() createdAt: Date;
}

export const ENTITIES = [User, Folder, Document, Activity, ShareLink, CustomPreset, TempFile];
