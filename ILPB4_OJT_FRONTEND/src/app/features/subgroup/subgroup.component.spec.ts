import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { SubgroupComponent } from './subgroup.component';
import { MarketSubgroupService } from '../../services/subgroup.service';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MarketSubgroup } from '../../core/models/market';
import { ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CreateMarketConfig } from '../../config/market';

class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('SubgroupComponent', () => {
  let component: SubgroupComponent;
  let fixture: ComponentFixture<SubgroupComponent>;
  let mockSubgroupService: jest.Mocked<MarketSubgroupService>;

  const testSubGroup: MarketSubgroup = {
    subGroupId: 1,
    subGroupName: 'TestName',
    subGroupCode: 'B',
    marketId: 1,
    marketCode: 'AA',
    isDeleted: false,
    isEdited: false,
  };

  beforeEach(async () => {
    // Mock MarketSubgroupService
    mockSubgroupService = {
      getSubgroups: jest.fn().mockReturnValue(
        of([
          {
            ...testSubGroup
          },
        ])
      ),
    } as unknown as jest.Mocked<MarketSubgroupService>;

    const mockConfirmationService = {
      confirm: jest.fn((confirmation: ConfirmationService) => {
        // Simulate user acceptance by emitting a value
        if (confirmation.accept) {
          confirmation.accept.subscribe(() => {
            // Simulate the user accepting
          });
        }
        return confirmation;
      }),
    };

    // Configure the testing module
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ConfirmDialogModule,
        TableModule,
        ButtonModule,
        InputGroupModule,
        InputTextModule,
        DividerModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        SubgroupComponent,
      ],

      providers: [
        provideHttpClient(),
        { provide: MarketSubgroupService, useValue: mockSubgroupService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.marketCode = 'AA';

    // Spies to monitor method calls in ngOnInit
    jest.spyOn(component, 'initializeForm');
    jest.spyOn(component, 'loadSubGroupsIfMarketIdExists');
    jest.spyOn(component, 'subscribeToFormChanges');
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call initializeForm, loadSubGroupsIfMarketIdExists, and subscribeToFormChanges on ngOnInit', () => {
      component.ngOnInit();

      expect(component.initializeForm).toHaveBeenCalled();
      expect(component.loadSubGroupsIfMarketIdExists).toHaveBeenCalled();
      expect(component.subscribeToFormChanges).toHaveBeenCalled();
    });

    it('should initialize the form with an empty rows array', () => {
      component.initializeForm();
      expect(component.form.contains('rows')).toBe(true);
      expect(component.rows.length).toBe(0);
    });
  });

  describe('Data Loading', () => {
    it('should load subgroups if marketId exists', () => {
      component.marketId = 1;
      const subGroups: MarketSubgroup[] = [{ ...testSubGroup }];
      mockSubgroupService.getSubgroups.mockReturnValue(of(subGroups));
  
      component.loadSubGroupsIfMarketIdExists();
  
      expect(mockSubgroupService.getSubgroups).toHaveBeenCalledWith(1);
      expect(component.showSubgroup).toBe(true);
      expect(component.rows.length).toBe(subGroups.length);
    });
  
    it('should set form controls based on subgroups data from service', () => {
      const subGroups: MarketSubgroup[] = [{ ...testSubGroup }];
      mockSubgroupService.getSubgroups.mockReturnValue(of(subGroups));
  
      component.loadSubGroups();
  
      expect(component.rows.length).toBe(1);
      expect(component.showSubgroup).toBe(true);
    });
  });
  


  describe('Form Behavior', () => {
    it('should emit valid subgroups on form value changes', fakeAsync(() => {
      const emitValidSubGroupsSpy = jest.spyOn(component, 'emitValidSubGroups');
      component.initializeForm();
      component.subscribeToFormChanges();

      component.rows.push(component.createRow({ ...testSubGroup }));

      component.form.updateValueAndValidity();
      tick(300);
      expect(emitValidSubGroupsSpy).toHaveBeenCalled();
    }));

    it('should emit isSubGroupFormInvalid with true when form status changes to INVALID', () => {
      const emitSpy = jest.spyOn(component.isSubGroupFormInvalid, 'emit');
      component.initializeForm();
      component.subscribeToFormChanges();

      component.rows.push(component.createRow({ ...testSubGroup, subGroupName: '' }));

      // Manually trigger form status evaluation
      component.form.updateValueAndValidity();

      // Assert that isSubGroupFormInvalid emitted with true
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should emit new valid subgroups and track dirty and invalid rows', () => {
      // Ensure marketCode is set before adding rows
      component.marketCode = 'AA';
      component.initializeForm();


      // Add rows: one valid and one invalid
      component.rows.push(component.createRow({ ...testSubGroup, subGroupName: 'Valid Group', subGroupId:null }));
      component.rows.push(component.createRow({ ...testSubGroup, subGroupName: '', subGroupId: null })); // Invalid row

      // Force update values and validity to reflect changes
      component.form.updateValueAndValidity();

      const emitSpy = jest.spyOn(component.subGroupsChanged, 'emit');
      component.emitValidSubGroups();

      // Assert emitted value: Only the valid row should be emitted
      expect(emitSpy).toHaveBeenCalledWith({
        subGroups: [
          {
            ...testSubGroup,
            subGroupName: 'Valid Group',
            subGroupId: null,
          },
        ],
        isDirty: false,
      });
    });
  });

  describe('ngOnChanges', () => {
    it('should update marketCode to uppercase when marketCode changes', () => {
      // Simulate `marketCode` change
      const changes: SimpleChanges = {
        marketCode: {
          currentValue: 'BB',
          previousValue: 'AA',
          firstChange: false,
          isFirstChange: () => false,
        },
      };

      // Call ngOnChanges with the simulated change
      component.ngOnChanges(changes);

      // Check if marketCode has been updated to uppercase
      expect(component.marketCode).toBe('BB');
    });

    it('should propagate updated marketCode to each row control', () => {
      // Set up initial form rows
      const row1 = component.createRow({
        ...testSubGroup,
        subGroupName: 'Test 1',
        subGroupCode: 'A',
      });
      const row2 = component.createRow({
        ...testSubGroup,
        subGroupName: 'Test 2',
        subGroupCode: 'B',
      });

      component.rows.controls.push(row1, row2);

      component.rows.updateValueAndValidity();

      // Update marketCode and trigger ngOnChanges
      component.marketCode = 'BB';
      component.rows.controls.forEach((row) => {
        row
          .get('marketCode')
          ?.setValue(component.marketCode, { emitEvent: false });
      });

      // Verify that each row's marketCode control is updated to the uppercase marketCode
      component.rows.controls.forEach((row) => {
        expect(row.get('marketCode')?.value).toBe('BB');
      });
    });
  });

  describe('FormGroup Creation and Initialization', () => {
    it('should create a FormGroup with the correct controls', () => {
      const rowFormGroup: FormGroup = component.createRow(testSubGroup);

      // Check that the FormGroup has the expected controls
      expect(rowFormGroup.contains('subGroupId')).toBe(true);
      expect(rowFormGroup.contains('marketId')).toBe(true);
      expect(rowFormGroup.contains('marketCode')).toBe(true);
      expect(rowFormGroup.contains('subGroupCode')).toBe(true);
      expect(rowFormGroup.contains('subGroupName')).toBe(true);
      expect(rowFormGroup.contains('isDeleted')).toBe(true);
      expect(rowFormGroup.contains('isEdited')).toBe(true);
    });

    it('should initialize FormGroup with correct values', () => {
      const rowFormGroup = component.createRow(testSubGroup);

      // Check initial values of the controls
      expect(rowFormGroup.get('subGroupId')?.value).toBe(1);
      expect(rowFormGroup.get('marketCode')?.value).toBe('AA');
      expect(rowFormGroup.get('subGroupCode')?.value).toBe('B');
      expect(rowFormGroup.get('subGroupName')?.value).toBe('TestName');
      expect(rowFormGroup.get('isDeleted')?.value).toBe(false);
      expect(rowFormGroup.get('isEdited')?.value).toBe(false);
    });
  });

  describe('Form Control Validators', () => {
    it('should apply required and pattern validators on subGroupCode control', () => {
      const rowFormGroup = component.createRow();
      const subGroupCodeControl = rowFormGroup.get(
        'subGroupCode'
      ) as FormControl;

      // Ensure control and validator exist
      expect(subGroupCodeControl).toBeDefined();
      expect(subGroupCodeControl.validator).toBeDefined();

      // Test required validator
      const requiredError = subGroupCodeControl.validator!({
        value: '',
      } as AbstractControl)?.['required'];
      expect(requiredError).toBeTruthy();

      // Test pattern validator
      const invalidPatternValue = '@';
      const patternError = subGroupCodeControl.validator!({
        value: invalidPatternValue,
      } as AbstractControl)?.['pattern'];
      expect(patternError).toEqual({
        requiredPattern:
          CreateMarketConfig.SUBGROUP_CODE_VALIDATION_REGEX.toString(),
        actualValue: invalidPatternValue,
      });
    });

    it('should apply the required validator to subGroupName control', () => {
      const rowFormGroup = component.createRow();
      const subGroupNameControl = rowFormGroup.get(
        'subGroupName'
      ) as FormControl;

      expect(subGroupNameControl).toBeDefined();
      expect(subGroupNameControl.validator).toBeDefined();

      const requiredError = subGroupNameControl.validator!({
        value: '',
      } as AbstractControl)?.['required'];
      expect(requiredError).toBeTruthy();
    });
  });

  describe('Validator Tests', () => {
    it('should apply duplicate validators to subGroup form', () => {
      const row1 = component.createRow({ ...testSubGroup });
      const row2 = component.createRow({ ...testSubGroup });

      fixture.detectChanges();

      setTimeout(() => {
        component.rows.updateValueAndValidity();

        expect(row1.hasError('duplicateSubgroupName')).toBeTruthy();
        expect(row1.hasError('duplicateSubgroupCode')).toBeTruthy();
        expect(row2.hasError('duplicateSubgroupCode')).toBeTruthy();
        expect(row2.hasError('duplicateSubgroupName')).toBeTruthy();
      }, 0);
    });

    it('should not apply duplicate error if one subgroup is marked as deleted', () => {
      const row1 = component.createRow({ ...testSubGroup, isDeleted: true });
      const row2 = component.createRow({ ...testSubGroup });
      component.rows.controls.push(row1, row2);

      component.rows.updateValueAndValidity();

      expect(row1.hasError('duplicateSubgroupCode')).toBeFalsy();
      expect(row1.hasError('duplicateSubgroupName')).toBeFalsy();
      expect(row2.hasError('duplicateSubgroupCode')).toBeFalsy();
      expect(row2.hasError('duplicateSubgroupName')).toBeFalsy();
    });

    it('should not apply duplicate error for unique values', () => {
      const row1 = component.createRow({ ...testSubGroup, subGroupCode: 'A' });
      const row2 = component.createRow({ ...testSubGroup });

      component.rows.controls.push(row1, row2);

      component.rows.updateValueAndValidity();

      expect(row1.hasError('duplicateSubgroupCode')).toBeFalsy();
      expect(row1.hasError('duplicateSubgroupName')).toBeFalsy();
      expect(row2.hasError('duplicateSubgroupCode')).toBeFalsy();
      expect(row2.hasError('duplicateSubgroupName')).toBeFalsy();
    });
  });
});
