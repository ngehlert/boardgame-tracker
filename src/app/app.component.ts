import { Component } from '@angular/core';
import { Game, PlayedGame, Player } from './types';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DataStorageService } from './data-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

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

  public isAddingPlayerOpen: boolean = false;
  public newPlayerName: string = '';

  constructor(
    private store: DataStorageService,
  ) {
    ({games: this.games, players: this.players, playedGames: this.playedGames} = this.store.load());
    this.availablePlayers = [...this.players];
    this.lastPlayedGames = this.getLastPlayedGames();
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

    if (this.placements[this.placements.length - 1].length > 0) {
      this.placements.push([]);
    }

    this.validatePlacements();
  }

  public dropGame(event: CdkDragDrop<Array<Game>>) {
    this.playedGame = event.previousContainer.data[event.previousIndex];
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
      extraPoints: 0,
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
      .slice(0, 3);
  }

  public getTimeFromTimestampe(timestamp: number): string {
    const date = new Date(timestamp);

    return `${date.getHours()}:${date.getMinutes()}`;
  }

  private validatePlacements(): void {
    this.placements.forEach((players: Array<Player>, index: number) => {
      if (players.length <= 1) {
        return;
      }
      for (let i: number = 1; i < players.length; i++) {
        if ((this.placements[index + i] || []).length) {
          this.placements.splice(index + 1, 0, []);
        }
      }
    });
  }

  private getEmptyPlacementsList(): Array<Array<Player>> {
    return [[], [], [], []]
  }
}
