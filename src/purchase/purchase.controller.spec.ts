import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

describe('PurchaseController', () => {
  let controller: PurchaseController;

  const purchaseService = {
    createPurchase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          PurchaseController,
        ],
        providers: [
          {
            provide: PurchaseService,
            useValue: purchaseService,
          },
        ],
      }).compile();

    controller =
      module.get<PurchaseController>(
        PurchaseController,
      );

    jest.clearAllMocks();
  });

  it('should use the authenticated user sub', () => {
    purchaseService.createPurchase.mockReturnValue({
      id: 'license-001',
      userId: 'user-player-001',
      gameId: 'game-001',
      purchasedAt:
        '2026-09-20T00:00:00.000Z',
      revoked: false,
    });

    const request = {
      user: {
        sub: 'user-player-001',
        groups: ['jugadores'],
      },
    } as never;

    const result = controller.create(
      request,
      {
        gameId: 'game-001',
      },
    );

    expect(
      purchaseService.createPurchase,
    ).toHaveBeenCalledWith(
      'user-player-001',
      {
        gameId: 'game-001',
      },
    );

    expect(result.userId).toBe(
      'user-player-001',
    );
  });
});