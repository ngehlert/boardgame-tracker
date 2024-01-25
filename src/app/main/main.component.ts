import { Component, OnInit } from '@angular/core';
import { Game, PlayedGame, Player } from '../types';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DataStorageService } from '../data-storage.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  private players: Array<Player> = [];
  public availablePlayers: Array<Player> = []
  public games: Array<Game> = [];
  public playedGames: Array<PlayedGame> = [];
  public lastPlayedGames: Array<PlayedGame> = [];

  public placements: Array<Array<Player>> = this.getEmptyPlacementsList();
  public playedGame: Game | null = null;

  public isAddingGameOpen: boolean = false;
  public newGameName: string = '';
  public newGameDuration: string = '30';
  public newGameIsCoopGame: boolean = false;
  public newGameIsSpecialGame: boolean = false;

  public isAddingPlayerOpen: boolean = false;
  public newPlayerName: string = '';

  public isAdmin: boolean = false;

  constructor(
    private store: DataStorageService,
    private datePipe: DatePipe,
  ) {
    ({games: this.games, players: this.players, playedGames: this.playedGames} = this.store.load());
    this.availablePlayers = [...this.players];
    this.lastPlayedGames = this.getLastPlayedGames();
  }

  public ngOnInit(): void {
    this.isAdmin = new URLSearchParams(window.location.search).get('admin') === 'start01';
  }

  public handleDropOutOfBound(
    event: CdkDragDrop<Array<Array<Player>>, Array<Player>>,
  ): void {
    if (!event.isPointerOverContainer) {
      this.placements[event.item.data].splice(event.previousIndex, 1);
    }
  }

  public dropPlayer(
    event: CdkDragDrop<Array<Array<Player>>, Array<Player>>,
  ) {
    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(
        this.placements[event.currentIndex],
        event.previousIndex,
        event.currentIndex,
      );
    } else if (event.previousContainer.orientation === 'horizontal') {
      if (!this.placements[event.currentIndex]) {
        this.placements[event.currentIndex] = [];
      }
      transferArrayItem(
        this.placements[event.item.data],
        this.placements[event.currentIndex],
        event.previousIndex,
        this.placements[event.currentIndex].length,
      );
    } else {
      if (!this.placements[event.currentIndex]) {
        this.placements[event.currentIndex] = [];
      }
      transferArrayItem(
        event.previousContainer.data,
        this.placements[event.currentIndex],
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.addEmptyLastEntry();
    this.validatePlacements();
  }

  public selectPlayer(player: Player): void {
    const placementIndex: number = this.placements.findIndex((current => current.length === 0));
    if (placementIndex > -1) {
      this.placements[placementIndex] = [player];
    }
    const playerIndex: number = this.availablePlayers.findIndex((current => current === player));
    if (playerIndex > -1 ) {
      this.availablePlayers.splice(playerIndex, 1);
    }

    this.addEmptyLastEntry();
    this.validatePlacements();
  }

  public dropGame(event: CdkDragDrop<Array<Game>>) {
    this.playedGame = event.previousContainer.data[event.previousIndex];
  }

  public selectGame(game: Game): void {
    this.playedGame = game;
  }

  public savePlayedGame(): void {
    const placementsContainNoPlayer: boolean = this.placements.every((players: Array<Player>) => {
      return players.length === 0;
    });
    if (placementsContainNoPlayer || !this.playedGame) {
      return;
    }
    this.store.addPlayedGame({
      placements: this.placements,
      game: this.playedGame,
      timestamp: new Date().getTime(),
    });
    this.playedGames = this.store.getPlayedGames();
    this.lastPlayedGames = this.getLastPlayedGames();
    this.clearPlayedGame();
  }

  public clearPlayedGame(): void {
    this.playedGame = null;
    this.placements = this.getEmptyPlacementsList();
    this.availablePlayers = [...this.players];

  }

  public toggleAddGameForm(): void {
    this.isAddingGameOpen = !this.isAddingGameOpen;
  }

  public toggleAddPlayerForm(): void {
    this.isAddingPlayerOpen = !this.isAddingPlayerOpen;
  }

  public saveNewGame(): void {
    if (!this.newGameName.length || !this.newGameDuration.length) {
      return;
    }
    this.store.addGame({
      name: this.newGameName,
      duration: parseInt(String(this.newGameDuration), 10),
      isCoopGame: this.newGameIsCoopGame,
      isSpecialGame: this.newGameIsSpecialGame,
    });
    this.newGameName = '';
    this.newGameDuration = '30';

    this.games = this.store.getGames();
  }

  public saveNewPlayer(): void {
    if (!this.newPlayerName.length) {
      return;
    }

    this.store.addPlayer({
      name: this.newPlayerName,
    });
    this.newPlayerName = '';

    this.players = this.store.getPlayers();
    // needed to properly set the available players list
    this.clearPlayedGame();
  }

  public getLastPlayedGames(): Array<PlayedGame> {
    return this.playedGames
      .sort((gameA: PlayedGame, gameB: PlayedGame) => {
        return gameB.timestamp - gameA.timestamp;
      })
      .slice(0, 10);
  }

  public getTimeFromTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    return this.datePipe.transform(date, 'short') || '';
  }

  public getPlayersFromPlacements(placements: Array<Array<Player>>): string {
    return placements.reduce((result: Array<Player>, current: Array<Player>) => {
      result.push(...current);

      return result;
    }, [])
      .map((player: Player) => player.name)
      .join(', ');
  }

  public deletePlayedGame(playedGame: PlayedGame): void {
    this.store.removePlayedGame(playedGame);

    this.playedGames = this.store.getPlayedGames();
    this.lastPlayedGames = this.getLastPlayedGames();
  }

  private validatePlacements(): void {
    this.placements.forEach((players: Array<Player>, index: number) => {
      if (players.length <= 1) {
        return;
      }
      for (let i: number = 1; i < players.length; i++) {
        if ((this.placements[index + i] || []).length) {
          if (!this.playedGame?.isCoopGame) {
            this.placements.splice(index + 1, 0, []);
          }
        }
      }
    });
  }

  private addEmptyLastEntry(): void {
    if (this.placements[this.placements.length - 1].length > 0) {
      this.placements.push([]);
    }
  }

  private getEmptyPlacementsList(): Array<Array<Player>> {
    return [[], [], [], []]
  }
}
