import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MarketService } from '../../services/market.service';
import { Market, MarketDetails } from '../../core/models/market';

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

  constructor(private marketService: MarketService) {}
  sortField: string = '';
  sortOrder: number = 1;

  onSort(event: any) {
      this.sortField = event.field;
      this.sortOrder = event.order;
  }

  ngOnInit() {
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

  filterMarkets() {
    if (this.searchText) {
      this.filteredMarkets = this.markets.filter(market => 
        market.longMarketCode.toLowerCase().startsWith(this.searchText.toLowerCase()) ||
        market.code.toLowerCase().startsWith(this.searchText.toLowerCase()) ||
        market.name.toLowerCase().startsWith(this.searchText.toLowerCase())
        // market.region.toLowerCase().includes(this.searchText.toLowerCase()) ||
        // market.subRegion.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredMarkets = this.markets;  // Show all markets if search text is empty
    }
  }
  clearFilter() {
    this.searchText = ''; // Clear the search text
    this.filterMarkets(); // Call the filter method to refresh the displayed markets
  }

  getSubgroupCode(market: Market): string {
    return market.marketSubGroups ? market.marketSubGroups.map(subgroup => subgroup.subGroupCode).join(' ') : '';
  }

}
