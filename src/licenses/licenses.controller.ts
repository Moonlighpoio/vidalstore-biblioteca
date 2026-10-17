import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LicensesService } from './licenses.service';
import type { Licencia } from './entities/licencia.entity';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { AdministratorGuard } from '../common/guards/administrator.guard';
import { resolveRequestSub } from '../common/auth/sub.extractor';
import type { RequestWithUser } from '../common/auth/sub.extractor';

@Controller('v1/licencias')
@UseGuards(TokenPresenceGuard)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get()
  @UseGuards(AdministratorGuard)
  findAll(@Req() request: RequestWithUser): Promise<Licencia[]> {
    if (!resolveRequestSub(request)) {
      throw new UnauthorizedException();
    }

    return this.licensesService.findAll();
  }

  @Delete(':id')
  @UseGuards(AdministratorGuard)
  revokeLicense(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { motivo?: string },
  ): Promise<Licencia> {
    const revokedBy = resolveRequestSub(request);

    if (!revokedBy) {
      throw new UnauthorizedException();
    }

    return this.licensesService.revokeLicense(id, revokedBy, body?.motivo);
  }
}
