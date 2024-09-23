import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tooltip, TooltipModule } from 'primeng/tooltip';

interface Market {
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
    HttpClientModule, 
    InputTextModule, 
    CommonModule,
    TooltipModule,
    TagModule,RouterLink,FormsModule
  ],
  templateUrl: './marketlist.component.html',
  styleUrls: ['./marketlist.component.css']
})
export class MarketlistComponent implements OnInit {
  markets!: Market[];
  filteredMarkets!: Market[];
  selectedMarket!: Market;  // Updated type to Market
  searchText: string = ''; 

  constructor() {}
  sortField: string = '';
  sortOrder: number = 1;

  onSort(event: any) {
      this.sortField = event.field;
      this.sortOrder = event.order;
  }

  ngOnInit() {
    this.markets = [
      {
        longcode:'L-ANL-ES',
        marketcode: 'MK001',
        name: 'North American Market',
        subgroups: ['Retail', 'Wholesale', 'Online'],
        region:'los angeles',
        subregion:'la',
        country: 'USA'
      },
      {
        longcode:'L-ANS-ES',
        marketcode: 'MK002',
        name: 'European Market',
        subgroups: ['Retail', 'Wholesale'],
        region:'los angeles',
        subregion:'la',
        country: 'Germany'
      },
      {
        longcode:'L-ANS-ES',
        marketcode: 'MK003',
        name: 'Asian Market',
        subgroups: ['Online', 'Export'],
        region:'los angeles',
        subregion:'la',
        country: 'Japan'
      },
      {
        longcode:'L-ANS-ES',
        marketcode: 'MK004',
        name: 'South American Market',
        subgroups: ['Retail', 'Export'],
        region:'los angeles',
        subregion:'la',
        country: 'Brazil'
      }
    ];
    this.filteredMarkets = this.markets;
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
