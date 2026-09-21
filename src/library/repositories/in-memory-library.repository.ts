import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { License } from '../entities/license.entity';

@Injectable()
export class InMemoryLibraryRepository {
  private readonly licenses: License[] = [];
  private readonly gameNames = new Map<string, string>();

  constructor() {
    this.loadInitialLicenses();
    this.loadGameNames();
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

  resolveGameName(gameId: string): string {
    return this.gameNames.get(gameId) || gameId;
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
    } catch {
      console.warn(
        'No initial licenses were loaded',
      );
    }
  }

  private loadGameNames(): void {
    const filePath = join(
      process.cwd(),
      'data',
      'libraries.json',
    );

    try {
      const content = readFileSync(
        filePath,
        'utf-8',
      );

      const games = JSON.parse(content) as Array<{
        id: string;
        name?: string;
      }>;

      for (const game of games) {
        if (game.id && game.name) {
          this.gameNames.set(game.id, game.name);
        }
      }
    } catch {
      console.warn(
        'No game names were loaded',
      );
    }
  }
}