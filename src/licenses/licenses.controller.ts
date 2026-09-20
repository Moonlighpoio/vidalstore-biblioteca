import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { AdministratorGuard } from '../common/guards/administrator.guard';
import { LicensesService } from './licenses.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    groups: string[];
  };
}

@Controller('licencias')
@UseGuards(
  TokenPresenceGuard,
  AdministratorGuard,
)
export class LicensesController {
  constructor(
    private readonly licensesService: LicensesService,
  ) {}

  @Get()
  findAll() {
    return this.licensesService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  revoke(
    @Param('id') licenseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.licensesService.revoke(
      licenseId,
      request.user.sub,
    );
  }
}