import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/auth';
import { User } from '../entities';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private svc: PackagesService) {}
  @Post('build') build(@CurrentUser() u: User, @Body() b: any) { return this.svc.build(u.id, b); }
}
