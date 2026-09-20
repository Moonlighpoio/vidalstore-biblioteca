import { BadRequestException } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';

describe('PurchaseService', () => {
  let service: PurchaseService;

  const repository = {
    findLicensesByUserId: jest.fn(),
    save: jest.fn(),
  } as unknown as InMemoryLibraryRepository;

  beforeEach(() => {
    service = new PurchaseService(repository);
    jest.clearAllMocks();
  });

  it('should create a license for the authenticated user', () => {
    repository.findLicensesByUserId =
      jest.fn().mockReturnValue([]);

    repository.save = jest
      .fn()
      .mockImplementation((license) => license);

    const result = service.createPurchase(
      'user-player-001',
      {
        gameId: 'game-001',
      },
    );

    expect(result.userId).toBe(
      'user-player-001',
    );

    expect(result.gameId).toBe('game-001');
    expect(result.revoked).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.purchasedAt).toBeDefined();

    expect(repository.save).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should reject a duplicated game purchase', () => {
    repository.findLicensesByUserId =
      jest.fn().mockReturnValue([
        {
          id: 'license-001',
          userId: 'user-player-001',
          gameId: 'game-001',
          purchasedAt:
            '2026-09-20T00:00:00.000Z',
          revoked: false,
        },
      ]);

    expect(() =>
      service.createPurchase(
        'user-player-001',
        {
          gameId: 'game-001',
        },
      ),
    ).toThrow(BadRequestException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should allow another user to purchase the same game', () => {
    repository.findLicensesByUserId =
      jest.fn().mockReturnValue([]);

    repository.save = jest
      .fn()
      .mockImplementation((license) => license);

    const result = service.createPurchase(
      'user-player-002',
      {
        gameId: 'game-001',
      },
    );

    expect(result.userId).toBe(
      'user-player-002',
    );

    expect(result.gameId).toBe('game-001');
    expect(repository.save).toHaveBeenCalled();
  });
});