import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewMarketDetailsComponent } from "./features/view-market-details/view-market-details.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ViewMarketDetailsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ILPB4_OJT_FRONTEND';
}
