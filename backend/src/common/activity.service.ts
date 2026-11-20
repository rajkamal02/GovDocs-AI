import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entities';

@Injectable()
export class ActivityService {
  constructor(@InjectRepository(Activity) private repo: Repository<Activity>) {}
  async log(userId: string, kind: string, message: string, meta?: any) {
    try { await this.repo.save(this.repo.create({ userId, kind, message: message.slice(0, 250), meta: meta ?? null })); } catch { /* never block the main flow */ }
  }
}
