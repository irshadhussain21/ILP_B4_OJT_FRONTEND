import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketlistComponent } from './market-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MarketService } from '../../services/market.service';
import { waitForAsync } from '@angular/core/testing';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('MarketlistComponent', () => {
  let mockRouter: Router;
  let mockMarketService: jest.Mocked<MarketService>;
  let component: MarketlistComponent;
  let fixture: ComponentFixture<MarketlistComponent>;

  beforeEach(async () => {
    // Mock the MarketService
    mockMarketService = {
      getAllMarkets: jest.fn().mockReturnValue(of({
        markets: [
          {
            id: 1,
            name: 'Market 1',
            code: 'M1',
            longMarketCode: 'L-M1.AA.AA',
            region: 'Region 1',
            subRegion: 'Subregion 1',
            marketSubGroups: [],
          },
        ],
        totalCount: 1,
      })),
    } as unknown as jest.Mocked<MarketService>;

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as Router;

    // Mock the ActivatedRoute
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockImplementation((key: string) => {
            if (key === 'marketId') return '1';
            if (key === 'id') return null;
            return null;
          }),
        },
      },
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TableModule,
        DropdownModule,
        MultiSelectModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        MarketlistComponent,
      ],
      providers: [
        provideHttpClient(),
        { provide: ConfirmationService, useValue: { confirm: jest.fn() } },
        MessageService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MarketlistComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the MarketlistComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should clear searchText and call filterMarkets on clearFilter', () => {
    // Arrange: Set initial values
    component.searchText = 'some text'; // Set an initial search text

    // Mock the filterMarkets method to check if it gets called
    jest.spyOn(component, 'filterMarkets'); 

    // Act: Call the clearFilter method
    component.clearFilter();

    // Assert: Check that searchText is cleared
    expect(component.searchText).toBe(''); 

    // Assert: Check that filterMarkets was called
    expect(component.filterMarkets).toHaveBeenCalled(); 
  });

  describe('clearAll', () => {
    beforeEach(() => {
      // Arrange: Set up initial values
      component.selectedRegions = ['Region 1', 'Region 2']; // Set some initial selected regions
      component.markets = [ // Set initial markets
        { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
        { id: 2, name: 'Market 2', code: 'M2', longMarketCode: 'L-M2.AA.AA', region: 'Region 2', subRegion: 'Subregion 2', marketSubGroups: [] },
      ];
      component.filteredMarkets = component.markets; // Initially, set filtered markets to all markets
      component.totalMarkets = component.markets.length; // Set initial totalMarkets
      component.first = 1; // Set initial first value
    });

    it('should clear selected regions and reset filtered markets and total count', () => {
      // Act: Call the clearAll method
      component.clearAll();

      // Assert: Check that selectedRegions is cleared
      expect(component.selectedRegions.length).toBe(0);

      // Assert: Check that filteredMarkets is reset to markets
      expect(component.filteredMarkets).toEqual(component.markets);

      // Assert: Check that totalMarkets is updated to the length of markets
      expect(component.totalMarkets).toBe(component.markets.length);

      // Assert: Check that first is reset to 0
      expect(component.first).toBe(0);
    });
  });

  it('should reset first and call loadMarkets with correct parameters on filterMarkets', () => {
    // Arrange: Set initial values for selectedRowsPerPage and searchText
    component.selectedRowsPerPage = 10; // Set a specific rows per page value
    component.searchText = 'example'; // Set an example search text

    // Mock the loadMarkets method to check if it gets called
    jest.spyOn(component, 'loadMarkets');

    // Act: Call the filterMarkets method
    component.filterMarkets();

    // Assert: Check that first is reset to 0
    expect(component.first).toBe(0);

    // Assert: Check that loadMarkets was called with the correct parameters
    expect(component.loadMarkets).toHaveBeenCalledWith(1, component.selectedRowsPerPage, component.searchText);
  });

  it('should load markets with correct parameters on loadMarkets', waitForAsync(() => {
    // Arrange: Set up any initial values required for loadMarkets
    const pageNo = 1;
    const rowsPerPage = 10;
    const searchText = 'Market 1';
  
    // Mock the getAllMarkets method of the MarketService to return a specific value
    mockMarketService.getAllMarkets.mockReturnValue(of({
      markets: [
        {
          id: 1,
          name: 'Market 1',
          code: 'M1',
          longMarketCode: 'L-M1.AA.AA',
          region: 'Region 1',
          subRegion: 'Subregion 1',
          marketSubGroups: [],
        },
      ],
      totalCount: 1,
    }));
  
    // Act: Call the loadMarkets method
    component.loadMarkets(pageNo, rowsPerPage, searchText);
  
    // Wait for async operations to complete
    fixture.whenStable().then(() => {
      // Assert: Check that the markets were loaded correctly
      expect(mockMarketService.getAllMarkets).toHaveBeenCalledWith(pageNo, rowsPerPage, searchText);
      expect(component.markets).toEqual([
        {
          id: 1,
          name: 'Market 1',
          code: 'M1',
          longMarketCode: 'L-M1.AA.AA',
          region: 'Region 1',
          subRegion: 'Subregion 1',
          marketSubGroups: [],
        },
      ]);
      expect(component.totalMarkets).toBe(1);
    });
  }));
  

  it('should handle empty market response correctly in loadMarkets', waitForAsync(() => {
    // Arrange: Set up initial values for loadMarkets
    const pageNo = 1;
    const rowsPerPage = 10;
    const searchText = 'Non-existent Market';
  
    // Mock the getAllMarkets method of the MarketService to return an empty response
    mockMarketService.getAllMarkets.mockReturnValue(of({
      markets: [],
      totalCount: 0,
    }));
  
    // Act: Call the loadMarkets method
    component.loadMarkets(pageNo, rowsPerPage, searchText);
  
    // Wait for async operations to complete
    fixture.whenStable().then(() => {
      // Assert: Check that markets are set to an empty array
      expect(component.markets).toEqual([]);
      // Assert: Check that totalMarkets is updated to 0
      expect(component.totalMarkets).toBe(0);
    });
  }));

  it('should filter markets based on selected regions', waitForAsync(() => {
    // Arrange: Set initial values
    component.markets = [
      { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
      { id: 2, name: 'Market 2', code: 'M2', longMarketCode: 'L-M2.AA.AA', region: 'Region 2', subRegion: 'Subregion 2', marketSubGroups: [] },
    ];
    component.selectedRegions = ['Region 1']; // Set selected regions for filtering
  
    // Act: Call the filterMarketsByRegion method
    component.filterMarketsByRegion();
  
    // Wait for any asynchronous operations if present
    fixture.whenStable().then(() => {
      // Assert: Check that filteredMarkets only contains the markets from selectedRegions
      expect(component.filteredMarkets).toEqual([
        { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
      ]);
    });
  }));

  it('should not filter markets if no regions are selected', () => {
    // Arrange: Set initial markets
    component.markets = [
      { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
      { id: 2, name: 'Market 2', code: 'M2', longMarketCode: 'L-M2.AA.AA', region: 'Region 2', subRegion: 'Subregion 2', marketSubGroups: [] },
    ];
    component.selectedRegions = []; // No selected regions

    // Act: Call the filterMarketsByRegion method
    component.filterMarketsByRegion();

    // Assert: Check that filteredMarkets still contains all markets
    expect(component.filteredMarkets).toEqual(component.markets);
  });
  
  it('should reset filters and pagination on clearFilter', () => {
    // Arrange: Set initial values for searchText and selectedRegions
    component.searchText = 'Market';
    component.selectedRegions = ['Region 1', 'Region 2'];

    // Act: Call clearFilter method
    component.clearFilter();

    // Assert: Verify that searchText and selectedRegions are reset
    expect(component.searchText).toBe('');
    expect(component.selectedRegions).toEqual([]);
    expect(component.first).toBe(0);
  });
  it('should filter markets by selected region', () => {
    // Arrange: Define markets and selected region
    component.markets = [
      { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
      { id: 2, name: 'Market 2', code: 'M2', longMarketCode: 'L-M2.AA.AA', region: 'Region 2', subRegion: 'Subregion 2', marketSubGroups: [] },
    ];
    component.selectedRegions = ['Region 1'];

    // Act: Call the filterByRegion method
    component.filterByRegion();

    // Assert: Verify that only markets in 'Region 1' are in filteredMarkets
    expect(component.filteredMarkets).toEqual([
      { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
    ]);
  });


});
