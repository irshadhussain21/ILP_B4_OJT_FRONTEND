
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { MarketSubgroupService } from '../../services/subgroup.service';
import { MarketSubgroup } from '../../core/models/market';

import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators'; // Import debounceTime for performance optimization
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

/** LLD
 * SubGroupComponent:
 * This component manages a list of market subgroups using reactive forms. It allows the user to
 * dynamically add and delete subgroups, and provides validation for input fields.
 * The component also handles automatic case conversion for subgroup codes and names to 
 * ensure consistent formatting across the application.
 * sub group functionalities
 * Core functionalities:
 * - Fetching existing subgroups from the backend service on initialization.
 * - Dynamically creating form rows for adding new subgroups
 * - Deleting subgroups with confirmation.
 * - Automatically converting the 'subgroupCode' and 'subgroupName' inputs to uppercase.
 * - Validating 'subgroupCode' (single alphanumeric character) and 'subgroupName' for uniqueness 
 *   within the same market.
 * - Displaying validation errors for required fields and duplicate entries in real-time.
 * - Managing form state with Angular's reactive forms and validators.
 * 
 * Design Overview:
 * - Form Inputs:
 *    - 'marketCode' and 'subgroupCode' fields: The user inputs a market code and subgroup code. 
 *      Both fields are automatically converted to uppercase on input. The subgroup code must be 
 *      a single alphanumeric character and is validated in real-time to ensure uniqueness within the market.
 *    - 'subgroupName' field: Accepts the subgroup's name, automatically converting to uppercase. 
 *      This field is required and validated for uniqueness within the same market.
 * - Buttons:
 *    - Add SubGroup Button: Adds a new empty row to the form for creating a new subgroup.
 *    - Submit Button: Submits the form data to the backend service for persistence after validation.
 *    - Cancel Button: Allows to reset the form data, after showing confirmation popup.
 * - Icons:
 *    - Delete Icon: Located in each row to remove the respective subgroup entry.
 * 
 * Third-party Integrations:
 * - PrimeNG components such as p-table (for table layout), p-confirmDialog (for confirmation popups), 
 *   and p-inputText are used in the UI.
 * 
 * Data Flow:
 * - On initialization, the existing subgroups are loaded from the backend service into the form.
 * - User interactions (add and delete) update the form state dynamically.
 * - The form's submission sends the updated subgroup data to the backend for saving.
 * 
 * Validation and Error Handling:
 * - 'subgroupCode' and 'subgroupName' fields are required and must be unique within the same market.
 * - The subgroup code must follow a specific format (single alphanumeric character).
 * - Real-time validation displays any input errors, such as invalid format or duplicate entries.
 * - Case conversion ensures that both 'subgroupCode' and 'subgroupName' are uppercase.
 * 
 * Outputs:
 * - The component maintains an updated list of subgroups in real time. The final form submission 
 *   sends the updated data to the backend for persistence.
 * 
 * User Interaction:
 * - Users can add and delete subgroups using form controls. The UI provides validation 
 *   messages and confirmation dialogs to ensure user actions are clear and intentional.
 */


@Component({
  selector: 'app-sub-group',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ConfirmDialogModule, 
    TableModule, 
    ButtonModule, 
    InputGroupModule, 
    InputTextModule, 
    DividerModule,
    TranslateModule
   
  ],
  providers: [ConfirmationService],
  templateUrl: './subgroup.component.html',
  styleUrls: ['./subgroup.component.scss']
})
export class SubgroupComponent implements OnInit {

  @Input() marketCode: string = '';
  @Input() marketId?: number;
  @Input() isMarketFormValid: boolean | undefined;
  @Output() subGroupsChanged = new EventEmitter<{ subGroups: MarketSubgroup[], hasNoSubGroupRows: boolean }>();
  @Output() isSubGroupFormInvalid = new EventEmitter<boolean>();

  showSubgroup: boolean = false;

  form!: FormGroup;

  subGroups: MarketSubgroup[] = [];

  constructor(
    private fb: FormBuilder, 
    private confirmationService: ConfirmationService,
    private marketSubgroupService: MarketSubgroupService,
  ) {}

