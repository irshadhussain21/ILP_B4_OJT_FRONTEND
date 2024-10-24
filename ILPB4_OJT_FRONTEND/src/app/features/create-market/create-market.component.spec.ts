import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CreateMarketComponent } from './create-market.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router'
import { MarketSubgroup } from '../../core/models/market';

// Mock TranslateLoader
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('CreateMarketComponent', () => {
  let component: CreateMarketComponent;
  let fixture: ComponentFixture<CreateMarketComponent>;
  let mockMarketService: jest.Mocked<MarketService>;
  let mockRegionService: jest.Mocked<RegionService>;

  let mockRouter: Router;
  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(), // Mock the navigate method
    } as unknown as Router;
    mockMarketService = {
      createMarket: jest.fn().mockReturnValue(of(1)), 
      updateMarket: jest.fn().mockReturnValue(of({})),
      checkMarketCodeExists: jest.fn().mockReturnValue(of(false)),
      checkMarketNameExists: jest.fn().mockReturnValue(of(false)),
      getMarketDetailsById: jest.fn().mockReturnValue(
        of({
          id: 1,
          name: 'Market 1',
          code: 'M1',
          longMarketCode: 'L-M1.AA.AA',
          region: 'Region 1',
          subRegion: 'Subregion 1',
          marketSubGroups: [],
        })
      ),
    } as unknown as jest.Mocked<MarketService>;

    mockRegionService = {
      getAllRegions: jest
        .fn()
        .mockReturnValue(of([{ key: 1, value: 'Region 1' }])),
      getSubRegionsByRegion: jest
        .fn()
        .mockReturnValue(of([{ key: 1, value: 'Subregion 1' }])),
    } as unknown as jest.Mocked<RegionService>;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        RadioButtonModule,
        ToastModule,
        InputMaskModule,
        ConfirmDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        CreateMarketComponent,
      ],
      providers: [
        provideHttpClient(),

        provideRouter([]),
        { provide: MarketService, useValue: mockMarketService },
        { provide: RegionService, useValue: mockRegionService },
        MessageService,
        ConfirmationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMarketComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    component.ngOnInit();
    expect(component.marketForm).toBeDefined();
    expect(component.marketForm.controls['marketName'].value).toBe('');
    expect(component.marketForm.controls['marketCode'].value).toBe('');
  });

  it('should mark form as invalid if required fields are missing', () => {
    component.marketForm.controls['marketName'].setValue('');
    component.marketForm.controls['marketCode'].setValue('');
    component.marketForm.controls['region'].setValue(null);

    expect(component.marketForm.invalid).toBe(true);
    expect(
      component.marketForm.controls['marketName'].hasError('required')
    ).toBe(true);
    expect(
      component.marketForm.controls['marketCode'].hasError('required')
    ).toBe(true);
    expect(component.marketForm.controls['region'].hasError('required')).toBe(
      true
    );
  });

  it('should validate the form correctly', () => {
    component.ngOnInit();

    // Initially form should be invalid
    expect(component.marketForm.valid).toBeFalsy();

    // Set all required fields
    component.marketForm.patchValue({
      marketName: 'Test Market',
      marketCode: 'TM',
      longCode: 'L-TM.AA.AA',
      region: 'Region 1',
      subregion: 'Subregion 1',
    });

    // Form should now be valid
    expect(component.marketForm.valid).toBeTruthy();

    // Check individual field validations
    const marketCode = component.marketForm.get('marketCode');
    marketCode?.setValue('');
    expect(marketCode?.errors?.['required']).toBeTruthy();

    marketCode?.setValue('TMM'); // Too long
    expect(marketCode?.errors?.['maxlength']).toBeTruthy();

    marketCode?.setValue('T'); // Too short
    expect(marketCode?.errors?.['minlength']).toBeTruthy();
  });

  it('should restrict input in marketCode field to alphabetic characters', () => {
    const event = { key: '1', preventDefault: jest.fn() } as any;
    component.onMarketCodeInput(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should submit the form when valid (create mode)', fakeAsync(() => {
    // Initialize the form first
    component.ngOnInit();

    // Set not edit mode
    component.isEditMode = false;

    // Set form values using the correct control names
    component.marketForm.patchValue({
      marketName: 'Test Market',
      marketCode: 'TM',
      longCode: 'L-TM.AA.AA',
      region: 'Region 1',
      subregion: 'Subregion 1',
    });

    // Mark all fields as touched to trigger validation
    component.isMarketFormValid = true;

    // Set subgroups
    component.subGroups = [];

    // Trigger change detection
    fixture.detectChanges();

    // Log form state for debugging
    console.log('Form valid?', component.marketForm.valid);
    console.log('Form values:', component.marketForm.value);
    console.log('Form errors:', component.marketForm.errors);

    // Call onSubmit method
    component.onSubmit();
    tick(); // Simulate async passage of time

    // Check that createMarket was called with the correct transformed data
    expect(mockMarketService.createMarket).toHaveBeenCalledWith({
      name: 'Test Market',
      code: 'TM',
      longMarketCode: 'L-TM.AA.AA',
      region: 'Region 1',
      subRegion: 'Subregion 1',
      marketSubGroups: [],
    });

    // Verify that createMarket service is called once
    expect(mockMarketService.createMarket).toHaveBeenCalledTimes(1);
  }));

  it('should load subregions when onRegionSelect is called', fakeAsync(() => {
    const regionId = 1;
    const mockSubregions = [{ key: 1, value: 'Subregion 1' }];

    // Use the mocked RegionService instead of HTTP request
    component.onRegionSelect(regionId);
    tick();

    expect(mockRegionService.getSubRegionsByRegion).toHaveBeenCalledWith(
      regionId
    );
    expect(component.selectedRegion).toBe(regionId);

    // Verify the subregions are set correctly when the service responds
    mockRegionService.getSubRegionsByRegion(regionId).subscribe((response) => {
      expect(response).toEqual(mockSubregions);
      expect(component.subregions).toEqual(mockSubregions);
    });
  }));

  it('should call checkMarketCodeExists on market code change', fakeAsync(() => {
    component.hasEditedCode = true;
    component.marketForm.get('marketCode')?.setValue('AA');
    tick(300);
    expect(mockMarketService.checkMarketCodeExists).toHaveBeenCalledWith('AA');
  }));

  it('should set code exists error if market code already exists', fakeAsync(() => {
    mockMarketService.checkMarketCodeExists.mockReturnValueOnce(of(true));
    component.hasEditedCode = true;
    component.marketForm.get('marketCode')?.setValue('AA');
    tick(300);
    expect(component.hasCodeExistsError).toBe(true);
    expect(component.marketForm.get('marketCode')?.errors?.['exists']).toBeTruthy();
  })); 

  it('should call checkMarketNameExists on market name change', fakeAsync(() => {
    component.hasEditedName = true;
    component.marketForm.get('marketName')?.setValue('Market 1');
    tick(300);
    expect(mockMarketService.checkMarketNameExists).toHaveBeenCalledWith('Market 1');
  }));

  it('should set name exists error if market name already exists', fakeAsync(() => {
    mockMarketService.checkMarketNameExists.mockReturnValueOnce(of(true));
    component.hasEditedName = true;
    component.marketForm.get('marketName')?.setValue('Market 1');
    tick(300);
    expect(component.hasNameExistsError).toBe(true);
    expect(component.marketForm.get('marketName')?.errors?.['exists']).toBeTruthy();
  }));

  it('should update the market long code when region or market code changes', () => {
    component.marketForm.get('region')?.setValue(1);
    component.marketForm.get('marketCode')?.setValue('TM');
    component.updateLongCode();
    expect(component.marketForm.get('longCode')?.value).toBe('RXXXXTM'); // Based on mock region data
  }); 

  it('should handle subgroup changes correctly', () => {
    const mockSubgroups: MarketSubgroup[] = [
      {
        subGroupId: 1,
        subGroupName: 'SG1',
        subGroupCode: 'SG',
        marketCode: 'TM',
        isDeleted: false,
        isEdited: false,
      },
    ];
  
    component.onSubGroupsChanged({ subGroups: mockSubgroups });
  
    // Verify that the component's subGroups property is updated correctly
    expect(component.subGroups).toEqual(mockSubgroups);
  });
  

  beforeEach(() => {
    jest.clearAllMocks();
  });
});
