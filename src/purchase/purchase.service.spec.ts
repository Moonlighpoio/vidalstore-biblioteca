import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { LicenciasRepository } from '../licenses/licencias.repository';
import { RabbitMqPublisher } from '../mensajeria/rabbitmq.publisher';

describe('PurchaseService', () => {
  let service: PurchaseService;
  let repository: any;
  let publisher: any;

  beforeEach(async () => {
    repository = {
      findActiveByUsuarioSubAndJuego: jest.fn().mockResolvedValue(null),
      create: jest.fn((partial) => ({ ...partial })),
      save: jest.fn((license) =>
        Promise.resolve({
          id: 'license-001',
          ...license,
          adquiridaEn: license.adquiridaEn ?? new Date(),
        }),
      ),
    };

    publisher = {
      publishEvento: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        { provide: LicenciasRepository, useValue: repository },
        { provide: RabbitMqPublisher, useValue: publisher },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a license and publish compra.realizada', async () => {
    const result = await service.createPurchase({
      usuarioSub: 'user-player-001',
      juegoId: 'game-001',
    });

    expect(result.id).toBe('license-001');
    expect(result.userId).toBe('user-player-001');
    expect(result.gameId).toBe('game-001');
    expect(publisher.publishEvento).toHaveBeenCalledWith(
      expect.objectContaining({ routingKey: 'compra.realizada' }),
    );
  });

  it('should reject a duplicated active game purchase', async () => {
    repository.findActiveByUsuarioSubAndJuego.mockResolvedValue({
      id: 'existing-license',
    });

    await expect(
      service.createPurchase({
        usuarioSub: 'user-player-001',
        juegoId: 'game-001',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
