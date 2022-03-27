interface Player {
  name: string;
  extraPoints: number;
}

interface Game {
  name: string;
  duration: number;
}

interface StorageData {
  players: Array<Player>;
  games: Array<Game>;
  playedGames: Array<PlayedGame>;
}

interface PlayedGame {
  placements: Array<Array<Player>>;
  game: Game;
  timestamp: number;
}

export {
  Player,
  Game,
  PlayedGame,
  StorageData
}
