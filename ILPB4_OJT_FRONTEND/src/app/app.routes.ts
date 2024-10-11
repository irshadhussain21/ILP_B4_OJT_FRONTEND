import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/market-list/market-list.component'; // Make sure to update the path
import { ViewMarketDetailsComponent } from './features/view-market-details/view-market-details.component';
import { CreateMarketComponent } from './features/market-form/create-market.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'markets',
    pathMatch: 'full',
  },
  {
    path: 'markets',
    component: MarketlistComponent,
  },
  {
    path: 'markets/create',
    component: CreateMarketComponent,
  },
  {
    path: 'markets/edit/:id',
    component: CreateMarketComponent,
  },
  {
    path: 'markets/:marketId',
    component: ViewMarketDetailsComponent,
  },
];
