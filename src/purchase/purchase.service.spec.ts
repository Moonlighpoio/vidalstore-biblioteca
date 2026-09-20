import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  let service: PurchaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseService],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a license for the authenticated user', () => {
    const result = service.createPurchase({
      userId: 'user-player-001',
      gameId: 'game-001',
    });

    expect(result).toBeDefined();
    expect(result.userId).toBe(
      'user-player-001',
    );
    expect(result.gameId).toBe('game-001');
    expect(result.id).toBeDefined();
    expect(result.purchasedAt).toBeDefined();
  });

  it('should reject a duplicated game purchase', () => {
    service.createPurchase({
      userId: 'user-player-001',
      gameId: 'game-001',
    });

    expect(() =>
      service.createPurchase({
        userId: 'user-player-001',
        gameId: 'game-001',
      }),
    ).toThrow(BadRequestException);
  });

  it('should allow another user to purchase the same game', () => {
    service.createPurchase({
      userId: 'user-player-001',
      gameId: 'game-001',
    });

    const result = service.createPurchase({
      userId: 'user-player-002',
      gameId: 'game-001',
    });

    expect(result).toBeDefined();
    expect(result.userId).toBe(
      'user-player-002',
    );
    expect(result.gameId).toBe('game-001');
  });
});