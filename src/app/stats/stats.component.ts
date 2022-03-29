import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { DataStorageService } from '../data-storage.service';
import { PlayedGame, Player } from '../types';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  public columnDefs: Array<ColDef> = [];
  public rowData: Array<TableEntry> = [];

  constructor(
    private store: DataStorageService,
  ) { }

  ngOnInit(): void {
    this.columnDefs = this.getColumnDefs();
    this.rowData = this.getRowData();
  }

  private getRowData(): Array<TableEntry> {
    const tableEntryByPlayerName: Map<string, TableEntry> = new Map();
    this.store.getPlayers().forEach((player: Player) => {
      tableEntryByPlayerName.set(player.name, {
        player,
        uniqueGames: new Set(),
        totalGames: 0,
        score: 0,
      });
    });

    this.store.getPlayedGames().forEach((playedGame: PlayedGame) => {
      const totalAmountOfPlayers: number = this.getTotalAmountOfPlayers(playedGame.placements);
      playedGame.placements.forEach((players: Array<Player>, index: number) => {
        players.forEach((player: Player) => {
          const tableEntry: TableEntry | undefined = tableEntryByPlayerName.get(player.name);
          if (tableEntry) {
            tableEntry.uniqueGames.add(playedGame.game.name);
          }

        });
      });
    });

    return Array.from(tableEntryByPlayerName.values());
  }

  private getColumnDefs(): Array<ColDef> {
    return [
      {
        headerName: 'Name',
        field: 'player.name',
      },
      {
        headerName: 'Total Spiele',
        field: 'totalGames',
      },
      {
        headerName: 'Unique Spiele',
        field: 'uniqueGames.size',
      },
      {
        headerName: 'Gesamt Punkte',
        field: 'score',
      },
      {
        headerName: 'Extra Punkte',
        field: 'player.extraPoints',
      },
    ];
  }

  private getTotalAmountOfPlayers(placements: Array<Array<Player>>): number {
    return placements.reduce((result: number, current: Array<Player>) => {
      return result + current.length;
    }, 0);
  }
}

interface TableEntry {
  player: Player;
  uniqueGames: Set<string>;
  totalGames: number;
  score: number;
}
