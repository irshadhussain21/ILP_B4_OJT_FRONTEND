import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

import { HeaderComponent } from '../../shared/header/header.component';
import { MarketService } from '../../services/market.service';
import { Market} from '../../core/models/market';
import { MenuItem, ConfirmationService,MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

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
 *  - `GET https://localhost:7058/api/Market/1`: Fetches details for a specific market.
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
    CommonModule,ConfirmDialogModule,ToastModule
  ],
  templateUrl: './view-market-details.component.html',
  styleUrls: ['./view-market-details.component.css'],
  providers: [ConfirmationService,MessageService] 
})
export class ViewMarketDetailsComponent implements OnInit {
 
  marketDetails: Market| null = null;
  marketId: number | undefined;
  market: Market | null = null;
  marketName: string = '';
  combinedSubGroupDetails: string[] = [];
  items: MenuItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.marketId = +(this.route.snapshot.paramMap.get('marketId') ?? 0);
    if (this.marketId) {
      this.loadMarketDetails();
    } else {
      console.error('Market ID not found in the route');
    }
  }

  // Helper function to combine subgroup details into a formatted array.
  private combineSubGroupDetails(marketDetails: Market | null): string[] {
    return marketDetails?.marketSubGroups?.map(subgroup =>
      `${marketDetails?.code}${subgroup.subGroupCode} - ${subgroup.subGroupName}`) ?? [];
  }

  // Load market details and initialize state
  private loadMarketDetails() {
    this.marketService.getMarketById(this.marketId!).subscribe({
      next: (data: Market) => {
        this.marketDetails = data;
        this.market = data;  // Assuming marketDetails contains market info
        this.marketName = this.marketDetails?.name ?? '';
        this.combinedSubGroupDetails = this.combineSubGroupDetails(this.marketDetails);
        this.setupMenuItems();
      },
      error: (err) => {
        console.error('Failed to fetch market details', err);
      }
    });
  }

  // Set up menu items
  private setupMenuItems() {
    this.items = [
      {
        items: [
          {
            label: 'Delete Market',
            command: () => this.confirmDeleteMarket(),
            disabled: !this.market || !this.market.marketSubGroups || this.market.marketSubGroups.length > 0
          }
        ]
      }
    ];
  }

  // Confirm delete action
  private confirmDeleteMarket() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this market?',
      header: 'Confirm Delete',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      rejectButtonStyleClass: 'p-button-transparent',
      accept: () => this.deleteMarket(),
      reject: () => console.log('Delete action canceled')
    });
  }

  // Delete market from backend
  private deleteMarket() {
    if (this.marketId) {
      this.marketService.deleteMarket(this.marketId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${this.market?.name} market deleted successfully`
          });
          this.router.navigate(['/markets']);
        },
        error: (error) => {
          console.error('Error deleting market:', error);
        }
      });
    }
  }

  // Navigate to edit market page
  navigateToEdit() {
    if (this.marketId) {
      this.router.navigate([`/markets/edit/${this.marketId}`]);
    } else {
      console.error('Market ID is not defined');
    }
  }
}