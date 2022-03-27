import { Component } from '@angular/core';
import { Game, Player } from './types';
import { CdkDragDrop, moveItemInArray, copyArrayItem, transferArrayItem, CdkDragRelease } from '@angular/cdk/drag-drop';
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
    ({games: this.games, players: this.players} = this.store.load());
    this.availablePlayers = [...this.players];
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
    const placementsContainPlayer: boolean = !!(this.placements.find((players: Array<Player>) => {
      return players.length > 0;
    }))
    if (placementsContainPlayer || !this.playedGame) {
      return;
    }
    this.store.addPlayedGame({
      placements: this.placements,
      game: this.playedGame,
    });
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
