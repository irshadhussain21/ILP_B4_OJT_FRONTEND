import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/** External Libraries */
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule,TranslateService } from '@ngx-translate/core';
/** Local imports */
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { Market, MarketSubgroup } from '../../core/models/market';
import { Region } from '../../core/models/region';
import { HeaderComponent } from "../../shared/header/header.component";
import { RegionEnum, RegionFullForms } from '../../core/enums/region.enum';
import { PaginationConstants } from '../../config/market';

/**
 * LLD
 *
 * This component is responsible for displaying a list of markets with features for filtering,
 * sorting, and pagination. It integrates with the `MarketService` to fetch market data and
 * allows users to search and filter markets by various criteria.
 *
 * Execution Flow:
 *  - On initialization, the component fetches all regions and subregions from the `RegionService`
 *    and market data from the `MarketService`.
 *  - It populates the regions and subregions in a dropdown for filtering purposes.
 *  - The user can filter the market list using the search text, selected regions, and subregions.
 *  - Markets can be sorted by different fields, and pagination is supported to manage the number of
 *    displayed records.
 *  - The `clearFilter` method allows users to reset the search input to display all markets.
 *
 * API Endpoints:
 *  - `GET /api/Regions`: Fetches all available regions.
 *  - `GET /api/Regions/{regionKey}/SubRegions`: Fetches subregions based on the selected region.
 *  - `GET /api/Markets`: Fetches a list of all markets.
 *  - `GET /api/Markets/Search`: Searches markets based on the provided search text.
 *
 * Sample API Response (GET /api/Markets):
 *  [
 *    {
 *      "id": 1,
 *      "name": "Global Market",
 *      "code": "GM",
 *      "longMarketCode": "L-GM.AA.AA",
 *      "region": "EURO",
 *      "subRegion": "SubRegion 1",
 *      "marketSubGroups": [
 *        {
 *          "subGroupId": 1,
 *          "subGroupName": "SubGroup 1",
 *          "subGroupCode": "SG1"
 *        }
 *      ]
 *    },
 *    ...
 *  ]
 */

@Component({
  selector: 'app-marketlist',
  standalone: true,
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    TooltipModule,
    TagModule, RouterLink, FormsModule,DropdownModule,PaginatorModule,
    MultiSelectModule,
    HeaderComponent,
    TranslateModule
  ],
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.scss']
})
export class MarketlistComponent implements OnInit {

  /**
   * Title for the market list component
   */
  @Input() title: string = '';
  /**
   * Array to hold the fetched markets
   */
  markets!: Market[];
  
  /**
   * Array to hold the filtered markets
   */
  filteredMarkets: Market[] = [];
  
  /**
   * Variable to hold the selected market
   */
  selectedMarket!: Market;
  
  /**
   * Search text entered by the user
   */
  searchText: string = ''; 
  
  /**
   * Number of rows to display per page
   */
  rows: number = PaginationConstants.defaultRows; 
  
  /**
   * Index of the first row for pagination
   */
  first: number = 0;
  
  /**
   * Total number of markets
   */
  totalMarkets: number = 0; 
  
  /**
   * Options for the number of rows per page in pagination
   */
  rowsPerPageOptions = PaginationConstants.rowsPerPageOptions;
  
  /**
   * Selected number of rows per page
   */
  selectedRowsPerPage: number = this.rows;
  
  /**
   * List of regions for filtering markets
   */
  regions: any[] = []
  
  /**
   * Selected regions for filtering markets
   */
  selectedRegions: any[] = [];

  /**
   * Field used for sorting
   */
  sortField: string = '';
  
  /**
   * Sort order (1 for ascending, -1 for descending)
   */
  sortOrder: number = 1;

  /**
   * Map of regions with their corresponding names
   */
  regionsMap: { [key: string]: string } = {}; 
  
  /**
   * Map of subregions with their corresponding names
   */
  subRegionsMap: { [key: string]: string } = {}; 
   
  constructor(private marketService: MarketService, private regionService: RegionService) {
    this.regions = this.getRegions();
  }
 

