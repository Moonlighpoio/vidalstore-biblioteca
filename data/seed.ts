import { writeFile } from 'node:fs/promises';
import {
  type FreeToGame,
  mapGames,
} from './seed-utils';

const API_URL =
  'https://www.freetogame.com/api/games';

async function fetchGames(): Promise<FreeToGame[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      `FreeToGame API failed with status ${response.status}`,
    );
  }

  return (await response.json()) as FreeToGame[];
}

async function writeDatasets(
  games: ReturnType<typeof mapGames>,
): Promise<void> {
  await writeFile(
    'data/libraries.json',
    JSON.stringify(games, null, 2),
  );

  await writeFile(
    'data/licenses.json',
    JSON.stringify([], null, 2),
  );
}

async function main(): Promise<void> {
  console.log(
    'Fetching games from FreeToGame API...',
  );

  const externalGames = await fetchGames();

  if (externalGames.length === 0) {
    throw new Error(
      'The FreeToGame API returned no games',
    );
  }

  const games = mapGames(externalGames);

  await writeDatasets(games);

  console.log(`Generated ${games.length} games`);
  console.log(
    'Source: https://www.freetogame.com',
  );
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});