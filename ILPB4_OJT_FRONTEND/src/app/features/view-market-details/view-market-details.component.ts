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
import { RegionEnum } from '../../core/enums/region.enum';
import { RegionService } from '../../services/region.service';
import { Region } from '../../core/models/region';

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
 *  - ` GET https://localhost:7058/api/Market/1: Fetches details for a specific market.
 *
 *
 * Sample API Response:
 *  {
 *   "id": 1,
 *   "name": "Antarctica",
 *   "code": "AA",
 *   "longMarketCode": "L-AQ.AA.AA",
 *   "region": 2,
 *   "subRegion": 4,
 *   "marketSubGroups": [
 *     {
 *       "subGroupId": 1,
 *       "subGroupName": "Q-Island",
 *       "subGroupCode": "Q",
 *       "marketId": 1,
 *       "createdAt": "2023-09-25T05:00:45.123457Z",
 *       "updatedAt": "2023-09-25T05:00:45.123457Z"
 *     },
 *     {
 *       "subGroupId": 2,
 *       "subGroupName": "Ross Island",
 *       "subGroupCode": "R",
 *       "marketId": 1,
 *       "createdAt": "2023-09-25T05:00:45.123457Z",
 *       "updatedAt": "2023-09-25T05:00:45.123457Z"
 *     }
 *   ],
 *   "createdAt": "2024-09-26T05:21:57.721432Z",
 *   "updatedAt": "2024-09-26T05:21:57.721433Z"
 * }
 *
 * -GET https://localhost:7058/api/Region/2/subregions: Fetches marketsubgroup details for a specific market.
 *
 * Sample API Response:
 * [
 *   {
 *     "key": 2,
 *     "value": "LatinAmerica"
 *   },
 *   {
 *     "key": 3,
 *     "value": "AsiaPacific"
 *   },
 *   {
 *     "key": 4,
 *     "value": "Africa"
 *   }
 * ]
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
  providers: [ConfirmationService, MessageService],
})
export class ViewMarketDetailsComponent implements OnInit {
  marketDetails: Market | null = null;
  marketId: number | undefined;
  market: Market | null = null;
  marketName: string = '';
  combinedSubGroupDetails: string[] = [];
  items: MenuItem[] = [];
  regionName: RegionEnum | undefined;
  subGroupDetails: any;
  subRegionsMap: { [key: string]: string } = {};
  subRegionName: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private regionService: RegionService
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
  private combineSubGroupDetails(
    marketDetails: Market | null,
    subGroupDetails: any
  ): string[] {
    return (
      marketDetails?.marketSubGroups?.map(
        (subgroup) =>
          `${marketDetails?.code}${subgroup.subGroupCode} - ${subgroup.subGroupName}`
      ) ?? []
    );
  }

  /*
   *This function loads market details by fetching the market information and subregion via marketservice and regionservice,
    then combines them while mapping the region ID to its name using RegionEnum.
   */
  private loadMarketDetails() {
    this.marketService.getMarketDetailsById(this.marketId!).subscribe({
      next: (data: Market) => {
        this.marketDetails = data;
        const regionId = this.marketDetails?.region;
        this.marketName = this.marketDetails?.name ?? '';
        this.regionName = RegionEnum[regionId as keyof typeof RegionEnum];
        this.regionService.getSubRegionsByRegion(Number(regionId)).subscribe({
          next: (subregions: Region[]) => {
            subregions.forEach((subregion) => {
              this.subRegionsMap[subregion.key.toString()] = subregion.value;
            });
            const subRegionId = this.marketDetails?.subRegion;
            if (subRegionId) {
              this.subRegionName = this.subRegionsMap[subRegionId.toString()];
            }
            this.setupMenuItems();
          },
          error: (err) => {
            console.error('Failed to fetch subregion details', err);
          },
        });
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
              !this.market ||
              !this.market.marketSubGroups ||
              this.market.marketSubGroups.length > 0,
          },
        ],
      },
    ];
  }
  /**
   *The confirmDeleteMarket method opens a confirmation dialog using PrimeNG's ConfirmationService to prompt the user
   *for market deletion, calling the deleteMarket method if confirmed, while taking no action if rejected.
   */
  private confirmDeleteMarket() {
    this.confirmationService.confirm({
      message: this.translate.instant('PAGE.CONFIRM_DELETE_MESSAGE'),
      header: this.translate.instant('PAGE.CONFIRM_DELETE_HEADER'),
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
  private deleteMarket() {
    if (this.marketId) {
      this.marketService.deleteMarket(this.marketId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('PAGE.SUCCESS'),
            detail: this.translate.instant('PAGE.MARKET_DELETED_SUCCESS', {
              marketName: this.market?.name,
            }),
          });
          this.router.navigate(['/markets']);
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
      state: {
        marketName: this.marketName;
      }
    } else {
      console.error('Market ID is not defined');
    }
  }
}
