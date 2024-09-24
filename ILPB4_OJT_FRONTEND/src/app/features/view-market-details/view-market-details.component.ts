
import { Component, OnInit } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-view-market-details',
  standalone: true,
  imports: [ CardModule, PanelModule, TagModule,ChipModule,MenuModule,ButtonModule], // CommonModule for directives
  templateUrl: './view-market-details.component.html',
  styleUrl: './view-market-details.component.css'
})
export class ViewMarketDetailsComponent implements OnInit {
  marketDetails: any; // Replace with the appropriate type if available
  items = [
    { label: 'Activity Log', command: () => this.onActivityLog() },
    { label: 'Delete Market', command: () => this.onDeleteMarket() }
  ];
  onActivityLog() {
    // Handle activity log action
    console.log('Activity Log clicked');
  }

  onDeleteMarket() {
    // Handle delete market action
    console.log('Delete Market clicked');
  }
  ngOnInit() {
    // You can add your logic here
  }
  
}
