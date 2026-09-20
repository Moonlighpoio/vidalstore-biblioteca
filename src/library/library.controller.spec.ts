import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

describe('LibraryController', () => {
  let controller: LibraryController;

  const libraryService = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [LibraryController],
        providers: [
          {
            provide: LibraryService,
            useValue: libraryService,
          },
        ],
      }).compile();

    controller =
      module.get<LibraryController>(
        LibraryController,
      );

    jest.clearAllMocks();
  });

  it('should return the authenticated user library', () => {
    libraryService.findByUserId.mockReturnValue({
      userId: 'user-player-001',
      licenses: [],
      total: 0,
    });

    const request = {
      user: {
        sub: 'user-player-001',
        groups: ['jugadores'],
      },
    } as never;

    const result =
      controller.findOwnLibrary(request);

    expect(result).toEqual({
      userId: 'user-player-001',
      licenses: [],
      total: 0,
    });

    expect(
      libraryService.findByUserId,
    ).toHaveBeenCalledWith(
      'user-player-001',
    );
  });

  it('should reject a request without an authenticated user', () => {
    const request = {
      user: undefined,
    } as never;

    expect(() =>
      controller.findOwnLibrary(request),
    ).toThrow(UnauthorizedException);
  });
});