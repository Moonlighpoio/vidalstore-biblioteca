import { LibraryService } from './library.service';
import { LicenciasRepository } from '../licenses/licencias.repository';
import { GameNamesService } from './game-names.service';
import { Licencia } from '../licenses/entities/licencia.entity';

describe('LibraryService', () => {
  let service: LibraryService;

  const repository = {
    findActiveByUsuarioSub: jest.fn(),
  } as unknown as LicenciasRepository;

  const gameNames = {
    resolve: jest.fn((gameId: string) => gameId),
  } as unknown as GameNamesService;

  beforeEach(() => {
    service = new LibraryService(repository, gameNames);
    jest.clearAllMocks();
  });

  it('should return the authenticated user library', async () => {
    const license = {
      id: 'license-001',
      usuarioSub: 'user-player-001',
      juegoId: 'game-001',
      estado: 'activa',
      adquiridaEn: new Date('2026-09-19T12:00:00.000Z'),
      revocadaEn: null,
      revocadaPor: null,
    } as Licencia;

    (repository.findActiveByUsuarioSub as jest.Mock).mockResolvedValue([
      license,
    ]);
    (gameNames.resolve as jest.Mock).mockReturnValue('Overwatch');

    const result = await service.findByUserId('user-player-001');

    expect(repository.findActiveByUsuarioSub).toHaveBeenCalledWith(
      'user-player-001',
    );
    expect(gameNames.resolve).toHaveBeenCalledWith('game-001');

    expect(result).toEqual({
      userId: 'user-player-001',
      licenses: [
        {
          id: 'license-001',
          userId: 'user-player-001',
          gameId: 'game-001',
          gameTitle: 'Overwatch',
          purchasedAt: '2026-09-19T12:00:00.000Z',
          revoked: false,
          revokedAt: null,
          revokedBy: null,
          estado: 'activa',
        },
      ],
      total: 1,
    });
  });

  it('should return an empty library for a user without licenses', async () => {
    (repository.findActiveByUsuarioSub as jest.Mock).mockResolvedValue([]);

    const result = await service.findByUserId('user-without-games');

    expect(result).toEqual({
      userId: 'user-without-games',
      licenses: [],
      total: 0,
    });
  });
});
