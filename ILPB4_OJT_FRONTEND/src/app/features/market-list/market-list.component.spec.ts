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
    // Arrange: Set initial values for searchText, selectedRegions, and first
    component.searchText = 'Market';
    component.selectedRegions = ['Region 1', 'Region 2'];
    component.first = 5; // Assume 5 to simulate pagination not at the start
  
    // Act: Call clearFilter method
    component.clearFilter();
  
    // Assert: Verify that searchText, selectedRegions, and first are reset
    expect(component.searchText).toBe('');
    expect(component.selectedRegions).toEqual([]);
    expect(component.first).toBe(0);
  });
  
  it('should handle page change and update first value correctly', () => {
    // Arrange: Set initial page values
    component.first = 0; // Assume first is 0 initially
    component.selectedRowsPerPage = 10;
  
    // Act: Simulate a page change
    component.onPageChange({ first: 10, rows: 10 });
  
    // Assert: Verify that first value is updated to 10
    expect(component.first).toBe(10);
  });

  it('should sort the markets correctly based on the provided sort field', () => {
    // Arrange: Set initial markets
    component.markets = [
      { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
      { id: 2, name: 'Market 2', code: 'M2', longMarketCode: 'L-M2.AA.AA', region: 'Region 2', subRegion: 'Subregion 2', marketSubGroups: [] },
    ];
  
    // Act: Call the onSort method with a sort field (e.g., sort by name)
    component.onSort({ field: 'name', order: 1 });
  
    // Assert: Check that markets are sorted by name in ascending order
    expect(component.markets[0].name).toBe('Market 1');
    expect(component.markets[1].name).toBe('Market 2');
  });
  
  it('should filter markets correctly when multiple regions are selected', () => {
    // Arrange: Set initial values
    component.markets = [
      { id: 1, name: 'Market 1', code: 'M1', longMarketCode: 'L-M1.AA.AA', region: 'Region 1', subRegion: 'Subregion 1', marketSubGroups: [] },
      { id: 2, name: 'Market 2', code: 'M2', longMarketCode: 'L-M2.AA.AA', region: 'Region 2', subRegion: 'Subregion 2', marketSubGroups: [] },
      { id: 3, name: 'Market 3', code: 'M3', longMarketCode: 'L-M3.AA.AA', region: 'Region 1', subRegion: 'Subregion 3', marketSubGroups: [] },
    ];
    component.selectedRegions = [
      { value: 'Region 1' }, 
      { value: 'Region 2' }
    ]; // Multiple regions selected, ensuring the structure matches
  
    // Mock the loadMarkets method to avoid real API calls
    const loadMarketsSpy = jest.spyOn(component, 'loadMarkets').mockImplementation(() => {});
  
    // Act: Call the filterMarketsByRegion method
    component.filterMarketsByRegion();
  
    // Assert: Ensure loadMarkets was called with the correct parameters
    expect(loadMarketsSpy).toHaveBeenCalledWith(
      1, // page number
      component.selectedRowsPerPage, // selected rows per page
      component.searchText, // search text
      'Region 1,Region 2' // the joined regions
    );
    
    // Assert: If selected regions are empty, filteredMarkets should be assigned all markets
    component.selectedRegions = []; // No regions selected
    component.filterMarketsByRegion();
    expect(component.filteredMarkets).toEqual(component.markets); // All markets should be shown
  });
  

  it('should handle empty searchText and load all markets', () => {
    // Arrange: Set searchText to an empty string
    component.searchText = '';
  
    // Mock the loadMarkets method to simulate an empty search
    jest.spyOn(component, 'loadMarkets');
  
    // Act: Call the filterMarkets method
    component.filterMarkets();
  
    // Assert: Verify that loadMarkets is called to load all markets with an empty search text
    expect(component.loadMarkets).toHaveBeenCalledWith(1, component.selectedRowsPerPage, '');
  });

  it('should transform region enum correctly in the template', () => {
    // Arrange: Set initial values
    component.markets = [
      {
        id: 1, name: 'Market 1', region: 'R1',
        code: '',
        longMarketCode: '',
        subRegion: ''
      }, // Use region codes as in RegionEnum
      {
        id: 2, name: 'Market 2', region: 'R2',
        code: '',
        longMarketCode: '',
        subRegion: ''
      }
    ];
  
    // Act: Trigger change detection to reflect the transformation
    fixture.detectChanges();
  
    // Assert: Check if the region names are transformed correctly using getRegions
    const regionElements = fixture.nativeElement.querySelectorAll('.market-region');
    expect(regionElements[0].textContent).toBe('Full Form of Region 1');  // Transformed value for R1
    expect(regionElements[1].textContent).toBe('Full Form of Region 2');  // Transformed value for R2
  });
  
  it('should clear searchText, reset pagination, and call filterMarkets on clearFilter', () => {
    // Arrange: Set initial values
    component.searchText = 'some text'; // Set an initial search text
    component.first = 10; // Set a non-zero page number to simulate pagination
  
    // Mock the filterMarkets method to check if it gets called
    jest.spyOn(component, 'filterMarkets'); 
  
    // Act: Call the clearFilter method
    component.clearFilter();
  
    // Assert: Check that searchText is cleared
    expect(component.searchText).toBe(''); 
  
    // Assert: Check that first (pagination) is reset to 0
    expect(component.first).toBe(0); 
  
    // Assert: Check that filterMarkets was called
    expect(component.filterMarkets).toHaveBeenCalled(); 
  });
  
});
