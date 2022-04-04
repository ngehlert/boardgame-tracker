import { Component, OnInit } from '@angular/core';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { DataStorageService } from '../data-storage.service';
import { Game, PlayedGame, Player } from '../types';
import { ValueGetterParams } from 'ag-grid-community/dist/lib/entities/colDef';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  public columnDefs: Array<ColDef> = [];
  public defaultColDef: ColDef = this.getDefaultColDef();
  public rowData: Array<TableEntry> = [];

  constructor(
    private store: DataStorageService,
    private decimalPipe: DecimalPipe,
  ) { }

  ngOnInit(): void {
    this.columnDefs = this.getColumnDefs();
    this.rowData = this.getRowData();
  }

  private getDefaultColDef(): ColDef {
    return {
      cellStyle: {'text-align': 'right'},
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === 'number') {
          return this.decimalPipe.transform(params.value);
        }

        return params.value;
      }
    };
  }

  private getRowData(): Array<TableEntry> {
    const tableEntryByPlayerName: Map<string, TableEntry> = new Map();
    this.store.getPlayers().forEach((player: Player) => {
      tableEntryByPlayerName.set(player.name, {
        player,
        uniqueGames: new Set(),
        totalGames: 0,
        score: 0,
        specialGames: new Map(),
      });
    });
    const games: Array<Game> = this.store.getGames();

    this.store.getPlayedGames().forEach((playedGame: PlayedGame) => {
      const totalAmountOfPlayers: number = this.getTotalAmountOfPlayers(playedGame.placements);

      const game: Game = games.find((current: Game) => current.name === playedGame.game.name) || playedGame.game;
      const gameTime: number = game.duration;
      playedGame.placements.forEach((players: Array<Player>, index: number) => {
        players.forEach((player: Player) => {
          const tableEntry: TableEntry | undefined = tableEntryByPlayerName.get(player.name);
          if (!tableEntry) {
            return;
          }
          let score: number = 0;
          if (players.length === 1 || game.isCoopGame) {
            score = (totalAmountOfPlayers - index) * gameTime;
          } else {
            for (let i: number = 0; i < players.length; i++) {
              score += (totalAmountOfPlayers - index - i) * gameTime;
            }
            score = score / players.length;
          }

          if (game.isSpecialGame) {
            const existingEntry: {score: number; timestamp: number} | undefined = tableEntry.specialGames.get(game.name);

            if ((existingEntry && playedGame.timestamp < existingEntry.timestamp) || !existingEntry) {
              tableEntry.specialGames.set(game.name, {timestamp: playedGame.timestamp, score});
            }
          }

          tableEntry.uniqueGames.add(game.name);
          tableEntry.score += score;
          tableEntry.totalGames++;
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
        cellStyle: {'text-align': 'left'},
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
        headerName: 'Ø Punkte',
        valueGetter(params: ValueGetterParams): number {
          return params.data.score / (params.data.totalGames || 1);
        }
      },
      {
        headerName: 'Die kreativen 3',
        valueGetter(params: ValueGetterParams): number {
          const specialGames: Map<string, {score: number; timestamp: number}> = params.data.specialGames;

          return Array.from(specialGames.values()).reduce((result, current) => {
            return result + current.score;
          }, 0);
        }
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
  specialGames: Map<string, {score: number; timestamp: number}>;
}
