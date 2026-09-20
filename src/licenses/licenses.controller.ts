import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LicensesService, type License } from './licenses.service';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { AdministratorGuard } from '../common/guards/administrator.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    'cognito:groups'?: string[];
  };
}

@Controller('v1/licencias')
@UseGuards(TokenPresenceGuard)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get()
  @UseGuards(AdministratorGuard)
  findAll(@Req() request: AuthenticatedRequest): License[] {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }

    return this.licensesService.findAll();
  }

  @Delete(':id')
  @UseGuards(AdministratorGuard)
  revokeLicense(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): License {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }

    const revokedBy = request.user.sub;
    return this.licensesService.revokeLicense(id, revokedBy);
  }
}