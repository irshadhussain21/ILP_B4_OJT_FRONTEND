import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarketlistComponent } from "./features/marketlist/marketlist.component";
import { SubGroupComponent } from "./features/sub-group/sub-group.component";
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MarketlistComponent,NavbarComponent, SubGroupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ILPB4_OJT_FRONTEND';
}
