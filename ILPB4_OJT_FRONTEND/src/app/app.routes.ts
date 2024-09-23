import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/marketlist/marketlist.component'; // Make sure to update the path
import { CreateMarketComponent } from './features/create-market/create-market.component';
import { ViewMarketDetailsComponent } from './features/view-market-details/view-market-details.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/marketlist',
    pathMatch: 'full'
  },
  {
    path: 'marketlist',
    component: MarketlistComponent
  },
  {
    path:"marketlist/create",
    component:CreateMarketComponent
  },
  {
    path:"marketlist/market",
    component:ViewMarketDetailsComponent
  }
];
