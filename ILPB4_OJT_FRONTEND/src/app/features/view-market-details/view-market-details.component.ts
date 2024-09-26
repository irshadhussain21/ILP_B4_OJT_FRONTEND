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
import { MarketDetails } from '../../core/market-details';

/**
 * @class ViewMarketDetailsComponent
 * 
 * @description
 * Displays market details by fetching data using `MarketService`. It retrieves the `marketId` from the route parameters.
 * 
 * @selector `app-view-market-details`
 * 
 * @implements `OnInit`
 * 
 * @imports
 * - `CommonModule`, `NgFor`: Angular directives.
 * - PrimeNG modules (`CardModule`, `PanelModule`, `TagModule`, etc.) for UI components.
 * - `HeaderComponent`: Custom header for the page.
 * 
 * @dependencies
 * - `ActivatedRoute`: To access route parameters.
 * - `MarketService`: To fetch market data.
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

  /**
   @property {MarketDetails | null} marketDetails
   * Stores the fetched market details after calling the API.
   */
   marketDetails: MarketDetails | null = null;

  /**
   * @property {number | undefined} marketId
   * Stores the market ID obtained from the route parameters.
   */
  marketId: number | undefined;

  /**
   * @constructor
   * Injects `ActivatedRoute` to access route parameters and `MarketService` to fetch market data.
   * 
   * @param route 
   * @param marketService 
   */
  constructor(private route: ActivatedRoute, private marketService: MarketService) {}

  /**
   * @method ngOnInit
   * Retrieves the `marketId` from the route and calls `fetchMarketDetails` if the ID is valid.
   */
  ngOnInit() {
    this.marketId = +(this.route.snapshot.paramMap.get('marketId') ?? 0);  // Parse marketId from the route
    
    // Fetch market details using the marketId from the route
    if (this.marketId) {
      this.fetchMarketDetails(this.marketId);
    } else {
      console.error('Market ID not found in the route');  // Error handling if marketId is missing
    }
  }

  /**
   * @method fetchMarketDetails
   * Fetches market details by calling the `MarketService` with the provided `marketId`.
   * 
   * @param {number} marketId
   * @returns void
   * 
   * @errorHandling
   * Logs an error if the API call fails.
   */
  fetchMarketDetails(marketId: number) {
    this.marketService.getMarketById(marketId).subscribe({
      next: (data) => {
        this.marketDetails = data;  // Assign fetched data to marketDetails
      },
      error: (err) => {
        console.error('Failed to fetch market details', err);  // Error handling for API failure
      }
    });
  }
}
