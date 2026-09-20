import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';

@Injectable()
export class LicensesService {
  constructor(
    private readonly repository: InMemoryLibraryRepository,
  ) {}

  findAll() {
    return this.repository.findAllLicenses();
  }

  revoke(
    licenseId: string,
    revokedBy: string,
  ) {
    const license =
      this.repository.findById(licenseId);

    if (!license) {
      throw new NotFoundException(
        'License not found',
      );
    }

    if (license.revoked) {
      throw new NotFoundException(
        'License is already revoked',
      );
    }

    const revokedLicense = {
      ...license,
      revoked: true,
      revokedAt: new Date().toISOString(),
      revokedBy,
    };

    return this.repository.update(
      revokedLicense,
    );
  }
}