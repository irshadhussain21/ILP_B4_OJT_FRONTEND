import { Component, Input, OnInit } from '@angular/core';
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
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { HeaderComponent } from "../../shared/header/header.component";

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
    HeaderComponent
],
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.css']
})
export class MarketlistComponent implements OnInit {

@Input() title: string = '';
handleSelectionChange() {
  console.log('Selected Cities:', this.selectedRegions);
}
onRegionChange() {
throw new Error('Method not implemented.');
}
clearAll() {
  this.selectedRegions = [];  
}
removeRegion(region: any) {
  this.selectedRegions = this.selectedRegions.filter(selected => selected.value !== region.value);
}

  markets!: Market[];
  filteredMarkets!: Market[];
  selectedMarket!: Market;  
  searchText: string = ''; 
  rows: number = 10; 
  first: number = 0;
  totalMarkets: number = 0; 
  rowsPerPageOptions = [10, 25, 50, 75, 100];
  selectedRowsPerPage: number = this.rows;
  regions: any[];
  selectedRegions: any[] = [];
 

  constructor(private marketService: MarketService, private regionService: RegionService) {
    this.regions = [
      { label: 'EURO - Europe', value: 'EURO' },
      { label: 'LAAPA - Latin America, Asia Pacific and Africa', value: 'LAAPA' },
      { label: 'NOAM - North America', value: 'NOAM' }
    ];
  }
  sortField: string = '';
  sortOrder: number = 1;

  regionsMap: { [key: string]: string } = {}; 
  subRegionsMap: { [key: string]: string } = {}; 

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
          console.log('Fetched markets:', data); 
          this.markets = data;
          this.filteredMarkets = data;  

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
        this.marketService.searchMarkets(this.searchText).subscribe(
            (data: Market[]) => {
                this.filteredMarkets = data; 
            },
            (error) => {
                console.error('Error searching markets:', error); 
            }
        );
    } else {
        this.filteredMarkets = this.markets; 
    }
  }

  // Clear the search text
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


  onPageChange(event: any) {
    this.first = event.first; 
  }

  onRowsPerPageChange(event: any) {
    this.rows = event.value; 
    this.first = 0; 
  }
}