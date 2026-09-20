import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';

export interface License {
  id: string;
  userId: string;
  gameId: string;
  purchasedAt: string;
  revoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
}

@Injectable()
export class LicensesService {
  constructor(private readonly auditService: AuditService) {}

  private readonly licenses: License[] = [];

  findAll(): License[] {
    return this.licenses;
  }

  findById(id: string): License | undefined {
    return this.licenses.find((l) => l.id === id);
  }

  createLicense(input: Omit<License, 'id' | 'purchasedAt'>): License {
    const license: License = {
      id: crypto.randomUUID(),
      purchasedAt: new Date().toISOString(),
      ...input,
      revoked: false,
    };

    this.licenses.push(license);
    return license;
  }

  revokeLicense(licenseId: string, revokedBy: string): License {
    const license = this.licenses.find((l) => l.id === licenseId);

    if (!license) {
      throw new NotFoundException('License not found');
    }

    license.revoked = true;
    license.revokedAt = new Date().toISOString();
    license.revokedBy = revokedBy;

    this.auditService.recordRevocation({
      licenseId: license.id,
      gameId: license.gameId,
      userId: license.userId,
      revokedBy,
    });

    return license;
  }
}