import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MarketService } from '../../services/market.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string = '';
  

  items: MenuItem[] = []; // Breadcrumb items
  home: MenuItem | undefined;


  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService
  ) {}

  ngOnInit() {
    // Try to get both possible route parameters
    const marketId = Number(this.route.snapshot.paramMap.get('marketId'));
    const editId = Number(this.route.snapshot.paramMap.get('id')); // For the /edit/:id route

    // Determine which ID is present and fetch the corresponding market
    const idToUse = marketId || editId;

    if (idToUse) {
      // Fetch market details using the service
      this.marketService.getMarketById(idToUse).subscribe((market) => {
        // Determine the correct URL based on the route
        const currentUrl = marketId
          ? `/marketlist/market/${marketId}`
          : `/marketlist/edit/${editId}`;

        // Set the breadcrumb items with the fetched market name
        this.items = [
          { label: 'Home', url: '/' },
          { label: 'Markets', url: '/marketlist' },
          { label: market.marketName, url: currentUrl }
        ];
      });
    } else {
      // Default breadcrumbs if no marketId or id is present
      this.items = [
        { label: 'Home', url: '/' },
        { label: 'Markets', url: '/marketlist' }
      ];
    }
  }
}
    
  

