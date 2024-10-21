import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewMarketDetailsComponent } from './view-market-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MarketService } from '../../services/market.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Market } from '../../core/models/market';

// Mock dependencies
const mockActivatedRoute = {
  snapshot: { paramMap: { get: jest.fn() } }
};

const mockMarketService = {
  getMarketById: jest.fn(),
  deleteMarket: jest.fn(),
};

const mockRouter = {
  navigate: jest.fn(),
};

const mockConfirmationService = {
  confirm: jest.fn(),
};

const mockMessageService = {
  add: jest.fn(),
};

const mockTranslateService = {
  instant: jest.fn().mockImplementation((key) => key),
  setDefaultLang: jest.fn(),
  use: jest.fn(),
};

describe('ViewMarketDetailsComponent', () => {
  let component: ViewMarketDetailsComponent;
  let fixture: ComponentFixture<ViewMarketDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewMarketDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MarketService, useValue: mockMarketService },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewMarketDetailsComponent);
    component = fixture.componentInstance;
  });

  // 1. Test for Component Initialization
  it('should initialize component and load market details', () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
    const marketDetails: Market = {
      id: 1,
      name: 'Antarctica',
      code: 'AA',
      longMarketCode: 'L-AQ.AA.AA',
      region: 'LAAPA',
      subRegion: 'Africa',
      marketSubGroups: [],
    };
    mockMarketService.getMarketById.mockReturnValue(of(marketDetails));

    component.ngOnInit();

    expect(component.marketId).toBe(1);
    expect(mockMarketService.getMarketById).toHaveBeenCalledWith(1);
    expect(component.marketDetails).toEqual(marketDetails);
  });

  // 2. Test for Missing Market ID
  it('should log an error if market ID is missing', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Market ID not found in the route');
  });

  // 3. Test for Combining Subgroup Details
  it('should combine subgroup details correctly', () => {
    const marketDetails: Market = {
      id: 1,
      name: 'Antarctica',
      code: 'AA',
      longMarketCode: 'L-AQ.AA.AA',
      region: 'LAAPA',
      subRegion: 'Africa',
      marketSubGroups: [
        {
            subGroupId: 1, subGroupName: 'Q-Island', subGroupCode: 'Q', marketCode: 'AA',
            isEdited: false,
            isDeleted: false
        },
        {
            subGroupId: 2, subGroupName: 'Ross Island', subGroupCode: 'R', marketCode: 'AA',
            isEdited: false,
            isDeleted: false
        },
      ],
    };

    const result = component['combineSubGroupDetails'](marketDetails);

    expect(result).toEqual(['AAQ - Q-Island', 'AAR - Ross Island']);
  });

  // 4. Test for Market Deletion Confirmation
  it('should open confirmation dialog when delete is triggered', () => {
    component.confirmDeleteMarket();

    expect(mockConfirmationService.confirm).toHaveBeenCalledWith(expect.objectContaining({
      message: 'PAGE.CONFIRM_DELETE_MESSAGE',
      header: 'PAGE.CONFIRM_DELETE_HEADER',
    }));
  });

  // 5. Test for Deleting a Market
  it('should delete market and navigate to market list on success', () => {
    component.marketId = 1;
    mockMarketService.deleteMarket.mockReturnValue(of(null));

    component['deleteMarket']();

    expect(mockMarketService.deleteMarket).toHaveBeenCalledWith(1);
    expect(mockMessageService.add).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: 'PAGE.SUCCESS',
    }));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/markets']);
  });

  // 6. Test for Handling Market Deletion Error
  it('should log an error if market deletion fails', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    component.marketId = 1;
    mockMarketService.deleteMarket.mockReturnValue(throwError(() => new Error('Error')));

    component['deleteMarket']();

    expect(console.error).toHaveBeenCalledWith('Error deleting market:', expect.any(Error));
  });

  // 7. Test for Navigating to Edit Page
  it('should navigate to the edit page when market ID is defined', () => {
    component.marketId = 1;

    component.navigateToEdit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/markets/edit/1']);
  });

  // 8. Test for Navigating to Edit Page with Undefined Market ID
  it('should log an error if market ID is not defined when navigating to edit', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    component.marketId = undefined;

    component.navigateToEdit();

    expect(console.error).toHaveBeenCalledWith('Market ID is not defined');
  });
});
