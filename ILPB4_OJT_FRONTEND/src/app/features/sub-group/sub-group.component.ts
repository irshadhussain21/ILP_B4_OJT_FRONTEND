import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MarketSubgroupService } from '../../core/services/subgroup.service';
import { SubGroup } from '../../core/models/subgroup';
import { HttpErrorResponse } from '@angular/common/http';

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
  templateUrl: './sub-group.component.html',
  styleUrls: ['./sub-group.component.css']
})
export class SubGroupComponent implements OnInit {

  isInitialLoad = true; // Initially, the Add Subgroup button is enabled.

  /** 
   * @property {FormGroup} form
   * The main form structure containing the form array 'rows' which holds dynamic subgroup rows.
   */
  form!: FormGroup;

  subGroups: SubGroup[] = [];

  /**
   * @property {Array} existingSubgroups
   * Holds a list of existing subgroups to validate against for duplicate entries during form submission.
   */
  existingSubgroups = [
    { marketCode: 'AA', subgroupCode: 'A', subgroupName: 'MARKET A' },
    { marketCode: 'BB', subgroupCode: 'B', subgroupName: 'MARKET B' }
  ];

  constructor(
    private fb: FormBuilder, 
    private confirmationService: ConfirmationService,
    private marketSubgroupService: MarketSubgroupService
  ) {}

  /** 
   * @method ngOnInit
   * Initializes the form with the dynamic form array and adds an initial row.
   * Invoked automatically when the component loads.
   */
  ngOnInit(): void {
    this.form = this.fb.group({
      rows: this.fb.array([]) // FormArray to manage rows
    });
    console.log('Form array initialized with:', this.rows.value);
    this.loadSubGroups();
    this.trackFormChanges(); //Start Tracking changes to the form
  }

  // Add this function to track changes to the form fields
  trackFormChanges(): void {
    this.rows.valueChanges.subscribe(() => {
      this.isInitialLoad = false; // Once any value is changed, disable initial state.
    });
  }

  loadSubGroups(): void {
    this.marketSubgroupService.getSubgroups().subscribe({
      next: (subGroups: SubGroup[]) => {
        this.form.setControl('rows', this.fb.array(subGroups.map(subGroup => this.createRow(subGroup))));
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching subgroups:', error.message);
      }
    });

    this.isInitialLoad = false;
  }
  

  createSubGroup(payload: Partial<SubGroup>): void {
    this.marketSubgroupService.createSubgroup(payload).subscribe({
      next: (response: SubGroup) => {
        console.log('Subgroup created:', response);
        this.loadSubGroups();  // Reload the list after successful creation
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating subgroup:', error.message);
      }
    });
  }
  

  updateSubGroup(subGroupId: number, payload: Partial<SubGroup>): void {
    this.marketSubgroupService.updateSubgroup(subGroupId, payload).subscribe({
      next: (response: SubGroup) => {
        console.log('Subgroup updated:', response);
        this.loadSubGroups();  // Reload the list after successful update
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating subgroup:', error.message);
      }
    });
  }
  

  deleteSubGroup(subGroupId: number): void {
    this.marketSubgroupService.deleteSubgroup(subGroupId).subscribe({
      next: () => {
        console.log('Subgroup deleted');
        this.loadSubGroups(); // Reload the list after deletion
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting subgroup:', error.message);
      }
    });
  }

  setFormRows(subGroups: SubGroup[]): void {
    console.log('Populating form with subgroups:', subGroups);  // Debug log
    // Clear existing rows before populating with backend data to avoid duplicates
    this.rows.clear();
  
    // Iterate over each subgroup received from the backend and create a form row
    subGroups.forEach(subGroup => {
      console.log("Creating form group for:", subGroup); // Log each subgroup
      const formGroup = this.createRow(subGroup); // Use createRow to generate the form group
      this.rows.push(formGroup); // Push the form group to the rows FormArray
    });
  }
  

