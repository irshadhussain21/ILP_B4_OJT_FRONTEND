import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarketlistComponent } from './features/market-list/market-list.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ViewMarketDetailsComponent } from "./features/view-market-details/view-market-details.component";
import { SubGroupComponent } from './features/sub-group/sub-group.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MarketlistComponent, 
    NavbarComponent, 
    ViewMarketDetailsComponent,
    SubGroupComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ILPB4_OJT_FRONTEND';
}
