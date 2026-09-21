import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';

describe('PurchaseService', () => {
  let service: PurchaseService;
  let repository: InMemoryLibraryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: InMemoryLibraryRepository,
          useValue: {
            findLicensesByUserId: jest.fn().mockReturnValue([]),
            findAllLicenses: jest.fn().mockReturnValue([]),
            save: jest.fn((license) => license),
          },
        },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
    repository = module.get<InMemoryLibraryRepository>(InMemoryLibraryRepository);

    jest.clearAllMocks();
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
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-player-001',
        gameId: 'game-001',
        revoked: false,
      }),
    );
  });

  it('should reject a duplicated game purchase', () => {
    const findLicensesByUserId = jest
      .spyOn(repository, 'findLicensesByUserId')
      .mockReturnValue([
        {
          id: 'existing-license',
          userId: 'user-player-001',
          gameId: 'game-001',
          purchasedAt: '2026-09-01T00:00:00.000Z',
          revoked: false,
        } as never,
      ]);

    expect(() =>
      service.createPurchase({
        userId: 'user-player-001',
        gameId: 'game-001',
      }),
    ).toThrow(BadRequestException);

    expect(findLicensesByUserId).toHaveBeenCalledWith(
      'user-player-001',
    );
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
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-player-002',
        gameId: 'game-001',
      }),
    );
  });
});