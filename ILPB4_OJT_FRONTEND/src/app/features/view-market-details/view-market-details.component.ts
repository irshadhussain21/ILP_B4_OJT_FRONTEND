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
import { Market } from '../../core/models/market';
import { MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CreateMarketConfig } from '../../config/market';

/**
 * LLD
 *
 * This component is used to display details of the selected market.
 *
 * Execution Flow:
 *  - On initialization, the market ID is fetched from the route parameters.
 *  - The `MarketService` is used to fetch market details using the retrieved `marketId`.
 *  - The market details are then displayed using PrimeNG components.
 *
 * Fields:
 *  - **Market Name**: Displays the name of the market.
 *  - **Market Code**: Displays the market code (e.g., AA, Antarctica).
 *  - **Long Market Code**: Shows the formatted long market code (e.g., L-AQ.AA.AA).
 *  - **Region**: Shows the region the market belongs to (e.g., LAAPA).
 *  - **Sub-Region**: Displays the sub-region (e.g., Africa).
 *  - **Sub-Groups**: A list of subgroups that are part of the market.
 *    Each subgroup is displayed with its code and name in the format:
 *    `MarketCode + SubGroupCode - SubGroupName` (e.g., AAQ - Q-Island).
 *
 * Buttons:
 *  - **Delete Market**: Displays a button in the menu that, when clicked, opens a confirmation dialog for deleting the market.
 *                       This button is disabled if the market has subgroups.
 *  - **Edit Market**: A button to navigate to the edit page for the current market.
 *
 * Actions:
 *  - **Fetch Market Details**: Retrieves the market details based on `marketId` via the `loadMarketDetails` method.
 *  - **Delete Market**: Deletes the market if confirmed by the user through the confirmation dialog.
 *  - **Edit Market**: Navigates to the market edit page.
 *
 * Error Handling:
 *  - Logs errors if the market ID is missing or the API call fails.
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
    CardModule,
    PanelModule,
    TagModule,
    ChipModule,
    MenuModule,
    ButtonModule,
    HeaderComponent,
    NgFor,
    CommonModule,
    ConfirmDialogModule,
    ToastModule,
    TranslateModule,
  ],
  templateUrl: './view-market-details.component.html',
  styleUrls: ['./view-market-details.component.scss'],
  providers: [ConfirmationService,MessageService] 
})
export class ViewMarketDetailsComponent implements OnInit {
  marketDetails: Market | null = null;
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
    private messageService: MessageService,
    private translate: TranslateService,
    public translateService: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit() {
    this.marketId = +(this.route.snapshot.paramMap.get('marketId') ?? 0);
    if (this.marketId) {
      this.loadMarketDetails();
    
    } else {
      console.error('Market ID not found in the route');
    }
    
  }

 /**
   * The `combineSubGroupDetails` method processes the `marketDetails` object by mapping over its `marketSubGroups`.
   * It returns an array of formatted strings, where each string combines the market code with the subgroup code and name.
   * @param marketDetails - The market object containing subgroups.
   * @returns An array of strings combining the market code with each subgroup's code and name.
   */
  private combineSubGroupDetails(marketDetails: Market | null): string[] {
    return (
      marketDetails?.marketSubGroups?.map(
        (subgroup) =>
          `${marketDetails?.code}${subgroup.subGroupCode} - ${subgroup.subGroupName}`
      ) ?? []
    );
  }

  /*
   *The loadMarketDetails method fetches market data via the MarketService, assigns the retrieved data to the marketDetails properties.
   */
  private loadMarketDetails() {
    this.marketService.getMarketById(this.marketId!).subscribe({
      next: (data: Market) => {
        this.marketDetails = data;
        this.marketName = this.marketDetails?.name ?? '';
        this.combinedSubGroupDetails = this.combineSubGroupDetails(
          this.marketDetails
        );
        this.setupMenuItems();
      },
      error: (err) => {
        console.error('Failed to fetch market details', err);
      },
    });
  }
  /*
   * The setupMenuItems method initializes the UI's menu items "Delete Market"
   * option that is disabled if the market has subgroups, and configures commands to trigger methods like
   * confirmDeleteMarket when an option is selected.
   */
  private setupMenuItems() {
    this.items = [
      {
        items: [
          {
            label: this.translate.instant('PAGE.BUTTONS.DELETE_BUTTON'),
            command: () => this.confirmDeleteMarket(),
            disabled:
              !this.marketDetails ||
              (this.marketDetails.marketSubGroups &&
              this.marketDetails.marketSubGroups.length > 0),
          },
        ],
      },
    ];
  }
  /**
   *The confirmDeleteMarket method opens a confirmation dialog using PrimeNG's ConfirmationService to prompt the user
   *for market deletion, calling the deleteMarket method if confirmed, while taking no action if rejected.
   */
  public confirmDeleteMarket() {
    this.confirmationService.confirm({
      message: this.translate.instant('PAGE.LABELS.CONFIRM_DELETE_MESSAGE'), 
      header: this.translate.instant('PAGE.LABELS.CONFIRM_DELETE_HEADER'),   
      acceptLabel: this.translate.instant('PAGE.BUTTONS.CONFIRM'),    
      rejectLabel: this.translate.instant('PAGE.BUTTONS.CANCEL'),    
      rejectButtonStyleClass: 'p-button-transparent',
      accept: () => this.deleteMarket(),
      reject: () => console.log('Delete action canceled'),
    });
  }

  /**
   *The deleteMarket method handles market deletion by invoking the MarketService.deleteMarket API with the current 
   *marketId. On success, a success message is displayed using PrimeNG's MessageServiceand the user is 
   *redirected to the markets list. If an error occurs, it logs the error to the console.
   */
    deleteMarket() {
    if (this.marketId) {
      this.marketService.deleteMarket(this.marketId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.translateService.instant(
              CreateMarketConfig.MESSAGES.SUCCESS_MESSAGES.MARKET_CREATED
            ),
          });
          setTimeout(() => {
            this.router.navigate(['/markets']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error deleting market:', error);
        },
      });
    }
  }
  
  /**
   The navigateToEdit method navigates the user to the market edit page using Angular's Router, 
   directing them to the /markets/edit/:marketId URL, where the marketId is dynamically inserted.
   If the marketId is undefined, an error message is logged to the console..
   */
  navigateToEdit() {
    if (this.marketId) {
      this.router.navigate([`/markets/edit/${this.marketId}`]);
    } else {
      console.error('Market ID is not defined');
    }
  }
}