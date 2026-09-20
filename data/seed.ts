import { writeFile } from 'node:fs/promises';
import {
  type FreeToGame,
  mapGames,
} from './seed-utils';


const API_URL =
  'https://www.freetogame.com/api/games';


interface License {
  id: string;
  userId: string;
  gameId: string;
  purchasedAt: string;
  revoked: boolean;
}


async function fetchGames(): Promise<FreeToGame[]> {
  const response = await fetch(API_URL);


  if (!response.ok) {
    throw new Error(
      `FreeToGame API failed with status ${response.status}`,
    );
  }


  return (await response.json()) as FreeToGame[];
}


function generateLicenses(games: ReturnType<typeof mapGames>): License[] {
  const licenses: License[] = [];
  const userIds = ['user-1', 'user-2', 'user-3'];

  games.forEach((game, index) => {
    const userId = userIds[index % userIds.length];
    licenses.push({
      id: `lib-${game.id}`,
      userId,
      gameId: game.id,
      purchasedAt: new Date().toISOString(),
      revoked: false,
    });
  });

  return licenses;
}


async function writeDatasets(
  games: ReturnType<typeof mapGames>,
): Promise<void> {
  const licenses = generateLicenses(games);

  await writeFile(
    'data/libraries.json',
    JSON.stringify(games, null, 2),
  );


  await writeFile(
    'data/licenses.json',
    JSON.stringify(licenses, null, 2),
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