// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-view-market-details',
// //   standalone: true,
// //   imports: [],
// //   templateUrl: './view-market-details.component.html',
// //   styleUrl: './view-market-details.component.css'
// // })
// // export class ViewMarketDetailsComponent {

// // }
// import { Component, OnInit } from '@angular/core';
// import { MarketService } from '../../services/market.service';
// import { CardModule } from 'primeng/card';
// import { PanelModule } from 'primeng/panel';
// import { CommonModule } from '@angular/common';
// import { TagModule } from 'primeng/tag';


// @Component({
//   selector: 'app-view-market-details',
//   standalone: true,
//   imports: [CardModule,PanelModule,CommonModule,TagModule],
//   templateUrl: './view-market-details.component.html',
//   styleUrl: './view-market-details.component.css'
// })
// export class ViewMarketDetailsComponent implements OnInit {
//   marketDetails: any; // Replace with the appropriate type if available

//   // constructor(private marketService: MarketService) {}

//   ngOnInit() {
//     // Fetch market details, replace with actual market code or ID as needed
//     // this.marketService.getMarketDetails('AA').subscribe(data => {
//     //   this.marketDetails = data;
//     // });
//   }
// }
import { Component, OnInit } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';


@Component({
  selector: 'app-view-market-details',
  standalone: true,
  imports: [ CardModule, PanelModule, TagModule,ChipModule], // CommonModule for directives
  templateUrl: './view-market-details.component.html',
  styleUrl: './view-market-details.component.css'
})
export class ViewMarketDetailsComponent implements OnInit {
  marketDetails: any; // Replace with the appropriate type if available

  ngOnInit() {
    // You can add your logic here
  }
}
