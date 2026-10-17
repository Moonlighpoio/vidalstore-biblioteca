import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class GameNamesService {
  private readonly gameNames = new Map<string, string>();

  constructor() {
    this.load();
  }

  resolve(gameId: string): string {
    return this.gameNames.get(gameId) ?? gameId;
  }

  private load(): void {
    try {
      const filePath = join(process.cwd(), 'data', 'libraries.json');
      const content = readFileSync(filePath, 'utf-8');
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
      // El catálogo de nombres es opcional: si no está, se usa el id.
    }
  }
}
