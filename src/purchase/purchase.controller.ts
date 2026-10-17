import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { resolveRequestSub } from '../common/auth/sub.extractor';
import type { RequestWithUser } from '../common/auth/sub.extractor';

@Controller('v1/compras')
@UseGuards(TokenPresenceGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  createPurchase(
    @Req() request: RequestWithUser,
    @Body() body: { gameId?: string },
  ) {
    const usuarioSub = resolveRequestSub(request);

    if (!usuarioSub) {
      throw new UnauthorizedException('Token subject is required');
    }

    if (!body.gameId) {
      throw new UnauthorizedException('gameId is required');
    }

    return this.purchaseService.createPurchase({
      usuarioSub,
      juegoId: body.gameId,
    });
  }
}
