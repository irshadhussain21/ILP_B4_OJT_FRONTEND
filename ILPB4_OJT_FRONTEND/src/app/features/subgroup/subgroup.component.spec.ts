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
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MarketSubgroup } from '../../core/models/market';
import {
  ChangeDetectorRef,
  Component,
  NO_ERRORS_SCHEMA,
  SimpleChanges,
} from '@angular/core';
import { CreateMarketConfig } from '../../config/market';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
            ...testSubGroup,
          },
        ])
      ),
    } as unknown as jest.Mocked<MarketSubgroupService>;

    const mockConfirmationService = {
      confirm: jest.fn((confirmation: any) => {
        if (confirmation.accept) {
          confirmation.accept();
        }
      }),
    };

    // Configure the testing module
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubgroupComponent);
    component = fixture.componentInstance;
    component.marketCode = 'AA';
    fixture.detectChanges();

    // Spies to monitor method calls in ngOnInit
    jest.spyOn(component, 'initializeForm');
    jest.spyOn(component, 'loadSubGroupsIfMarketIdExists');
    jest.spyOn(component, 'subscribeToFormChanges');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template Rendering Based on showSubgroup and isMarketFormValid Flags', () => {
    it('should render subgroup template if showSubgroup is true', () => {
      component.showSubgroup = true;
      fixture.detectChanges();

      const subgroupElement = fixture.debugElement.query(
        By.css('.form-container')
      );
      expect(subgroupElement).toBeTruthy(); // Ensure template is rendered
    });

    it('should render the empty subgroup template with invalid message if showSubgroup is false and isMarketFormValid is false', () => {
      component.showSubgroup = false;
      component.isMarketFormValid = false;
      fixture.detectChanges();

      const emptySubgroupTemplate = fixture.debugElement.query(
        By.css('.empty-subgroup-template')
      );
      expect(emptySubgroupTemplate).toBeTruthy();

      const invalidMessage = emptySubgroupTemplate.query(By.css('p'));
      expect(invalidMessage.nativeElement.textContent).toContain(
        'ADD_SUBGROUP_INFO_INVALID'
      ); // Adjust based on actual translation
    });

    it('should render the empty subgroup template with valid message if showSubgroup is false and isMarketFormValid is true', () => {
      component.showSubgroup = false;
      component.isMarketFormValid = true;
      fixture.detectChanges();

      const emptySubgroupTemplate = fixture.debugElement.query(
        By.css('.empty-subgroup-template')
      );
      expect(emptySubgroupTemplate).toBeTruthy();

      const validMessage = emptySubgroupTemplate.query(By.css('p'));
      expect(validMessage.nativeElement.textContent).toContain(
        'ADD_SUBGROUP_INFO_VALID'
      ); // Adjust based on actual translation
    });
  });

  /*** Button State Tests ***/
  describe('Button State Tests', () => {
    it('should disable the empty state button if isMarketFormValid is false', () => {
      component.showSubgroup = false;
      component.isMarketFormValid = false;
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('#empty-state-subgroup-button')
      );
      expect(button.nativeElement.disabled).toBeTruthy();
    });

    it('should enable the empty state button if isMarketFormValid is true', () => {
      component.showSubgroup = false;
      component.isMarketFormValid = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('#empty-state-subgroup-button')
      );
      expect(button.nativeElement.disabled).toBeFalsy();
    });

    it('should disable the add subgroup button if isMarketFormValid is false', () => {
      component.showSubgroup = true;
      component.isMarketFormValid = false;
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(
        By.css('#add-subgroup-button')
      );
      expect(addButton.nativeElement.disabled).toBeTruthy();
    });

    it('should disable "Add Subgroup" button if canAddSubgroup returns false', () => {
      component.showSubgroup = true;
      jest.spyOn(component, 'canAddSubgroup').mockReturnValue(false);
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(
        By.css('#add-subgroup-button')
      );
      expect(addButton.nativeElement.disabled).toBeTruthy();
    });

    it('should enable the add subgroup button if isMarketFormValid is true and canAddSubgroup is true', () => {
      component.showSubgroup = true;
      component.isMarketFormValid = true;
      jest.spyOn(component, 'canAddSubgroup').mockReturnValue(true);
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(
        By.css('#add-subgroup-button')
      );
      expect(addButton.nativeElement.disabled).toBeFalsy();
    });
  });

  describe('canAddSubgroup() - flag to enable/disable add subgroup button', () => {
    let row1: FormGroup;
    let row2: FormGroup;
  
    beforeEach(() => {
      // Create mock FormGroups for rows with required structure
      row1 = component.createRow({ ...testSubGroup});
      row2 = component.createRow({ ...testSubGroup });
      
      // Spy on isSubGroupFormInvalid event emitter
      jest.spyOn(component.isSubGroupFormInvalid, 'emit');
    });
  
    it('should return true when all rows are valid and emit false', () => {
      // Set rows to valid states
      row1.setErrors(null);
      row2.setErrors(null);
  
      // Add rows to controls
      component.rows.controls = [row1, row2];
  
      // Call canAddSubgroup and check return value
      const result = component.canAddSubgroup();
      expect(result).toBe(true);
  
      // Check that isSubGroupFormInvalid is emitted with false
      expect(component.isSubGroupFormInvalid.emit).toHaveBeenCalledWith(false);
    });
  
    it('should return false when any non-deleted row is invalid and emit true', () => {
      // Set one row to invalid state
      row1.setErrors({ required: true });
  
      // Add rows to controls
      component.rows.controls = [row1, row2];
  
      // Call canAddSubgroup and check return value
      const result = component.canAddSubgroup();
      expect(result).toBe(false);
  
      // Check that isSubGroupFormInvalid is emitted with true
      expect(component.isSubGroupFormInvalid.emit).toHaveBeenCalledWith(true);
    });
  
    it('should ignore deleted rows when checking validity', () => {
      // Set the deleted row to an invalid state
      row1.get('isDeleted')?.setValue(true);
      row1.setErrors({ required: true });
  
      // Set the other row to valid
      row2.setErrors(null);
  
      // Add rows to controls
      component.rows.controls = [row1, row2];
  
      // Call canAddSubgroup and check return value
      const result = component.canAddSubgroup();
      expect(result).toBe(true);
  
      // Check that isSubGroupFormInvalid is emitted with false
      expect(component.isSubGroupFormInvalid.emit).toHaveBeenCalledWith(false);
    });
  
    it('should return true and emit false if there are no rows', () => {
      // Clear any rows
      component.rows.controls = [];
  
      // Call canAddSubgroup and check return value
      const result = component.canAddSubgroup();
      expect(result).toBe(true);
  
      // Check that isSubGroupFormInvalid is emitted with false
      expect(component.isSubGroupFormInvalid.emit).toHaveBeenCalledWith(false);
    });
  });
  

  describe('click() functionality of empty state add subgroup button', () => {
    it('should set showSubgroup to true', () => {
      // Act: Call showSubgroupFunc
      component.showSubgroupFunc();
  
      // Assert: showSubgroup should be true
      expect(component.showSubgroup).toBe(true);
    });
  
    it('should add a row if all rows are marked as deleted', () => {
      // Arrange: Add rows that are all marked as deleted
      const deletedRow = component.createRow({ ...testSubGroup, isDeleted: true });
      component.rows.controls.push(deletedRow);
  
      // Act: Call showSubgroupFunc
      component.showSubgroupFunc();
  
      // Assert: A new row should be added
      expect(component.rows.controls.length).toBe(2);
      expect(component.rows.controls[1].get('isDeleted')?.value).toBe(false);
    });
  
    it('should not add a row if not all rows are marked as deleted', () => {
      // Arrange: Add a mix of deleted and non-deleted rows
      const deletedRow = component.createRow({ ...testSubGroup, isDeleted: true });
      const activeRow = component.createRow({ ...testSubGroup, isDeleted: false });
      component.rows.controls.push(deletedRow, activeRow);
  
      // Act: Call showSubgroupFunc
      component.showSubgroupFunc();
  
      // Assert: No new row should be added
      expect(component.rows.controls.length).toBe(2);
    });
  });
  

  describe('deleteRow method', () => {
    beforeEach(() => {
      // Set up the form with 'rows' FormArray containing one item
      component.form = new FormGroup({
        rows: new FormArray([
          new FormGroup({
            isDeleted: new FormControl(false),
          }),
        ]),
      });
    });

    it('should not call confirmation dialog if rowsArray is null', () => {
      // Set up the form without 'rows' FormArray
      component.form = new FormGroup({});

      const confirmSpy = jest.spyOn(
        component['confirmationService'],
        'confirm'
      );
      component.deleteRow(0);

      // Verify that the confirmation dialog was not called
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('should call confirmation dialog and delete the row on confirmation accept', () => {
      // Spy on the methods we want to verify were called
      const emitSpy = jest.spyOn(component, 'emitValidSubGroups');
      const confirmSpy = jest
        .spyOn(component['confirmationService'], 'confirm')
        .mockImplementation((config: any) => {
          // Simulate the "accept" function of the confirmation dialog
          return config.accept();
        });

      component.deleteRow(0);

      // Check that the confirmation dialog was called
      expect(confirmSpy).toHaveBeenCalled();

      // Verify the row's isDeleted is set to true and marked as dirty
      const row = (component.form.get('rows') as FormArray).at(0);
      expect(row.get('isDeleted')?.value).toBe(true);
      expect(row.dirty).toBe(true);

      // Verify that emitValidSubGroups was called
      expect(emitSpy).toHaveBeenCalled();

      // Verify that showSubgroup is updated based on undeleted rows
      expect(component.showSubgroup).toBe(false); // assuming only one row was present and now deleted
    });

    it('should not delete the row if confirmation is rejected', () => {
      // Spy on confirmation service to simulate rejection and verify dialog is shown
      const confirmSpy = jest
        .spyOn(component['confirmationService'], 'confirm')
        .mockImplementation((config: any) => {
          // Simulate the "reject" function of the confirmation dialog
          return config.reject();
        });

      // Call deleteRow
      component.deleteRow(0);

      // Check that the confirmation dialog was called
      expect(confirmSpy).toHaveBeenCalled();

      // Verify that isDeleted is not modified and row is not marked as dirty
      const row = (component.form.get('rows') as FormArray).at(0);
      expect(row.get('isDeleted')?.value).toBe(false);
      expect(row.dirty).toBe(false);
    });
  });

  describe('Add subgroup row in form', () => {
    it('should add a row when addRow() is called', () => {
      const initialRowCount = component.rows.length;
      component.addRow();
      expect(component.rows.length).toBe(initialRowCount + 1);
    });
  });

  describe('Component Initialization', () => {
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

    it('should add a row if no subgroups are returned from the service', () => {
      // Arrange: mock the service response with an empty array
      mockSubgroupService.getSubgroups.mockReturnValue(of([]));
  
      // Act: call loadSubGroups
      component.loadSubGroups();
  
      // Assert: check if one row is added and showSubgroup remains false
      expect(component.rows.length).toBe(1); // a new row should be added
      expect(component.showSubgroup).toBe(false);
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

      component.rows.push(
        component.createRow({ ...testSubGroup, subGroupName: '' })
      );

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
      component.rows.push(
        component.createRow({
          ...testSubGroup,
          subGroupName: 'Valid Group',
          subGroupId: null,
        })
      );
      component.rows.push(
        component.createRow({
          ...testSubGroup,
          subGroupName: '',
          subGroupId: null,
        })
      ); // Invalid row

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
    let changes: SimpleChanges;

    beforeEach(() => {
      // Define the base `changes` object
      changes = {
        marketCode: {
          currentValue: 'bb',
          previousValue: 'aa',
          firstChange: false,
          isFirstChange: () => false,
        },
      };
    });

    it('should update marketCode to uppercase when marketCode changes', () => {
      component.ngOnChanges(changes);

      expect(component.marketCode).toBe('BB');
    });

    it('should propagate updated marketCode to each row control', () => {
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

      changes['marketCode'].currentValue = 'cc';

      component.ngOnChanges(changes);

      component.rows.controls.forEach((row) => {
        expect(row.get('marketCode')?.value).toBe('CC');
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

  describe('Row FormGroup Value Changes', () => {
    let row: FormGroup;
  
    beforeEach(() => {
      // Set up a test row with `createRow` method
      row = component.createRow(testSubGroup);
    });
  
    it('should convert subGroupCode to uppercase on value change', () => {
      row.get('subGroupCode')?.setValue('b');
      expect(row.get('subGroupCode')?.value).toBe('B');
    });
  
    it('should set isEdited to true when subGroupId is present and subGroupCode is modified', () => {
      row.get('subGroupCode')?.setValue('c');
      expect(row.get('isEdited')?.value).toBe(true);
    });
  
    it('should convert subGroupName to uppercase on value change', () => {
      row.get('subGroupName')?.setValue('newname');
      expect(row.get('subGroupName')?.value).toBe('NEWNAME');
    });
  
    it('should set isEdited to true when subGroupId is present and subGroupName is modified', () => {
      row.get('subGroupName')?.setValue('anotherName');
      expect(row.get('isEdited')?.value).toBe(true);
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

  describe('duplicateSubgroupCodeValidator', () => {
    let formGroup: FormGroup;
    let otherFormGroup: FormGroup;
  
    beforeEach(() => {
      formGroup = component.createRow({ ...testSubGroup ,subGroupCode: 'A1', marketCode: 'M1' });
      otherFormGroup = component.createRow({ ...testSubGroup, subGroupCode: 'A1', marketCode: 'M1' });
      component.rows.controls = [formGroup, otherFormGroup];
    });
  
    it('should return null when there are no duplicate subGroupCodes', () => {
      formGroup.get('subGroupCode')?.setValue('A2');
      const validatorFn = component.duplicateSubgroupCodeValidator();
      const result = validatorFn(formGroup);
      expect(result).toBeNull();
    });
  
    it('should return duplicateSubgroupCode error when a duplicate subGroupCode is found in the same market', () => {
      const validatorFn = component.duplicateSubgroupCodeValidator();
      const result = validatorFn(formGroup);
      expect(result).toEqual({ duplicateSubgroupCode: true });
    });
  
    it('should return null when duplicate subGroupCode exists in a different market', () => {
      otherFormGroup.get('marketCode')?.setValue('M2');
      const validatorFn = component.duplicateSubgroupCodeValidator();
      const result = validatorFn(formGroup);
      expect(result).toBeNull();
    });
  
    it('should ignore deleted rows when checking for duplicates', () => {
      otherFormGroup.get('isDeleted')?.setValue(true);
      const validatorFn = component.duplicateSubgroupCodeValidator();
      const result = validatorFn(formGroup);
      expect(result).toBeNull();
    });
  });
});
