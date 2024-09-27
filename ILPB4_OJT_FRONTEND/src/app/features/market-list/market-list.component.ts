import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MarketlistService } from '../../services/marketlist.service';

export interface Market {
  longcode: string;
  marketcode: string;
  name: string;
  subgroups: string[];
  region: string;
  subregion: string;
  country: string;
}

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
  selectedMarket!: Market;  // Updated type to Market
  searchText: string = ''; 

  constructor(private marketlistService: MarketlistService) {}
  sortField: string = '';
  sortOrder: number = 1;

  onSort(event: any) {
      this.sortField = event.field;
      this.sortOrder = event.order;
  }

  ngOnInit() {
      // Fetch markets from the backend
      this.marketlistService.getMarkets().subscribe(
        (data: Market[]) => {
          console.log('Fetched markets:', data); // Debugging line
          this.markets = data;
          this.filteredMarkets = data;  // Initialize filtered markets
        },
        (error) => {
          console.error('Error fetching markets:', error);
        }
      );
    }

  filterMarkets() {
    if (this.searchText) {
      this.filteredMarkets = this.markets.filter(market => 
        market.longcode.toLowerCase().includes(this.searchText.toLowerCase()) ||
        market.marketcode.toLowerCase().includes(this.searchText.toLowerCase()) ||
        market.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        market.region.toLowerCase().includes(this.searchText.toLowerCase()) ||
        market.subregion.toLowerCase().includes(this.searchText.toLowerCase()) ||
        market.country.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredMarkets = this.markets;  // Show all markets if search text is empty
    }
  }
  clearFilter() {
    this.searchText = ''; // Clear the search text
    this.filterMarkets(); // Call the filter method to refresh the displayed markets
}

}