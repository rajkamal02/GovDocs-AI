import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { config } from '../config';
import { Folder, User } from '../entities';

export const Public = () => SetMetadata('isPublic', true);
export const CurrentUser = createParamDecorator((_d, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user as User);

export const DEFAULT_FOLDERS = [
  { name: 'Photos', icon: '📸' }, { name: 'Signatures', icon: '✍️' }, { name: 'Identity', icon: '🪪' },
  { name: 'Certificates', icon: '🎓' }, { name: 'Resume', icon: '📄' },
];

@Injectable()
export class AuthGuard implements CanActivate {
  private cache = new Map<string, Promise<User>>();
  private clerk = config.clerkSecret ? createClerkClient({ secretKey: config.clerkSecret }) : null;

  constructor(
    private reflector: Reflector,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Folder) private folders: Repository<Folder>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>('isPublic', [ctx.getHandler(), ctx.getClass()])) return true;
    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    let clerkId: string;
    if (config.clerkSecret) {
      if (!token) throw new UnauthorizedException('Please sign in.');
      try {
        const payload: any = await verifyToken(token, { secretKey: config.clerkSecret });
        clerkId = payload.sub;
      } catch { throw new UnauthorizedException('Session expired. Please sign in again.'); }
    } else {
      clerkId = 'dev-user'; // dev mode only (blocked in production by assertConfig)
    }
    req.user = await this.getUser(clerkId);
    return true;
  }

  forget(clerkId: string) { this.cache.delete(clerkId); }

  private getUser(clerkId: string): Promise<User> {
    let p = this.cache.get(clerkId);
    if (!p) {
      p = this.loadOrCreate(clerkId).catch((e) => { this.cache.delete(clerkId); throw e; });
      this.cache.set(clerkId, p);
    }
    return p;
  }

  private async loadOrCreate(clerkId: string): Promise<User> {
    let u = await this.users.findOne({ where: { clerkId } });
    if (u) return u;
    let email: string | null = null, name: string | null = clerkId === 'dev-user' ? 'You (dev mode)' : null;
    if (this.clerk && clerkId !== 'dev-user') {
      try {
        const cu = await this.clerk.users.getUser(clerkId);
        email = cu.emailAddresses?.[0]?.emailAddress || null;
        name = [cu.firstName, cu.lastName].filter(Boolean).join(' ') || null;
      } catch { /* profile is optional */ }
    }
    u = await this.users.save(this.users.create({ clerkId, email, name }));
    await this.folders.save(DEFAULT_FOLDERS.map((f) => this.folders.create({ ...f, userId: u!.id })));
    return u;
  }
}