  /** 
   * @getter rows
   * Retrieves the FormArray that holds the dynamic rows.
   * @returns {FormArray} The form array that contains all the rows.
   */
  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  /** 
   * @method createRow
   * Creates a new form group (row) with controls for marketCode, subgroupCode, and subgroupName.
   * Adds real-time transformation to uppercase for subgroupCode and subgroupName fields.
   * @returns {FormGroup} A new form group representing a row in the form.
   */
  createRow(subGroup?: SubGroup): FormGroup {
    console.log("Creating row with data:", subGroup); 
    const row = this.fb.group({
      id: [subGroup?.subGroupId || null],
      marketId: [subGroup?.marketId],
      marketCode: [subGroup?.marketCode || 'FL'],
      subgroupCode: [subGroup?.subGroupCode || '', [Validators.required, Validators.pattern('^[A-Za-z0-9]{1}$')]],
      subgroupName: [subGroup?.subGroupName || '', Validators.required]
    });
 
    // Convert `subgroupCode` to uppercase on value change and trigger validation
    row.get('subgroupCode')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        row.get('subgroupCode')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
      // Trigger validation for duplicate subgroup codes in real-time
      this.validateSubgroupCode(row);
      row.get('subgroupCode')?.markAsTouched(); // << ADDED THIS LINE TO SHOW ERROR IN REAL-TIME
      row.get('subgroupCode')?.updateValueAndValidity();  // << Ensure it updates validation status
    });
 
    // Convert `subgroupName` to uppercase on value change and trigger validation
    row.get('subgroupName')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        row.get('subgroupName')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
      // Trigger validation for duplicate subgroup names in real-time
      this.validateSubgroupName(row);
      row.get('subgroupName')?.markAsTouched(); // << ADDED THIS LINE TO SHOW ERROR IN REAL-TIME
    });
 
    return row;
  }
 
  /** 
   * @method addRow
   * Adds a new row (FormGroup) to the FormArray (rows) dynamically.
   */
  addRow(): void {
    this.rows.push(this.createRow());
  }

  /** 
   * @method deleteRow
   * Deletes a row from the FormArray by its index.
   * @param {number} index The index of the row to be deleted.
   */
  deleteRow(index: number): void {
    const subGroupId = this.rows.at(index).value.id;
    if (subGroupId) {
      this.marketSubgroupService.deleteSubgroup(subGroupId).subscribe({
        next: () => {
          console.log('Subgroup deleted');
          this.rows.removeAt(index);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting subgroup:', error.message);
        }
      });
    } else {
      this.rows.removeAt(index);
    }
  }


// Validate Subgroup Code
validateSubgroupCode(row: AbstractControl): void {
  const formGroup = row as FormGroup;
  const marketCode = formGroup.get('marketCode')?.value;
  const subgroupCode = formGroup.get('subgroupCode')?.value;

  if (!subgroupCode || !marketCode) {
    return; // Don't proceed if the fields are not filled
  }

  // Reset subgroup code errors for this row only
  formGroup.get('subgroupCode')?.setErrors(null);

  // Validate for duplicates
  const duplicateSubgroupRows = this.rows.controls.filter(
    (otherRow, index) => 
      (otherRow as FormGroup).get('subgroupCode')?.value === subgroupCode &&
      (otherRow as FormGroup).get('marketCode')?.value === marketCode
  );

  const existsInExistingSubgroups = this.existingSubgroups.some(
    subgroup => subgroup.marketCode === marketCode && subgroup.subgroupCode === subgroupCode
  );

  if (duplicateSubgroupRows.length > 1 || existsInExistingSubgroups) {
    formGroup.get('subgroupCode')?.setErrors({ duplicateSubgroupCode: true });
  }

}

