import { Routes } from '@angular/router';
import {AdminComponent} from "./admin/admin.component";
import {MainComponent} from "./main/main.component";
import {StatsComponent} from "./stats/stats.component";

const ApplicationRoutes: Routes = [
  {
    path: 'stats',
    component: StatsComponent,
  },
  {
    path: 'main',
    component: MainComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full',
  },
];

export {ApplicationRoutes};