  /**
   * @method ngOnInit
   * Initializes the component and sets up the form structure. It also loads the existing subgroups 
   * from the backend service to populate the form.
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadSubGroupsIfMarketIdExists();
    this.subscribeToFormChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleMarketCodeChange(changes);
  }
  
  
  handleMarketCodeChange(changes: SimpleChanges): void {
    if (changes['marketCode'] && changes['marketCode'].currentValue) {
      this.marketCode = changes['marketCode'].currentValue.toUpperCase();

      this.rows.controls.forEach(row => {
        row.get('marketCode')?.setValue(this.marketCode, { emitEvent: false });
      });
    }
  }

  initializeForm() : void {
    this.form = this.fb.group({
      rows: this.fb.array([]) 
    });
  }

  loadSubGroupsIfMarketIdExists(): void {
    if (this.marketId) {
      this.loadSubGroups(); 
    } else {
      this.addRow(); 
    }
  }

  subscribeToFormChanges(): void {
    this.form.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.emitValidSubGroups();
    });

    this.form.statusChanges.subscribe(status => {
      const isInvalid = status === 'INVALID';
      this.isSubGroupFormInvalid.emit(isInvalid); 
    });
  }
  
  showSubgroupFunc() {
    this.showSubgroup = true;
    if (this.rows.length === 0) {
      this.addRow();
    }
  }
  

  emitValidSubGroups(): void {
    const validSubGroups = this.rows.controls
      .filter(row => row.valid)
      .map(row => row.value);

    const hasInvalidRow = this.rows.controls.some(row => row.invalid);
    const hasNoSubGroupRows = this.rows.length === 0;

    this.isSubGroupFormInvalid.emit(hasInvalidRow);
    this.subGroupsChanged.emit({ subGroups: validSubGroups, hasNoSubGroupRows });
  }

  /**
   * @method loadSubGroups
   * Fetches the existing subgroups from the backend and populates the form rows. 
   * Handles error logging if the request fails.
   */
  loadSubGroups(): void {
    this.marketSubgroupService.getSubgroups(this.marketId).subscribe({
      next: (subGroups: MarketSubgroup[]) => {
        if (subGroups.length > 0) {
          this.form.setControl('rows', this.fb.array(subGroups.map(subGroup => this.createRow(subGroup))));
          this.showSubgroup = true;
        } else {
          this.addRow();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching subgroupsfor market:', this.marketCode, error.message);
      }
    });
  }

/**
 * @getter rows
 * Provides easy access to the form's FormArray for managing subgroup rows.
 * @returns {FormArray} - The FormArray containing the current subgroup rows.
 */
  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

/**
 * @method createRow
 * Creates a new FormGroup for a subgroup row, initializing form controls for 'marketCode', 'subGroupCode', 
 * and 'subGroupName'. This method also sets up value change listeners to automatically convert the input 
 * to uppercase and validate fields in real-time.
 * @param {SubGroup} subGroup - An optional subgroup object to pre-populate the row (for editing).
 * @returns {FormGroup} - A FormGroup representing the subgroup row.
 */
createRow(subGroup?: MarketSubgroup): FormGroup {
  const row = this.fb.group({
    subGroupId: [subGroup?.subGroupId || null],
    marketId: [subGroup?.marketId],
    marketCode: [this.marketCode],
    subGroupCode: [
      subGroup?.subGroupCode || '', 
      [Validators.required, Validators.pattern('^[A-Za-z0-9]{1}$')]
    ],
    subGroupName: [
      subGroup?.subGroupName || '', 
      Validators.required
    ]
  }, { validators: [this.duplicateSubgroupCodeValidator(), this.duplicateSubgroupNameValidator()] });

  row.get('subGroupCode')?.valueChanges.subscribe(value => {
    if (value && value !== value.toUpperCase()) {
      row.get('subGroupCode')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
  });

  row.get('subGroupName')?.valueChanges.subscribe(value => {
    if (value && value !== value.toUpperCase()) {
      row.get('subGroupName')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
  });

  return row;
}



duplicateSubgroupCodeValidator(): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const subGroupCode = formGroup.get('subGroupCode')?.value;
    const marketCode = formGroup.get('marketCode')?.value;
    const duplicate = this.rows.controls.some((otherRow) => 
      (otherRow !== formGroup) &&
      otherRow.get('subGroupCode')?.value === subGroupCode &&
      otherRow.get('marketCode')?.value === marketCode
    );

    return duplicate ? { 'duplicateSubgroupCode': true } : null;
  };
}


duplicateSubgroupNameValidator(): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const subGroupName = formGroup.get('subGroupName')?.value;
    const marketCode = formGroup.get('marketCode')?.value;

    const duplicate = this.rows.controls.some((otherRow) =>
      (otherRow !== formGroup) &&
      otherRow.get('subGroupName')?.value === subGroupName &&
      otherRow.get('marketCode')?.value === marketCode
    );

    return duplicate ? { 'duplicateSubgroupName': true } : null;
  };
}
 
/**
 * @method addRow
 * Adds a new, empty row to the form for creating a new subgroup.
 */
  addRow(): void {
    this.rows.push(this.createRow());
  }

/**
 * @method deleteRow
 * Deletes a row from the form after confirming the user's action. If the row contains a persisted subgroup, 
 * it is deleted from the backend.
 * @param {number} rowIndex - The index of the row to be deleted.
 * @param {number} subGroupId - The ID of the subgroup to be deleted, if already persisted.
 */
deleteRow(rowIndex: number): void {

  const rowsArray = this.form.get('rows') as FormArray | null;
  if (!rowsArray) {
    console.error('Form array "rows" does not exist');
    return;
  }

  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this subgroup?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      rowsArray.removeAt(rowIndex);
      const validSubGroups = this.rows.controls
        .filter(row => row.valid)
        .map(row => row.value);
      const hasNoSubGroupRows = rowsArray.length === 0;
      this.subGroupsChanged.emit({ hasNoSubGroupRows, subGroups: validSubGroups });
      this.showSubgroup = !hasNoSubGroupRows;
    },
    reject: () => {}
  });
}
  
/**
 * @method canAddSubgroup
 * Checks if a new subgroup can be added. A subgroup can be added if:
 * - There are no existing rows.
 * - No existing rows are invalid.
 * - The initial load is complete.
 * @returns {boolean} - True if a new subgroup can be added; otherwise, false.
 */
  canAddSubgroup(): boolean {
    if (!this.rows || this.rows.length === 0) {
      return true;
    }
  
   const hasInvalidRow = this.rows.controls.some(row => row.invalid);
   this.isSubGroupFormInvalid.emit(hasInvalidRow);
   return !hasInvalidRow;
  }
}