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
import { of, throwError } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router'
import { MarketSubgroup } from '../../core/models/market';
import { CreateMarketConfig } from '../../config/market';

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

    const mockConfirmationService = {
      confirm: jest.fn((confirmation: any) => {
        if (confirmation.accept) {
          confirmation.accept(); // Simulate the user clicking 'accept'
        }
        return confirmation; // Return the confirmation object to satisfy the type
      }),
    };
    
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
        { provide: ConfirmationService, useValue: mockConfirmationService },
        MessageService,
       
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

  it('should reset the form on resetForm call', () => {
    component.marketForm.patchValue({
      marketName: 'Test Market',
      marketCode: 'TM',
      longCode: 'L-TM.AA.AA',
      region: 'Region 1',
      subregion: 'Subregion 1',
    });
  
    component.marketForm.reset();
  
    expect(component.marketForm.value).toEqual({
      marketName: '',
      marketCode: '',
      longCodeMiddle: '',
      region: '',
      subregion: '',
    });
  });
  
  it('should call initializeForm and loadRegions on ngOnInit', () => {
    jest.spyOn(component, 'initializeForm');
    jest.spyOn(component, 'loadRegions');
  
    component.ngOnInit();
  
    expect(component.initializeForm).toHaveBeenCalled();
    expect(component.loadRegions).toHaveBeenCalled();
  });
   
  it('should not set invalidEditMode error when not in edit mode', () => {
    component.isEditMode = false;
    component.initializeForm();
  
    expect(component.marketForm.errors?.['invalidEditMode']).toBeFalsy();
  });
  it('should submit the form when valid (edit mode)', fakeAsync(() => {
    component.isEditMode = true;
    component.marketId = 1;
  
    component.marketForm.patchValue({
      marketName: 'Updated Market',
      marketCode: 'UM',
      longCodeMiddle: 'L-UM.AA.AA',
      region: 'Region 1',
      subregion: 'Subregion 1',
    });
  
    component.isMarketFormValid = true;
    component.subGroups = [];
  
    fixture.detectChanges();
  
    component.onSubmit();
    tick(); // Simulate async passage of time
  
    expect(mockMarketService.updateMarket).toHaveBeenCalledWith(1, {
      name: 'UPDATED MARKET',
      code: 'UM',
      longMarketCode: 'L-UM.AA.AA',
      region: 'Region 1',
      subRegion: 'Subregion 1',
      marketSubGroups: [],
    });
    expect(mockMarketService.updateMarket).toHaveBeenCalledTimes(1);
  }));
  it('should call initializeForm, loadRegions, and setupFieldListeners on initialization', () => {
    const initializeFormSpy = jest.spyOn(component, 'initializeForm');
    const loadRegionsSpy = jest.spyOn(component, 'loadRegions');
    const setupFieldListenersSpy = jest.spyOn(component, 'setupFieldListeners');
  
    component.ngOnInit();
  
    expect(initializeFormSpy).toHaveBeenCalled();
    expect(loadRegionsSpy).toHaveBeenCalled();
    expect(setupFieldListenersSpy).toHaveBeenCalled();
  });
  it('should initialize the form with required controls and validators', () => {
    component.initializeForm();
  
    const marketNameControl = component.marketForm.get('marketName');
    const marketCodeControl = component.marketForm.get('marketCode');
    const longCodeMiddleControl = component.marketForm.get('longCodeMiddle');
    const regionControl = component.marketForm.get('region');
    const subregionControl = component.marketForm.get('subregion');
  
    expect(marketNameControl).toBeTruthy();
    expect(marketCodeControl).toBeTruthy();
    expect(longCodeMiddleControl).toBeTruthy();
    expect(regionControl).toBeTruthy();
    expect(subregionControl).toBeTruthy();
  
    expect(marketNameControl?.hasError('required')).toBe(true);
    expect(marketCodeControl?.hasError('required')).toBe(true);
  });
  
  it('should set to edit mode and fetch market data when marketId is present', () => {
    jest.spyOn(component, 'fetchMarketData');
    component.route.params = of({ id: 1 }); // Simulate route params
  
    component.getRoute();
  
    expect(component.isEditMode).toBe(true);
    expect(component.marketId).toBe(1);
    expect(component.title).toBe(CreateMarketConfig.TITLE_EDIT);
    expect(component.fetchMarketData).toHaveBeenCalledWith(1);
  }); 
  it('should update subregion form control on subregion change', () => {
    const subregionId = 1;
    component.onSubregionChange({}, subregionId);
  
    expect(component.selectedSubregion).toBe(subregionId.toString());
    expect(component.marketForm.get('subregion')?.value).toBe(subregionId);
  });
  
  // it('should reset the form and navigate back on cancel confirmation', fakeAsync(() => {
  //   jest.spyOn(component.confirmationService, 'confirm').mockImplementation((options) => {
  //     options.accept(); // Simulate user clicking 'accept'
  //   });
  
  //   component.onCancel();
  //   tick();
  
  //   expect(component.marketForm.value).toEqual({
  //     marketName: '',
  //     marketCode: '',
  //     longCodeMiddle: '',
  //     region: '',
  //     subregion: '',
  //   });
  //   expect(mockRouter.navigate).toHaveBeenCalledWith(['/markets', component.marketId]);
  // }));
  it('should clear form fields when a new region is selected in create mode', () => {
    component.isEditMode = false;
    component.marketForm.patchValue({
      marketName: 'Test Market',
      marketCode: 'TM',
      longCodeMiddle: 'L-TM',
    });
  
    component.onRegionSelect(1);
  
    expect(component.marketForm.get('marketName')?.value).toBe('');
    expect(component.marketForm.get('marketCode')?.value).toBe('');
    expect(component.marketForm.get('longCodeMiddle')?.value).toBe('');
  });
  
  it('should set form errors when subgroup errors are found', () => {
    component.onSubgroupErrorsFound(true);
    expect(component.marketForm.errors?.['subgroupErrors']).toBe(true);
  
    component.onSubgroupErrorsFound(false);
    expect(component.marketForm.errors?.['subgroupErrors']).toBeFalsy();
  });
  
   
  it('should format long code correctly', () => {
    const formattedCode = component.applyLongCodeFormat('LXXXXAAABBBCCC');
    expect(formattedCode).toBe('L-XX.AA.BB.CC');
  });
  
  it('should return the correct region name', () => {
    const regionName = component.getRegionNames(1);
    expect(regionName).toBe('Region 1'); // Based on mock data
  });
  
  it('should return the correct submit button text', () => {
    component.isEditMode = false;
    expect(component.getSubmitButtonText()).toBe('Create Market'); // Based on config
  
    component.isEditMode = true;
    expect(component.getSubmitButtonText()).toBe('Update Market'); // Based on config
  });
  
 
  it('should handle error in updateMarket method', fakeAsync(() => {
    mockMarketService.updateMarket.mockReturnValueOnce(of({ error: true }));
  
    component.updateMarket({
      name: 'Updated Market',
      code: 'UM',
      longMarketCode: 'L-UM.AA.AA',
      region: 'Region 1',
      subRegion: 'Subregion 1',
      marketSubGroups: [],
    });
  
    tick();
  
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error updating the market',
    });
  }));
  it('should handle error in createMarket method', fakeAsync(() => {
   
    // Mock an error response
    mockMarketService.createMarket.mockReturnValueOnce(throwError(() => new Error('Error creating market')));
    
  
    component.createMarket({
      name: 'Test Market',
      code: 'TM',
      longMarketCode: 'L-TM.AA.AA',
      region: 'Region 1',
      subRegion: 'Subregion 1',
      marketSubGroups: [],
    });
  
    tick();
  
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: component.translateService.instant(CreateMarketConfig.MESSAGES.ERROR_MESSAGES.CREATE),
    });
  })); 
  it('should return undefined for unknown region ID', () => {
    const regionName = component.getRegionNames(999); // Non-existent ID
    expect(regionName).toBeUndefined();
  });
  
  it('should not update firstLetterOfRegion if no region is selected', () => {
    component.marketForm.get('region')?.setValue(null);
    component.updateLongCode();
  
    expect(component.firstLetterOfRegion).toBe('');
  });
  
  it('should return an empty string when longCode format is invalid', () => {
    const formattedCode = component.applyLongCodeFormat('INVALIDFORMAT');
    expect(formattedCode).toBe('');
  });
  it('should prevent non-alphabetic input in marketCode field', () => {
    const event = { key: '1', preventDefault: jest.fn() } as any;
    component.onMarketCodeInput(event);
  
    expect(event.preventDefault).toHaveBeenCalled();
  });
  
  it('should initialize the component in create mode', () => {
    component.isEditMode = false; 
    component.ngOnInit();
  
    expect(component.marketForm).toBeDefined();
    expect(component.title).toBe(CreateMarketConfig.TITLE_CREATE);
    expect(component.isEditMode).toBe(false);
  });
  
  it('should initialize the component in edit mode', fakeAsync(() => {
    component.isEditMode = true;
    component.marketId = 1;
    component.ngOnInit();
  
    tick();
  
    expect(component.title).toBe(CreateMarketConfig.TITLE_EDIT);
    expect(component.isEditMode).toBe(true);
    expect(mockMarketService.getMarketDetailsById).toHaveBeenCalledWith(1);
  }));
  
  
  
  it('should call the confirmation dialog on cancel', () => {
    const confirmSpy = jest.spyOn(component.confirmationService, 'confirm');
  
    component.onCancel();
  
    // Check that the confirmation dialog was called
    expect(confirmSpy).toHaveBeenCalled();
  
    // Get the arguments passed to confirm
    const confirmArgs = confirmSpy.mock.calls[0][0];
  
    // Assert each property individually
    expect(confirmArgs.message).toBe(
      component.translateService.instant(
        CreateMarketConfig.MESSAGES.CONFIRM_MESSAGES.CONFIRM_CANCEL
      )
    );
    expect(confirmArgs.header).toBe('Confirmation');
    expect(confirmArgs.icon).toBe('pi pi-exclamation-triangle');
  });
  
  it('should reset the form and navigate on confirmation accept', () => {
    // Spy on form reset and router navigation
  
    const formResetSpy = jest.spyOn(component.marketForm, 'reset');
    const navigateSpy = jest.spyOn(component.router, 'navigate');
  
    // Call onCancel method
    component.onCancel();
    
    // Check if the form was reset
    expect(formResetSpy).toHaveBeenCalled();
  
    // Check if the router navigates to the correct URL
    expect(navigateSpy).toHaveBeenCalledWith(['/markets', component.marketId]);
  });
  

  beforeEach(() => {
    jest.clearAllMocks();
  });
});