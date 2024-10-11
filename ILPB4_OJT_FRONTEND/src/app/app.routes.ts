import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/market-list/market-list.component'; // Make sure to update the path
import { CreateMarketComponent } from './features/create-market/create-market.component';
import { ViewMarketDetailsComponent } from './features/view-market-details/view-market-details.component';
import { EditMarketComponent } from './features/edit-market/edit-market.component';
import { SubgroupComponent } from './features/subgroup/subgroup.component';
import { MarketFormComponent } from './features/market-form/market-form.component';

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
    component: MarketFormComponent,
  },
  {
    path: 'markets/edit/:id',
    component: MarketFormComponent,
  },
  {
    path: 'markets/:marketId',
    component: ViewMarketDetailsComponent,
  },
];
