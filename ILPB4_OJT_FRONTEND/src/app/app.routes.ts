import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/pages/marketlist/marketlist.component'; // Make sure to update the path

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/marketlist',
    pathMatch: 'full'
  },
  {
    path: 'marketlist',
    component: MarketlistComponent
  }
];
