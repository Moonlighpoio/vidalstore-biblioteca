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

  it('should use the authenticated user sub from the token', async () => {
    const tokenPayload = Buffer.from(
      JSON.stringify({ sub: 'user-player-001' }),
    ).toString('base64url');
    const request = {
      headers: { authorization: `Bearer a.${tokenPayload}.c` },
      user: { sub: 'header-user', groups: [] },
    } as never;

    const mockResult = {
      id: 'purchase-001',
      userId: 'user-player-001',
      gameId: 'game-001',
      purchasedAt: new Date().toISOString(),
    };

    jest.spyOn(service, 'createPurchase').mockResolvedValue(mockResult as never);

    const result = controller.createPurchase(request, {
      gameId: 'game-001',
    });

    await expect(result).resolves.toEqual(mockResult);
    expect(service.createPurchase).toHaveBeenCalledWith({
      usuarioSub: 'user-player-001',
      juegoId: 'game-001',
    });
  });

  it('should throw if user is not authenticated', () => {
    const request = {
      headers: {},
      user: undefined,
    } as never;

    expect(() => {
      void controller.createPurchase(request, { gameId: 'game-001' });
    }).toThrow(UnauthorizedException);
  });
});
