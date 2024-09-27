import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/market-list/market-list.component'; // Make sure to update the path
import { CreateMarketComponent } from './features/create-market/create-market.component';
import { EditMarketComponent } from './features/edit-market/edit-market.component';

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
    path: 'marketlist/edit/:id',
    component:EditMarketComponent
  }
];
