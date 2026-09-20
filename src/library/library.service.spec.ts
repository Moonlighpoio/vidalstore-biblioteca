import { LibraryService } from './library.service';
import { InMemoryLibraryRepository } from './repositories/in-memory-library.repository';

describe('LibraryService', () => {
  let service: LibraryService;

  const repository = {
    findLicensesByUserId: jest.fn(),
  } as unknown as InMemoryLibraryRepository;

  beforeEach(() => {
    service = new LibraryService(repository);
    jest.clearAllMocks();
  });

  it('should return the authenticated user library', () => {
    repository.findLicensesByUserId =
      jest.fn().mockReturnValue([
        {
          id: 'license-001',
          userId: 'user-player-001',
          gameId: 'game-001',
          purchasedAt:
            '2026-09-19T12:00:00.000Z',
          revoked: false,
        },
      ]);

    const result = service.findByUserId(
      'user-player-001',
    );

    expect(
      repository.findLicensesByUserId,
    ).toHaveBeenCalledWith(
      'user-player-001',
    );

    expect(result).toEqual({
      userId: 'user-player-001',
      licenses: [
        {
          id: 'license-001',
          userId: 'user-player-001',
          gameId: 'game-001',
          purchasedAt:
            '2026-09-19T12:00:00.000Z',
          revoked: false,
        },
      ],
      total: 1,
    });
  });

  it('should return an empty library for a user without licenses', () => {
    repository.findLicensesByUserId =
      jest.fn().mockReturnValue([]);

    const result = service.findByUserId(
      'user-without-games',
    );

    expect(result).toEqual({
      userId: 'user-without-games',
      licenses: [],
      total: 0,
    });
  });

  it('should query only the requested authenticated user', () => {
    repository.findLicensesByUserId =
      jest.fn().mockReturnValue([]);

    service.findByUserId('user-player-001');

    expect(
      repository.findLicensesByUserId,
    ).toHaveBeenCalledTimes(1);

    expect(
      repository.findLicensesByUserId,
    ).toHaveBeenCalledWith(
      'user-player-001',
    );

    expect(
      repository.findLicensesByUserId,
    ).not.toHaveBeenCalledWith(
      'other-user',
    );
  });
});