  ngOnInit() {
    this.loadMarkets(1,this.rows);

  }
  /**The getRegions() function generates a list of regions by mapping the numeric values from the RegionEnum to their 
   * corresponding labels from the RegionFullForms map. */
  getRegions() {
    return Object.keys(RegionEnum)
      .filter(key => !isNaN(Number(RegionEnum[key as keyof typeof RegionEnum])))
      .map(key => ({
        label: RegionFullForms[RegionEnum[key as keyof typeof RegionEnum]],
        value: RegionEnum[key as keyof typeof RegionEnum], 
      }));
  } 
   /**
   * Function to load markets with pagination and search text.
   */
  loadMarkets(pageNumber: number , pageSize: number , searchText: string = ''): void {
    this.marketService.getAllMarkets(pageNumber, pageSize, searchText).subscribe(
      (response: any) => {
        this.markets = response.markets || []; 
        this.filteredMarkets = this.markets;
        this.totalMarkets = response.totalCount ;
        console.log(this.totalMarkets);
      
      },
      (error) => {
        console.error('Error fetching markets:', error);
      }
    );
  }
 
 
  filterMarketsByRegion() {
    if (this.selectedRegions.length > 0) {
    
      const region = this.selectedRegions.map(region => region.value).join(',');
    
      this.marketService.getAllMarkets(0,10,null,region).subscribe(
        (data:any) => {
          this.filteredMarkets = data.markets;
         
          this.totalMarkets = data.length;  
          this.first = 0;  
        },
        (error) => {
          console.error('Error fetching filtered markets:', error);
        }
      );
    } else {
      this.filteredMarkets = this.markets;
      this.totalMarkets = this.markets.length;
    }
  }

  /**
   * Filters the list of markets based on the search text entered by the user and paginates the results.
   */
  filterMarkets() {
    this.first = 0;
    this.loadMarkets(1, this.selectedRowsPerPage, this.searchText);
  }


   /**
   * Clears the search filter and resets the filtered list to the original markets list
   */
  clearFilter() {
    this.searchText = ''; 
    this.filterMarkets();  
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }


  clearAll() {
    this.selectedRegions = [];  
    this.filteredMarkets = this.markets;
    this.totalMarkets = this.markets.length;
    this.first = 0;
  }
  removeRegion(region: any) {
    this.selectedRegions = this.selectedRegions.filter(selected => selected.value !== region.value);
    this.filterMarketsByRegion();
  }
  
 
  /**
   * Retrieve the sub group code for displaying it in the market list.
   * @param market - market details to get subgroup code
   */
  getSubgroupCode(market: Market): string {
    return market.marketSubGroups ? market.marketSubGroups.map(subgroup => subgroup.subGroupCode).join(' ') : '';
  }

  /**
   * Retrieves the Formatted SubGroupCode
   * @param marketCode - market code 
   * @param subGroupCode - Subgroup code in the market
   * @returns Concatinated Subgroup code
   */
  getFormattedSubGroupCode(marketCode: string, subGroupCode: string): string {
    return `${marketCode.toUpperCase()}${subGroupCode}`;
  }

  /**
   * Helper method to check if the current subgroup is the last one
   */
  isLast(subGroup: MarketSubgroup, subGroups: MarketSubgroup[]): boolean {
    return subGroups.indexOf(subGroup) === subGroups.length - 1;
  }

  /**
   * Function to handle page change in paginator
   */
  onPageChange(event: any): void {
    const pageNumber = Math.floor(event.first / this.selectedRowsPerPage) + 1;
    this.first = event.first;
    this.loadMarkets(pageNumber, this.selectedRowsPerPage, this.searchText);
    console.log('Current Page Number:', pageNumber);
    
  }

  /**
   * Function to handle rows per page change
   */
  onRowsPerPageChange(event: any): void {
    this.selectedRowsPerPage = event.value;
    this.first = 0;
    this.loadMarkets( 1, this.selectedRowsPerPage, this.searchText);
  }
}
