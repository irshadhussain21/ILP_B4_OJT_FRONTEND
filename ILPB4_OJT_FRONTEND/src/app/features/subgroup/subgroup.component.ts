
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
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
    DividerModule
  ],
  providers: [ConfirmationService],
  templateUrl: './subgroup.component.html',
  styleUrls: ['./subgroup.component.css']
})
export class SubgroupComponent implements OnInit {

  // Accept the marketCode as an input from the parent component
  @Input() marketCode: string = '';
  @Input() fetchSubGroups: MarketSubgroup[] = [];
  @Output() subGroupsChanged = new EventEmitter<MarketSubgroup[]>();

  isInitialLoad = true; // Initially, the Add Subgroup button is enabled.
  submitting = false; // Add this flag to track the form submission status

  form!: FormGroup;

  subGroups: MarketSubgroup[] = [];

  constructor(
    private fb: FormBuilder, 
    private confirmationService: ConfirmationService,
    private marketSubgroupService: MarketSubgroupService
  ) {}

  /**
   * @method ngOnInit
   * Initializes the component and sets up the form structure. It also loads the existing subgroups 
   * from the backend service to populate the form.
   */
  ngOnInit(): void {
    this.marketCode = this.marketCode.toUpperCase();
    console.log('Market Code in SubGroupComponent:', this.marketCode);
    this.form = this.fb.group({
      rows: this.fb.array([]) // FormArray to manage rows
    });
      // Fetch subgroups based on the passed marketCode
      if (this.marketCode.toLowerCase()) {
        this.loadSubGroups(); 
      } else {
        this.addRow(); // If no marketCode, add an empty row by default
      }

      if (this.fetchSubGroups && this.fetchSubGroups.length > 0) {
        this.form.setControl('rows', this.fb.array(this.fetchSubGroups.map(subGroup => this.createRow(subGroup))));
      }

      // Track changes to the form array and emit valid subgroups
      this.form.valueChanges.pipe(
        debounceTime(300) // Emit changes after 300ms of inactivity
      ).subscribe(() => {
        this.emitValidSubGroups();
      });
  }

  emitValidSubGroups(): void {
    // Filter out only valid rows
    const validSubGroups = this.rows.controls
      .filter(row => row.valid) // Only emit if the row is valid
      .map(row => row.value); // Extract the values of valid rows

      console.log('Emitting valid subgroups:', validSubGroups);
    // Emit the valid subgroups
    this.subGroupsChanged.emit(validSubGroups);
  }

  /**
   * @method loadSubGroups
   * Fetches the existing subgroups from the backend and populates the form rows. 
   * Handles error logging if the request fails.
   */
  loadSubGroups(): void {
    this.marketSubgroupService.getSubgroups(this.marketCode.toLowerCase()).subscribe({
      next: (subGroups: MarketSubgroup[]) => {
        if (subGroups.length > 0) {
          this.form.setControl('rows', this.fb.array(subGroups.map(subGroup => this.createRow(subGroup))));
        } else {
          this.addRow(); // If no subgroups are returned, add an empty row by default
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching subgroupsfor market:', this.marketCode, error.message);
      }
    });

    this.isInitialLoad = false;
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
      subGroupCode: [subGroup?.subGroupCode || '', Validators.required],
      subGroupName: [subGroup?.subGroupName || '', Validators.required]
    });
 
    // Convert `subgroupCode` to uppercase on value change and trigger validation
    row.get('subGroupCode')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        row.get('subGroupCode')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
      
      this.validateSubgroupCode(row);
      row.get('subGroupCode')?.markAsTouched();
    });
 
    // Convert `subgroupName` to uppercase on value change and trigger validation
    row.get('subGroupName')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        row.get('subGroupName')?.setValue(value.toUpperCase(), { emitEvent: false });
      }

      this.validateSubgroupName(row);
      row.get('subGroupName')?.markAsTouched();
    });
 
    return row;
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
    },
    reject: () => {}
  });
}
  
/**
 * @method validateSubgroupCode
 * Validates the 'subgroupCode' field for each row, ensuring it contains a valid single alphanumeric 
 * character and is unique within the market. Sets validation errors if conditions are not met.
 * @param {AbstractControl} row - The form group representing a single row in the form.
 */
validateSubgroupCode(row: AbstractControl): void {
  const formGroup = row as FormGroup;
  const marketCode = formGroup.get('marketCode')?.value;
  const subgroupCode = formGroup.get('subGroupCode')?.value;

  if (!subgroupCode || !marketCode) {
    return;
  }

  formGroup.get('subGroupCode')?.setErrors(null);

  const pattern = /^[A-Za-z0-9]{1}$/;
  if (!pattern.test(subgroupCode)) {
    formGroup.get('subGroupCode')?.setErrors({ invalidFormat: true });
    return;
  }

  const duplicateSubgroupRows = this.rows.controls.filter(
    (otherRow) => 
      (otherRow as FormGroup).get('subGroupCode')?.value === subgroupCode &&
      (otherRow as FormGroup).get('marketCode')?.value === marketCode
  );

  if (duplicateSubgroupRows.length > 1) {
    formGroup.get('subGroupCode')?.setErrors({ duplicateSubgroupCode: true });
  }

}

/**
 * @method validateSubgroupName
 * Validates the 'subgroupName' field for each row, ensuring it is unique within the market.
 * @param {AbstractControl} row - The form group representing a single row in the form.
 */
validateSubgroupName(row: AbstractControl): void {
  const formGroup = row as FormGroup;
  const marketCode = formGroup.get('marketCode')?.value;
  const subgroupName = formGroup.get('subGroupName')?.value;

  if (!subgroupName || !marketCode) {
    return;
  }

  formGroup.get('subGroupName')?.setErrors(null);

  const duplicateSubgroupRows = this.rows.controls.filter(
    (otherRow) => 
      (otherRow as FormGroup).get('subGroupName')?.value === subgroupName &&
      (otherRow as FormGroup).get('marketCode')?.value === marketCode
  );

  if (duplicateSubgroupRows.length > 1) {
    formGroup.get('subGroupName')?.setErrors({ duplicateSubgroupName: true });
  }
}

  
  // private emitSubGroups(): void {
  //   const subGroupValues = this.form.value.rows.map((subGroup: SubGroup) => ({
  //     subGroupName: subGroup.subGroupName,
  //     subGroupCode: subGroup.subGroupCode,
  //     marketCode: subGroup.marketCode,
  //   }));

  //   this.subGroupsChanged.emit(subGroupValues);
  // }
/**
 * @method onCancel
 * Resets the form and reloads the existing subgroups, after confirming with the user.
 */
  // onCancel(): void {
  //   this.confirmationService.confirm({
  //     message: 'You have unsaved changes. Are you sure you want to proceed?',
  //     header: 'Confirmation',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => {
  //       this.loadSubGroups();
  //     }
  //   });
  // }

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
      return true; // Initially, allow adding the first row
    }
  
   const hasInvalidRow = this.rows.controls.some(row => row.invalid);

   return !hasInvalidRow && !this.isInitialLoad;
  }
  
}