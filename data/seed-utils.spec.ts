import {
  type FreeToGame,
  mapGames,
} from './seed-utils';

describe('mapGames', () => {
  it('should map FreeToGame data to VidalStore data', () => {
    const externalGames: FreeToGame[] = [
      {
        id: 10,
        title: 'Test Game',
        thumbnail:
          'https://example.com/game.jpg',
        short_description: 'Test description',
        game_url:
          'https://www.freetogame.com/open/test-game',
        genre: 'Shooter',
        platform: 'PC (Windows)',
        publisher: 'Test Publisher',
        developer: 'Test Developer',
        release_date: '2020-01-01',
      },
    ];

    const result = mapGames(externalGames);

    expect(result).toEqual([
      {
        id: 'game-10',
        externalId: 10,
        name: 'Test Game',
        image:
          'https://example.com/game.jpg',
        description: 'Test description',
        url:
          'https://www.freetogame.com/open/test-game',
        genre: 'Shooter',
        platform: 'PC (Windows)',
        publisher: 'Test Publisher',
        developer: 'Test Developer',
        releaseDate: '2020-01-01',
        source: 'FreeToGame',
      },
    ]);
  });

  it('should return an empty array for empty input', () => {
    const result = mapGames([]);

    expect(result).toEqual([]);
  });

  it('should preserve the external game id', () => {
    const externalGames: FreeToGame[] = [
      {
        id: 452,
        title: 'Game With Id',
        thumbnail: '',
        short_description: '',
        game_url: '',
        genre: '',
        platform: '',
        publisher: '',
        developer: '',
        release_date: '',
      },
    ];

    const result = mapGames(externalGames);

    expect(result[0].externalId).toBe(452);
    expect(result[0].id).toBe('game-452');
  });

  it('should map multiple games', () => {
    const externalGames: FreeToGame[] = [
      {
        id: 1,
        title: 'First Game',
        thumbnail: 'first.jpg',
        short_description: 'First description',
        game_url: 'first-url',
        genre: 'MMORPG',
        platform: 'PC',
        publisher: 'Publisher 1',
        developer: 'Developer 1',
        release_date: '2021-01-01',
      },
      {
        id: 2,
        title: 'Second Game',
        thumbnail: 'second.jpg',
        short_description: 'Second description',
        game_url: 'second-url',
        genre: 'Shooter',
        platform: 'Browser',
        publisher: 'Publisher 2',
        developer: 'Developer 2',
        release_date: '2022-02-02',
      },
    ];

    const result = mapGames(externalGames);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('First Game');
    expect(result[1].name).toBe('Second Game');
  });

  it('should add FreeToGame as the data source', () => {
    const externalGames: FreeToGame[] = [
      {
        id: 99,
        title: 'Source Test',
        thumbnail: '',
        short_description: '',
        game_url: '',
        genre: '',
        platform: '',
        publisher: '',
        developer: '',
        release_date: '',
      },
    ];

    const result = mapGames(externalGames);

    expect(result[0].source).toBe('FreeToGame');
  });
});