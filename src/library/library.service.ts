import { Injectable } from '@nestjs/common';
import { InMemoryLibraryRepository } from './repositories/in-memory-library.repository';

@Injectable()
export class LibraryService {
  constructor(
    private readonly repository: InMemoryLibraryRepository,
  ) {}

  findByUserId(userId: string) {
    return this.repository.findLicensesByUserId(
      userId,
    );
  }
}