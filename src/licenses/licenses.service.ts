import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { InMemoryLibraryRepository } from '../library/repositories/in-memory-library.repository';
import { License } from '../library/entities/license.entity';

@Injectable()
export class LicensesService {
  constructor(
    private readonly repository: InMemoryLibraryRepository,
    private readonly auditService: AuditService,
  ) {}

  findAll(): License[] {
    return this.repository.findAllLicenses();
  }

  revokeLicense(licenseId: string, revokedBy: string): License {
    const license = this.repository.findById(licenseId);

    if (!license) {
      throw new NotFoundException('License not found');
    }

    license.revoked = true;
    license.revokedAt = new Date().toISOString();
    license.revokedBy = revokedBy;

    this.repository.update(license);

    this.auditService.recordRevocation({
      licenseId: license.id,
      gameId: license.gameId,
      userId: license.userId,
      revokedBy,
    });

    return license;
  }
}