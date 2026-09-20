import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { AdministratorGuard } from '../common/guards/administrator.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    'cognito:groups'?: string[];
  };
}

@Controller('v1/auditoria')
@UseGuards(TokenPresenceGuard, AdministratorGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }

    return this.auditService.findAll();
  }
}