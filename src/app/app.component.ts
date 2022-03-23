import { Component } from '@angular/core';
import { Game, Player } from './types';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public players: Array<Player> = [
    {id: 1, name: 'Nico'},
    {id: 2, name: 'Tom'},
    {id: 3, name: 'Sevi'},
    {id: 4, name: 'Milli'},
    {id: 5, name: 'Ross'},
    {id: 6, name: 'Joey'},
    {id: 7, name: 'Chandler'},
  ];
  public games: Array<Game> = [
    { id: 1, name: '7 Wonders', duration: 30},
    { id: 2, name: 'Camel Cup', duration: 30},
    { id: 3, name: 'Der weisse Hai', duration: 60},
  ];

  public playingPlayers: Array<Player> = []
  public playedGame: Game | null = null;

  public isAddingGameOpen: boolean = false;
  public newGameName: string = '';
  public newGameDuration: number = 30;

  public dropPlayer(event: CdkDragDrop<Array<Player>>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  public dropGame(event: CdkDragDrop<Array<Game>>) {
    this.playedGame = event.previousContainer.data[event.previousIndex];
  }

  public savePlayedGame(): void {
    console.log(this.playingPlayers);
  }

  public addGame(): void {
    this.isAddingGameOpen = !this.isAddingGameOpen;
  }

  public saveNewGame(): void {

  }
}
