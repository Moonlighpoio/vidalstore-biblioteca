export interface FreeToGame {
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

export interface GameRecord {
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

export function mapGames(
  games: FreeToGame[],
): GameRecord[] {
  return games.map((game) => ({
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
  }));
}