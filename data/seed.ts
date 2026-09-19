import { writeFile } from 'node:fs/promises';

const API_URL =
  'https://www.freetogame.com/api/games';

interface FreeToGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
}

interface GameRecord {
  id: string;
  externalId: number;
  name: string;
  image: string;
  description: string;
  url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  releaseDate: string;
  source: string;
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

function mapGame(game: FreeToGame): GameRecord {
  return {
    id: `game-${game.id}`,
    externalId: game.id,
    name: game.title,
    image: game.thumbnail,
    description: game.short_description,
    url: game.game_url,
    genre: game.genre,
    platform: game.platform,
    publisher: game.publisher,
    developer: game.developer,
    releaseDate: game.release_date,
    source: 'FreeToGame',
  };
}

async function writeDatasets(games: GameRecord[]) {
  await writeFile(
    'data/libraries.json',
    JSON.stringify(games, null, 2),
  );

  await writeFile(
    'data/licenses.json',
    JSON.stringify([], null, 2),
  );
}

async function main() {
  console.log('Fetching games from FreeToGame API...');

  const externalGames = await fetchGames();

  if (externalGames.length === 0) {
    throw new Error(
      'The FreeToGame API returned no games',
    );
  }

  const games = externalGames.map(mapGame);

  await writeDatasets(games);

  console.log(
    `Generated ${games.length} games`,
  );
  console.log(
    'Source: https://www.freetogame.com',
  );
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});