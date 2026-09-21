import { Injectable } from '@nestjs/common';
import { InMemoryLibraryRepository } from './repositories/in-memory-library.repository';
import { LibraryResponseDto } from './dto/library-response.dto';

@Injectable()
export class LibraryService {
  constructor(
    private readonly repository: InMemoryLibraryRepository,
  ) {}

  findByUserId(
    userId: string,
  ): LibraryResponseDto {
    const licenses =
      this.repository.findLicensesByUserId(
        userId,
      ).map((license) => ({
        ...license,
        gameTitle: this.repository.resolveGameName(
          license.gameId,
        ),
      }));

    return {
      userId,
      licenses,
      total: licenses.length,
    };
  }
}