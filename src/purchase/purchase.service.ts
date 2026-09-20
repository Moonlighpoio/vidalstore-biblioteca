import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateLicenseDto } from '../library/dto/create-license.dto';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly repository: InMemoryLibraryRepository,
  ) {}

  createPurchase(
    userId: string,
    dto: CreateLicenseDto,
  ) {
    const existingLicenses =
      this.repository.findLicensesByUserId(
        userId,
      );

    const alreadyOwnsGame =
      existingLicenses.some(
        (license) =>
          license.gameId === dto.gameId,
      );

    if (alreadyOwnsGame) {
      throw new BadRequestException(
        'The user already owns this game',
      );
    }

    return this.repository.save({
      id: randomUUID(),
      userId,
      gameId: dto.gameId,
      purchasedAt: new Date().toISOString(),
      revoked: false,
    });
  }
}