import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewMarketDetailsComponent } from './view-market-details.component';
import { NgFor, CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../../shared/header/header.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MarketService } from '../../services/market.service';

// Mock TranslateLoader
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('ViewMarketDetailsComponent', () => {
  let component: ViewMarketDetailsComponent;
  let fixture: ComponentFixture<ViewMarketDetailsComponent>;
  let mockMarketService: jest.Mocked<MarketService>;
  let mockConfirmationService: jest.Mocked<ConfirmationService>;
  let mockMessageService: jest.Mocked<MessageService>;

  beforeEach(async () => {
    mockMarketService = {
      getMarketById: jest.fn().mockReturnValue(
        of({
          id: 1,
          name: 'Antarctica',
          code: 'AA',
          longMarketCode: 'L-AQ.AA.AA',
          region: 'LAAPA',
          subRegion: 'Africa',
          marketSubGroups: [
            { subGroupId: 1, subGroupName: 'Q-Island', subGroupCode: 'Q' },
          ],
        })
      ),
      deleteMarket: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<MarketService>;

    mockConfirmationService = {
      confirm: jest.fn().mockImplementation((options: any) => options.accept()),
    } as unknown as jest.Mocked<ConfirmationService>;

    mockMessageService = {
      add: jest.fn(),
    } as unknown as jest.Mocked<MessageService>;

    await TestBed.configureTestingModule({
      imports: [
        ViewMarketDetailsComponent,
        CardModule,
        PanelModule,
        TagModule,
        ChipModule,
        MenuModule,
        ButtonModule,
        HeaderComponent,
        NgFor,
        CommonModule,
        ConfirmDialogModule,
        ToastModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: MarketService, useValue: mockMarketService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewMarketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load market details on init', fakeAsync(() => {
    component.marketId = 1;
    component.ngOnInit();
    tick();
    expect(mockMarketService.getMarketById).toHaveBeenCalledWith(1);
    expect(component.marketDetails?.name).toBe('Antarctica');
    expect(component.marketDetails?.code).toBe('AA');
  }));

  it('should combine subgroups correctly', () => {
    const combinedSubGroups = component.combineSubGroupDetails({
      id: 1,
      name: 'Antarctica',
      code: 'AA',
      longMarketCode: 'L-AQ.AA.AA',
      region: 'LAAPA',
      subRegion: 'Africa',
      marketSubGroups: [
        {
          subGroupId: 1, subGroupName: 'Q-Island', subGroupCode: 'Q',
          marketCode: '',
          isEdited: false,
          isDeleted: false
        },
      ],
    });

    expect(combinedSubGroups).toEqual(['AAQ - Q-Island']);
  });

  it('should navigate to edit page when navigateToEdit is called', () => {
    const navigateSpy = jest.spyOn(component['router'], 'navigate');
    component.marketId = 1;
    component.navigateToEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/markets/edit/1']);
  });

  it('should display success message when market is deleted', fakeAsync(() => {
    component.marketId = 1;
    component.confirmDeleteMarket();
    tick();

    expect(mockMarketService.deleteMarket).toHaveBeenCalledWith(1);
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: expect.any(String),
    });
  }));

  it('should handle delete confirmation rejection', () => {
    const rejectSpy = jest.fn();
    mockConfirmationService.confirm = jest.fn().mockImplementation(({ reject }) => rejectSpy());

    component.confirmDeleteMarket();
    expect(rejectSpy).toHaveBeenCalled();
  });

  it('should handle error during market deletion', fakeAsync(() => {
    mockMarketService.deleteMarket = jest.fn().mockReturnValue(throwError('Error deleting market'));
    component.marketId = 1;
    component.confirmDeleteMarket();
    tick();

    expect(mockMarketService.deleteMarket).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith('Error deleting market:', 'Error deleting market');
  }));

  it('should set up menu items correctly', fakeAsync(() => {
    component.marketId = 1;
    component.ngOnInit();
    tick();

    component.setupMenuItems();
    expect(component.items.length).toBeGreaterThan(0);
    

  }));

  it('should handle missing market ID in route', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    component.marketId = undefined;
    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Market ID not found in the route');
  });

  it('should log an error if market ID is not in route on init', () => {
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Market ID not found in the route');
  });

  it('should handle error when fetching market details fails', fakeAsync(() => {
    mockMarketService.getMarketById.mockReturnValue(throwError('Failed to fetch market details'));
    component.marketId = 1;
    component.loadMarketDetails();
    tick();

    expect(console.error).toHaveBeenCalledWith('Failed to fetch market details', 'Failed to fetch market details');
  }));
  it('should not delete market if delete confirmation is rejected', () => {
    mockConfirmationService.confirm = jest.fn().mockImplementation(({ reject }) => reject());

    component.confirmDeleteMarket();
    expect(console.error).not.toHaveBeenCalledWith('Error deleting market:');
    expect(mockMarketService.deleteMarket).not.toHaveBeenCalled();
  });
  it('should log an error if deleteMarket fails', fakeAsync(() => {
    mockMarketService.deleteMarket.mockReturnValue(throwError('Delete error'));
    component.marketId = 1;
    component.deleteMarket();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error deleting market:', 'Delete error');
  }));
  
  it('should disable Delete button if market has subgroups', () => {
    component.marketDetails = {
      name: 'Test Market',
      code: 'TM',
      longMarketCode: 'L-TM.TM.TM',
      region: 'Test Region',
      subRegion: 'Test SubRegion',
      id: 1,
      marketSubGroups: [
        {
          subGroupId: 1,
          subGroupName: 'Subgroup',
          subGroupCode: 'SG',
          marketCode: 'TM',
          isEdited: false,
          isDeleted: false
        }
      ]
    };
  
    component.setupMenuItems();
  
    
    expect(component.items?.[0]?.items?.[0]?.disabled).toBeTruthy();
  });
  

});
