import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

import { HeaderComponent } from '../../shared/header/header.component';


import { MarketService } from '../../services/market.service';
import { MarketDetails } from '../../core/models/market';

/**
 * LLD
 * 
 * This component is used to display details of the selected market.
 * 
 * Execution Flow:
 *  - On initialization, the market ID is fetched from the route parameters.
 *  - The `MarketService` is used to fetch market details using the retrieved `marketId`.
 *  - The market details are then displayed using Primeng components.
 * 
 * This screen contains the following actions:
 *  - Fetch Market Details: Retrieves the market details based on `marketId`.
 *  - Error Handling: Logs errors if the market ID is missing or the API call fails.
 * 
 * API Endpoints:
 *  - `GET https://localhost:7058/api/Market/1/details`: Fetches details for a specific market.
 * 
 * Sample API Response:
 *  {
 *    "marketId": 1,
 *    "marketName": "Antarctica",
 *    "marketCode": "AA",
 *    "longMarketCode": "L-AQ.AA.AA",
 *    "region": "LAAPA",
 *    "subRegion": "Africa",
 *    "marketSubGroups": [
 *      {
 *        "subGroupId": 1,
 *        "subGroupName": "Q-Island",
 *        "subGroupCode": "Q"
 *      },
 *      {
 *        "subGroupId": 2,
 *        "subGroupName": "Ross Island",
 *        "subGroupCode": "R"
 *      }
 *    ]
 *  }
 */

@Component({
  selector: 'app-view-market-details',
  standalone: true,
  imports: [
    CardModule, PanelModule, TagModule, ChipModule, 
    MenuModule, ButtonModule, HeaderComponent, NgFor, 
    CommonModule
  ],
  templateUrl: './view-market-details.component.html',
  styleUrls: ['./view-market-details.component.css']
})
export class ViewMarketDetailsComponent implements OnInit {

  marketDetails: MarketDetails | null = null;
  marketId: number | undefined;

  constructor(private route: ActivatedRoute, private marketService: MarketService) {}

  ngOnInit() {
    this.marketId = +(this.route.snapshot.paramMap.get('marketId') ?? 0);
    
    if (this.marketId) {
      this.getMarketDetails(this.marketId);
    } else {
      console.error('Market ID not found in the route');
    }
  }

  /**
   * get market details from the backend.
   * 
   * @param marketId The ID of the market to fetch details for.
   */
  getMarketDetails(marketId: number) {
    this.marketService.getMarketById(marketId).subscribe({
      next: (data) => {
        this.marketDetails = data;
      },
      error: (err) => {
        console.error('Failed to fetch market details', err);
      }
    });
  }
}
