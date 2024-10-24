import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketlistComponent } from './market-list.component';
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { of } from 'rxjs';

// Mock services
class MockMarketService {
  getAllMarkets() {
    return of({
      markets: [{ id: 1, name: 'Test Market', code: 'TM', longMarketCode: 'L-TM.AA.AA', region: 'EURO', subRegion: 'SubRegion 1', marketSubGroups: [] }],
      totalCount: 1
    });
  }
}

class MockRegionService {
  getRegions() {
    return of([]);
  }
}

describe('MarketlistComponent', () => {
  let component: MarketlistComponent;
  let fixture: ComponentFixture<MarketlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketlistComponent],
      providers: [
        { provide: MarketService, useClass: MockMarketService },
        { provide: RegionService, useClass: MockRegionService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load markets on init', () => {
    component.ngOnInit();
    expect(component.markets.length).toBe(1);
    expect(component.totalMarkets).toBe(1);
  });

  it('should filter markets', () => {
    component.searchText = 'Test Market';
    component.filterMarkets();
    expect(component.filteredMarkets.length).toBe(1);
  });

  it('should clear filter', () => {
    component.clearFilter();
    expect(component.searchText).toBe('');
    expect(component.filteredMarkets.length).toBe(1); // Assuming loadMarkets fetches the initial market
  });
});
