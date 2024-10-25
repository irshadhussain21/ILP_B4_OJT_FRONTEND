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
import { of } from 'rxjs';
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
            {
              subGroupId: 1, subGroupName: 'Q-Island', subGroupCode: 'Q',
              marketCode: '',
              isEdited: false,
              isDeleted: false
            },
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

  // it('should load market details on init', fakeAsync(() => {
  //   component.ngOnInit();
  //   tick();

  //   expect(mockMarketService.getMarketById).toHaveBeenCalledWith(1);
  //   expect(component.marketDetails?.name).toBe('Antarctica');
  //   expect(component.marketDetails?.code).toBe('AA');
  // }));

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

  // it('should delete market when confirmed', fakeAsync(() => {
  //   component.marketId = 1;
  //   component.confirmDeleteMarket();
  //   tick();

  //   expect(mockMarketService.deleteMarket).toHaveBeenCalledWith(1);
  //   expect(mockMessageService.add).toHaveBeenCalledWith({
  //     severity: 'success',
  //     summary: 'Success',
  //     detail: 'Market Antarctica deleted successfully.',
  //   });
  // }));
});
