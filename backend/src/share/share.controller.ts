import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, Public } from '../common/auth';
import { User } from '../entities';
import { ShareService } from './share.service';

@Controller('share')
export class ShareController {
  constructor(private svc: ShareService) {}
  @Get() list(@CurrentUser() u: User) { return this.svc.list(u.id); }
  @Post() create(@CurrentUser() u: User, @Body() b: any) { return this.svc.create(u.id, b); }
  @Post(':id/revoke') revoke(@CurrentUser() u: User, @Param('id') id: string) { return this.svc.revoke(u.id, id); }
  @Delete(':id') remove(@CurrentUser() u: User, @Param('id') id: string) { return this.svc.remove(u.id, id); }

  @Public() @Throttle({ default: { limit: 30, ttl: 60000 } }) @Get('public/:token')
  info(@Param('token') t: string) { return this.svc.publicInfo(t); }

  @Public() @Throttle({ default: { limit: 8, ttl: 60000 } }) @Post('public/:token/access')
  access(@Param('token') t: string, @Body('password') pw?: string) { return this.svc.access(t, pw); }
}
