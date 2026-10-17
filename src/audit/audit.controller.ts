import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { AdministratorGuard } from '../common/guards/administrator.guard';
import { resolveRequestSub } from '../common/auth/sub.extractor';
import type { RequestWithUser } from '../common/auth/sub.extractor';

@Controller('v1/auditoria')
@UseGuards(TokenPresenceGuard, AdministratorGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Req() request: RequestWithUser) {
    if (!resolveRequestSub(request)) {
      throw new UnauthorizedException();
    }

    return this.auditService.findAll();
  }
}
