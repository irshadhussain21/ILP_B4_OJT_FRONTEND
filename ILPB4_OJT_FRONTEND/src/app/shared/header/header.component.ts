import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { MarketService } from '../../services/market.service';

/**
 * LLD
 * 
 * This component is used to display the header and breadcrumb navigation.
 * 
 * Execution Flow:
 *  - On initialization, the market ID or edit ID is fetched from the route parameters.
 *  - The `MarketService` is used to fetch the market details based on the retrieved ID.
 *  - The breadcrumb items are dynamically updated to reflect the current page's hierarchy.
 * 
 * 
**/

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string = '';
  

  items: MenuItem[] = []; 
  home: MenuItem | undefined;


  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService
  ) {}

  ngOnInit() {
    const marketId = Number(this.route.snapshot.paramMap.get('marketId'));
    const editId = Number(this.route.snapshot.paramMap.get('id')); 
    const idToUse = marketId || editId;

    if (idToUse) {
      this.marketService.getMarketById(idToUse).subscribe((market) => {
        const currentUrl = marketId
          ? `/markets/${marketId}`
          : `/markets/edit/${editId}`;
        this.items = [
          { label: 'Home', url: '/' },
          { label: 'Markets', url: '/market' },
          { label: market.name, url: currentUrl }
        ];
      });
    } else {
      this.items = [
        { label: 'Home', url: '/' },
        { label: 'Markets', url: '/markets' }
      ];
    }
  }
}
    
  
