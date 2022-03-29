import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsComponent } from './stats.component';
import { RouterModule, Routes } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';


const routes: Routes = [
  {
    path: '',
    component: StatsComponent,
  }
];
@NgModule({
  declarations: [
    StatsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AgGridModule,
  ]
})
export class StatsModule { }
