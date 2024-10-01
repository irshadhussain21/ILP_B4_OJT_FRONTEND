import { Routes } from '@angular/router';
import { MarketlistComponent } from './features/marketlist/marketlist.component'; // Make sure to update the path
import { CreateMarketComponent } from './features/create-market/create-market.component';
import { SubGroupComponent } from './features/sub-group/sub-group.component';
import { ViewMarketDetailsComponent } from './features/view-market-details/view-market-details.component';
import { EditMarketComponent } from './features/edit-market/edit-market.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/marketlist',
    pathMatch: 'full'
  },
  {
    path:'subgroup',
    component: SubGroupComponent
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
  },
  {
    path: 'marketlist/market/:marketId',
    component:ViewMarketDetailsComponent
  }
];
