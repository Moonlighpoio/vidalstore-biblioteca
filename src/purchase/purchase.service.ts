import { Injectable, BadRequestException } from '@nestjs/common';

export interface Purchase {
  id: string;
  userId: string;
  gameId: string;
  purchasedAt: string;
}

export interface CreatePurchaseDto {
  userId: string;
  gameId: string;
}

@Injectable()
export class PurchaseService {
  private readonly purchases: Purchase[] = [];

  createPurchase(dto: CreatePurchaseDto): Purchase {
    const existing = this.purchases.find(
      (p) => p.userId === dto.userId && p.gameId === dto.gameId,
    );

    if (existing) {
      throw new BadRequestException('Game already purchased by this user');
    }

    const purchase: Purchase = {
      id: crypto.randomUUID(),
      purchasedAt: new Date().toISOString(),
      ...dto,
    };

    this.purchases.push(purchase);
    return purchase;
  }

  findAll(): Purchase[] {
    return this.purchases;
  }
}