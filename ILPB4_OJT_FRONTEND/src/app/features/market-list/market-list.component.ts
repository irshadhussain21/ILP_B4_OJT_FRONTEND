import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { Market, MarketDetails, MarketSubgroup } from '../../core/models/market';
import { Region } from '../../core/models/region';

@Component({
  selector: 'app-marketlist',
  standalone: true,
  imports: [
    TableModule, 
    InputTextModule, 
    CommonModule,
    TooltipModule,
    TagModule,RouterLink,FormsModule
  ],
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.css']
})
export class MarketlistComponent implements OnInit {
  markets!: Market[];
  filteredMarkets!: Market[];
  selectedMarket!: Market;  
  searchText: string = ''; 

  constructor(private marketService: MarketService, private regionService: RegionService) {}
  sortField: string = '';
  sortOrder: number = 1;

  regionsMap: { [key: string]: string } = {}; // Stores region key-value pairs
  subRegionsMap: { [key: string]: string } = {}; // Stores subregion key-value pairs

  onSort(event: any) {
      this.sortField = event.field;
      this.sortOrder = event.order;
  }

  ngOnInit() {

      // Fetch regions data
      this.regionService.getAllRegions().subscribe((regions: Region[]) => {
        regions.forEach(region => {
          this.regionsMap[region.key.toString()] = region.value;

        // Fetch subregions for each region
        this.regionService.getSubRegionsByRegion(region.key).subscribe(
          (subregions: Region[]) => {
            subregions.forEach(subregion => {
              this.subRegionsMap[subregion.key.toString()] = subregion.value;
            });
          },
          (error) => {
            console.error(`Error fetching subregions for region ${region.key}:`, error);
          }
        );
      });
    });



      // Fetch markets from the backend
      this.marketService.getAllMarkets().subscribe(
        (data: Market[]) => {
          console.log('Fetched markets:', data); // Debugging line
          this.markets = data;
          this.filteredMarkets = data;  // Initialize filtered markets

          this.markets.forEach(market => {
            this.marketService.getMarketDetailsById(market.id!).subscribe(
              (details: MarketDetails) => {
                market.marketSubGroups = details.marketSubGroups;
                market.region = this.regionsMap[market.region] || market.region;
                market.subRegion = this.subRegionsMap[market.subRegion] || market.subRegion;
              },
              (error) => {
                console.error('Error fetching market details:', error);
              }
            );
          });
        },
        (error) => {
          console.error('Error fetching markets:', error);
        }
      );
    }
  //Filters the list of markets based on the search text entered by the user.
  filterMarkets() {
    if (this.searchText) {
      this.filteredMarkets = this.markets.filter(market => 
        market.longMarketCode.toLowerCase().startsWith(this.searchText.toLowerCase()) ||
        market.code.toLowerCase().startsWith(this.searchText.toLowerCase()) ||
        market.name.toLowerCase().startsWith(this.searchText.toLowerCase())
      );
    } else {
      this.filteredMarkets = this.markets; 
    }
  }
  //Clears the current search filter and resets the market list.
  clearFilter() {
    this.searchText = ''; 
    this.filterMarkets(); 
  }
  //Retrieve the sub group code for displaying it in the market list.
  getSubgroupCode(market: Market): string {
    return market.marketSubGroups ? market.marketSubGroups.map(subgroup => subgroup.subGroupCode).join(' ') : '';
  }

    // Helper method to check if the current subgroup is the last one
  isLast(subGroup: MarketSubgroup, subGroups: MarketSubgroup[]): boolean {
    return subGroups.indexOf(subGroup) === subGroups.length - 1;
  }
}