import { Injectable } from '@angular/core';
import { Game, PlayedGame, Player, StorageData } from './types';

enum DataKeys {
  Players = 'players',
  Games = 'games',
  PlayedGames = 'played-games',
}

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private readonly storageKey: string = 'board-game-data';
  private customGameName: string = 'default'

  constructor() { }

  public setGameName(name: string): void {
    this.customGameName = name;
  }

  public load(): StorageData {
    return {
      players: this.getPlayers(),
      games: this.getGames(),
      playedGames: this.getPlayedGames(),
    }
  }

  public getPlayers(): Array<Player> {
    return this.getLocalStorageData<Array<Player>>(DataKeys.Players)
      .sort((playerA: Player, playerB: Player) => {
        return playerA.name.localeCompare(playerB.name);
      });
  }

  public getGames(): Array<Game> {
    return this.getLocalStorageData<Array<Game>>(DataKeys.Games)
      .sort((playerA: Game, playerB: Game) => {
        return playerA.name.localeCompare(playerB.name);
      });;
  }

  public getPlayedGames(): Array<PlayedGame> {
    return this.getLocalStorageData<Array<PlayedGame>>(DataKeys.PlayedGames);
  }

  public addPlayedGame(playedGame: PlayedGame): void {
    const playedGames: Array<PlayedGame> = this.getPlayedGames();

    // Trim empty placement arrays at the end
    for (let i: number = playedGame.placements.length - 1; i >= 0; i--) {
      if (playedGame.placements[i].length === 0) {
        playedGame.placements[i].splice(i, 1);
      } else {
        break;
      }
    }
    playedGames.push(playedGame);
    this.setLocalStorageData(DataKeys.PlayedGames, playedGames);
  }

  public addPlayer(player: Player): void {
    const players: Array<Player> = this.getPlayers();
    players.push(player);
    this.setLocalStorageData(DataKeys.Players, players);
  }

  public addGame(game: Game): void {
    const games: Array<Game> = this.getGames();
    games.push(game);
    this.setLocalStorageData(DataKeys.Games, games);
  }

  private getLocalStorageData<T>(key: DataKeys): T {
    return JSON.parse(localStorage.getItem(this.getLocalStorageKey(key)) || '[]');
  }

  private setLocalStorageData(key: DataKeys, data: unknown): void {
    return localStorage.setItem(this.getLocalStorageKey(key), JSON.stringify(data));
  }

  private getLocalStorageKey(key: DataKeys): string {
    return `${this.storageKey}-${this.customGameName}-${key}`;
  }
}
