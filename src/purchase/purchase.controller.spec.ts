import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

describe('PurchaseController', () => {
  let controller: PurchaseController;
  let service: PurchaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseController],
      providers: [
        {
          provide: PurchaseService,
          useValue: {
            createPurchase: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PurchaseController>(PurchaseController);
    service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should use the authenticated user sub', () => {
    const request = {
      user: {
        sub: 'user-player-001',
      },
    } as any;

    const mockResult = {
      id: 'purchase-001',
      userId: 'user-player-001',
      gameId: 'game-001',
      purchasedAt: new Date().toISOString(),
    };

    jest.spyOn(service, 'createPurchase').mockReturnValue(mockResult);

    const result = controller.createPurchase(
      request,
      {
        gameId: 'game-001',
      },
    );

    expect(result).toEqual(mockResult);
    expect(service.createPurchase).toHaveBeenCalledWith({
      userId: 'user-player-001',
      gameId: 'game-001',
    });
  });

  it('should throw if user is not authenticated', () => {
    const request = {
      user: undefined,
    } as any;

    expect(() => {
      controller.createPurchase(
        request,
        {
          gameId: 'game-001',
        },
      );
    }).toThrow(UnauthorizedException);
  });
});