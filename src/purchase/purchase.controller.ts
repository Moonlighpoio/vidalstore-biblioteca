import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { CreateLicenseDto } from '../library/dto/create-license.dto';
import { PurchaseService } from './purchase.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    groups: string[];
  };
}

@Controller('compras')
@UseGuards(TokenPresenceGuard)
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
  ) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateLicenseDto,
  ) {
    return this.purchaseService.createPurchase(
      request.user.sub,
      dto,
    );
  }
}