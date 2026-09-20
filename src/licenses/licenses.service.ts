import { Injectable } from '@nestjs/common';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';

@Injectable()
export class LicensesService {
  constructor(
    private readonly repository: InMemoryLibraryRepository,
  ) {}

  findAll() {
    return this.repository.findAllLicenses();
  }
}