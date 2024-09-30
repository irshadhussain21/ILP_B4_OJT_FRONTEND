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
import { firstValueFrom } from 'rxjs';

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
  submitting = false; // Add this flag to track the form submission status

  /** 
   * @property {FormGroup} form
   * The main form structure containing the form array 'rows' which holds dynamic subgroup rows.
   */
  form!: FormGroup;

  subGroups: SubGroup[] = [];

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
    this.loadSubGroups();
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
/*
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
  */

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
    // console.log("Creating row with data:", subGroup); 
    const row = this.fb.group({
      subGroupId: [subGroup?.subGroupId || null],
      marketId: [subGroup?.marketId],
      marketCode: [subGroup?.marketCode || 'FL'],
      subGroupCode: [subGroup?.subGroupCode || '', Validators.required],
      subGroupName: [subGroup?.subGroupName || '', Validators.required]
    });
 
    // Convert `subgroupCode` to uppercase on value change and trigger validation
    row.get('subGroupCode')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        row.get('subGroupCode')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
      // Trigger validation for duplicate subgroup codes in real-time
      this.validateSubgroupCode(row);
      row.get('subGroupCode')?.markAsTouched(); // << ADDED THIS LINE TO SHOW ERROR IN REAL-TIME
      
    });
 
    // Convert `subgroupName` to uppercase on value change and trigger validation
    row.get('subGroupName')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        row.get('subGroupName')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
      // Trigger validation for duplicate subgroup names in real-time
      this.validateSubgroupName(row);
      row.get('subGroupName')?.markAsTouched(); // << ADDED THIS LINE TO SHOW ERROR IN REAL-TIME
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

  deleteRow(rowIndex: number, subGroupId: number): void {
    // First, safely cast the 'rows' control to a FormArray.
    const rowsArray = this.form.get('rows') as FormArray | null;
    
    // Check if 'rowsArray' is not null before proceeding
    if (!rowsArray) {
      console.error('Form array "rows" does not exist');
      return;
    }
  
    // Trigger confirmation dialog
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this subgroup?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // If the user clicks 'Yes', proceed with deletion
        if (subGroupId) {
          this.marketSubgroupService.deleteSubgroup(subGroupId).subscribe({
            next: () => {
              rowsArray.removeAt(rowIndex); // Remove the row from the form after successful deletion
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error deleting subgroup:', error.message);
            }
          });
        } else {
          rowsArray.removeAt(rowIndex);
        }
      },
      reject: () => {
          
      }
    });
  }
  


// Validate Subgroup Code
validateSubgroupCode(row: AbstractControl): void {
  const formGroup = row as FormGroup;
  const marketCode = formGroup.get('marketCode')?.value;
  const subgroupCode = formGroup.get('subGroupCode')?.value;

  if (!subgroupCode || !marketCode) {
    return; // Don't proceed if the fields are not filled
  }

  // Reset subgroup code errors for this row only
  formGroup.get('subGroupCode')?.setErrors(null);

  // 1. Validate the pattern for subgroupCode (alphanumeric, 1 character)
  const pattern = /^[A-Za-z0-9]{1}$/;
  if (!pattern.test(subgroupCode)) {
    formGroup.get('subGroupCode')?.setErrors({ invalidFormat: true });
    return; // Stop further validation if pattern fails
  }

  // Validate for duplicates
  const duplicateSubgroupRows = this.rows.controls.filter(
    (otherRow) => 
      (otherRow as FormGroup).get('subGroupCode')?.value === subgroupCode &&
      (otherRow as FormGroup).get('marketCode')?.value === marketCode
  );


  if (duplicateSubgroupRows.length > 1) {
    formGroup.get('subGroupCode')?.setErrors({ duplicateSubgroupCode: true });
  }

}

// Validate Subgroup Name
validateSubgroupName(row: AbstractControl): void {
  const formGroup = row as FormGroup;
  const marketCode = formGroup.get('marketCode')?.value;
  const subgroupName = formGroup.get('subGroupName')?.value;

  if (!subgroupName || !marketCode) {
    return; // Don't proceed if the fields are not filled
  }

  // Reset subgroup name errors for this row only
  formGroup.get('subGroupName')?.setErrors(null);

  // Validate for duplicates
  const duplicateSubgroupRows = this.rows.controls.filter(
    (otherRow) => 
      (otherRow as FormGroup).get('subGroupName')?.value === subgroupName &&
      (otherRow as FormGroup).get('marketCode')?.value === marketCode
  );

  if (duplicateSubgroupRows.length > 1) {
    formGroup.get('subGroupName')?.setErrors({ duplicateSubgroupName: true });
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
    // Prevent multiple submissions
    if (this.submitting) {
      return;
    }
  
    // Check if the form is valid
    if (this.form.valid) {
      const formValues = this.form.value.rows;
  
      // Separate new subgroups (without subGroupId) from existing subgroups (with subGroupId)
      const newSubGroups = formValues.filter((subGroup: SubGroup) => !subGroup.subGroupId);
  
      // If there are new subgroups, proceed with creation
      if (newSubGroups.length > 0) {
        this.submitting = true; // Mark the form as submitting to avoid multiple calls
  
        // Use Promise.all or forkJoin (if using RxJS) for batch creation requests
        const createSubgroupPromises = newSubGroups.map((subGroup: SubGroup) => {
          const payload = {
            subGroupName: subGroup.subGroupName,
            subGroupCode: subGroup.subGroupCode,
            marketCode: subGroup.marketCode
          };
          return firstValueFrom(this.marketSubgroupService.createSubgroup(payload)); // Use firstValueFrom instead of toPromise
        });
  
        // Wait for all requests to complete
        Promise.all(createSubgroupPromises)
          .then((responses) => {
            console.log('Subgroups created:', responses);
            this.loadSubGroups(); // Reload the list after successful creation
          })
          .catch((error) => {
            console.error('Error creating subgroups:', error);
          })
          .finally(() => {
            this.submitting = false; // Reset the submitting flag after the process is complete
          });
      }
    } else {
      this.form.markAllAsTouched(); // Marks all controls as touched to trigger validation errors
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
        // Reload the page to discard unsaved changes and fetch fresh data
        this.loadSubGroups(); // Fetch and load only the saved subgroups
      }
    });
  }

  canAddSubgroup(): boolean {
    if (!this.rows || this.rows.length === 0) {
      return true; // Initially, allow adding the first row
    }
  
    // Check if any of the rows are invalid
   const hasInvalidRow = this.rows.controls.some(row => row.invalid);

   return !hasInvalidRow && !this.isInitialLoad; // << UPDATED LOGIC
  }
  
  canSubmit(): boolean {
    return this.form.valid && this.rows.length > 0 && !this.isInitialLoad; // Ensure all rows are valid before submitting
  }
  
}
