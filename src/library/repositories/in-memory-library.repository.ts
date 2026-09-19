import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { License } from '../entities/license.entity';

@Injectable()
export class InMemoryLibraryRepository {
  private readonly licenses: License[] = [];

  constructor() {
    this.loadInitialLicenses();
  }

  findLicensesByUserId(userId: string): License[] {
    return this.licenses.filter(
      (license) =>
        license.userId === userId &&
        !license.revoked,
    );
  }

  findAllLicenses(): License[] {
    return [...this.licenses];
  }

  findById(id: string): License | undefined {
    return this.licenses.find(
      (license) => license.id === id,
    );
  }

  save(license: License): License {
    this.licenses.push(license);
    return license;
  }

  update(license: License): License {
    const index = this.licenses.findIndex(
      (current) => current.id === license.id,
    );

    if (index === -1) {
      throw new Error('License not found');
    }

    this.licenses[index] = license;
    return license;
  }

  private loadInitialLicenses(): void {
    const filePath = join(
      process.cwd(),
      'data',
      'licenses.json',
    );

    try {
      const content = readFileSync(
        filePath,
        'utf-8',
      );

      const licenses = JSON.parse(content) as License[];

      this.licenses.push(...licenses);
    } catch (error) {
      console.warn(
        'No initial licenses were loaded',
        error,
      );
    }
  }
}