// Validate Subgroup Name
validateSubgroupName(row: AbstractControl): void {
  const formGroup = row as FormGroup;
  const marketCode = formGroup.get('marketCode')?.value;
  const subgroupName = formGroup.get('subgroupName')?.value;

  if (!subgroupName || !marketCode) {
    return; // Don't proceed if the fields are not filled
  }

  // Reset subgroup name errors for this row only
  formGroup.get('subgroupName')?.setErrors(null);

  // Validate for duplicates
  const duplicateSubgroupRows = this.rows.controls.filter(
    (otherRow, index) => 
      (otherRow as FormGroup).get('subgroupName')?.value === subgroupName &&
      (otherRow as FormGroup).get('marketCode')?.value === marketCode
  );

  const existsInExistingSubgroups = this.existingSubgroups.some(
    subgroup => subgroup.marketCode === marketCode && subgroup.subgroupName === subgroupName
  );

  if (duplicateSubgroupRows.length > 1 || existsInExistingSubgroups) {
    formGroup.get('subgroupName')?.setErrors({ duplicateSubgroupName: true });
  }
}

  /**
 * @method onSubmit
 * Handles the form submission process, including:
 * 1. Validating the form and proceeding only if valid.
 * 2. Sorting the form rows based on the `subgroupCode`:
 *    - Numeric `subgroupCode` values are prioritized over alphabetic ones.
 */
  onSubmit(): void {
    // Check if the form is valid
    if (this.form.valid) {
      let formValues = this.form.value.rows;
      formValues.forEach((subGroup: SubGroup) => {
        // Extract only the required fields for POST API
        const payload = {
          subGroupName: subGroup.subGroupName,
          subGroupCode: subGroup.subGroupCode,
          marketId: subGroup.marketId
        };
  
        if (subGroup.subGroupId) {
          // Update existing subgroup
          this.updateSubGroup(subGroup.subGroupId, payload);
        } else {
          // Create new subgroup
          this.createSubGroup(payload);
        }
      });


    }
    else{
      this.form.markAllAsTouched(); // Marks all controls as touched to trigger validation errors
      return;
    }
  }

/**
 * @method onCancel()
 * Manages the cancellation process when the user attempts to leave the form with unsaved changes.
 * 1. Triggers a confirmation dialog using ConfirmationService.
 * 2. If the user accepts the confirmation:
 *    - Clears the values of `subgroupCode` and `subgroupName` for each row, while keeping `marketCode` intact.
 * 3. If the user rejects the confirmation, no actions are taken, and the form remains unchanged.
 */
  onCancel(): void {
    this.confirmationService.confirm({
      message: 'You have unsaved changes. Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
      // Clear only subgroupCode and subgroupName for each row, keeping marketCode intact
      this.rows.controls.forEach((control: AbstractControl) => {
        const row = control as FormGroup; // Cast to FormGroup
        row.get('subgroupCode')?.setValue('');
        row.get('subgroupName')?.setValue('');     
      });
      }
    });
  }

  canAddSubgroup(): boolean {
    if (!this.rows || this.rows.length === 0) {
      return true; // Initially, allow adding the first row
    }
  
    const lastRow = this.rows.at(this.rows.length - 1) as FormGroup;
  
    if (!lastRow) {
      return true; // Safeguard in case there's no last row
    }
  
    // Log last row's value, status, and individual control validation states
    console.log('Last Row Value:', lastRow.value);
    console.log('Last Row Status:', lastRow.status); // Check if it's 'VALID' or 'INVALID'
    console.log('MarketCode Errors:', lastRow.get('marketCode')?.errors);
    console.log('SubgroupCode Errors:', lastRow.get('subgroupCode')?.errors);
    console.log('SubgroupName Errors:', lastRow.get('subgroupName')?.errors);
  
       // Check if any of the rows are invalid
   const hasInvalidRow = this.rows.controls.some(row => row.invalid);

   console.log('Add Subgroup Button Disabled:', hasInvalidRow || this.isInitialLoad);

   return !hasInvalidRow && !this.isInitialLoad; // << UPDATED LOGIC
  }
  
  canSubmit(): boolean {
    return this.form.valid && this.rows.length > 0 && !this.isInitialLoad; // Ensure all rows are valid before submitting
  }
  

  
}
