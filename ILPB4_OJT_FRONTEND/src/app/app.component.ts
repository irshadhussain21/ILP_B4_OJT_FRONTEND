import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarketlistComponent } from "./features/marketlist/marketlist.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MarketlistComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ILPB4_OJT_FRONTEND';
}
