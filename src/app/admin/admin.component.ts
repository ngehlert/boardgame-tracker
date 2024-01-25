import { Component, OnInit } from '@angular/core';
import { DataStorageService } from '../data-storage.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  public players: string = JSON.stringify(this.store.getPlayers(), null, 4);
  public games: string = JSON.stringify(this.store.getGames(), null, 4);
  public playedGames: string = JSON.stringify(this.store.getPlayedGames(), null, 4);

  constructor(
    private store: DataStorageService,
  ) {

  }

  public updatePlayers(): void {
    try {
      this.store.dangerouslySetPlayers(JSON.parse(this.players));
    } catch (error) {
      alert(error);
    }
  }

  public updateGames(): void {
    try {
      this.store.dangerouslySetGames(JSON.parse(this.games));
    } catch (error) {
      alert(error);
    }
  }
  public updatePlayedGames(): void {
    try {
      this.store.dangerouslySetPlayedGames(JSON.parse(this.playedGames));
    } catch (error) {
      alert(error);
    }
  }

}
