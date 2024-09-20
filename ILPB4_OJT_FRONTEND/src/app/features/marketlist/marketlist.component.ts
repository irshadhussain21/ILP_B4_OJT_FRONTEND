import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

interface Market {
  code: string;
  name: string;
  subgroups: string[];
  country: string;
}

@Component({
  selector: 'app-marketlist',
  standalone: true,
  imports: [
    TableModule, 
    HttpClientModule, 
    InputTextModule, 
    TagModule
  ],
  templateUrl: './marketlist.component.html',
  styleUrls: ['./marketlist.component.css']
})
export class MarketlistComponent implements OnInit {
  markets!: Market[];
  selectedMarket!: Market;  // Updated type to Market

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
        code: 'MK001',
        name: 'North American Market',
        subgroups: ['Retail', 'Wholesale', 'Online'],
        country: 'USA'
      },
      {
        code: 'MK002',
        name: 'European Market',
        subgroups: ['Retail', 'Wholesale'],
        country: 'Germany'
      },
      {
        code: 'MK003',
        name: 'Asian Market',
        subgroups: ['Online', 'Export'],
        country: 'Japan'
      },
      {
        code: 'MK004',
        name: 'South American Market',
        subgroups: ['Retail', 'Export'],
        country: 'Brazil'
      }
    ];
  }

}
