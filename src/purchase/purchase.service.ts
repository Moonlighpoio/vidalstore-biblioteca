import { Injectable, BadRequestException } from '@nestjs/common';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';
import { License } from '../library/entities/license.entity';

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
  constructor(
    private readonly libraryRepository: InMemoryLibraryRepository,
  ) {}

  createPurchase(dto: CreatePurchaseDto): Purchase {
    const alreadyOwned = this.libraryRepository
      .findLicensesByUserId(dto.userId)
      .some((license) => license.gameId === dto.gameId);

    if (alreadyOwned) {
      throw new BadRequestException('Game already purchased by this user');
    }

    const license: License = {
      id: crypto.randomUUID(),
      userId: dto.userId,
      gameId: dto.gameId,
      purchasedAt: new Date().toISOString(),
      revoked: false,
    };

    this.libraryRepository.save(license);

    const purchase: Purchase = {
      id: license.id,
      userId: license.userId,
      gameId: license.gameId,
      purchasedAt: license.purchasedAt,
    };

    return purchase;
  }

  findAll(): Purchase[] {
    return this.libraryRepository.findAllLicenses().map((license) => ({
      id: license.id,
      userId: license.userId,
      gameId: license.gameId,
      purchasedAt: license.purchasedAt,
    }));
  }
}