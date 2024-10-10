import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/market-list/market-list.component'; 
import { CreateMarketComponent } from './features/create-market/create-market.component';
import { ViewMarketDetailsComponent } from './features/view-market-details/view-market-details.component';
import { EditMarketComponent } from './features/edit-market/edit-market.component';

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
    component: EditMarketComponent,
  },
  {
    path: 'markets/:marketId',
    component: ViewMarketDetailsComponent,
  },
];