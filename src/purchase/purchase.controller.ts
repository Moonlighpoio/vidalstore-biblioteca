import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PurchaseService, CreatePurchaseDto, type Purchase } from './purchase.service';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
  };
}

@Controller('v1/compras')
@UseGuards(TokenPresenceGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  createPurchase(
    @Req() request: AuthenticatedRequest,
    @Body() body: { gameId: string },
  ): Purchase {
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Token subject is required');
    }

    if (!body.gameId) {
      throw new UnauthorizedException('gameId is required');
    }

    const dto: CreatePurchaseDto = {
      userId,
      gameId: body.gameId,
    };

    return this.purchaseService.createPurchase(dto);
  }
}