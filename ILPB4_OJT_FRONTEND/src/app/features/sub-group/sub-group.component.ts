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

  /** 
   * @property {FormGroup} form
   * The main form structure containing the form array 'rows' which holds dynamic subgroup rows.
   */
  form!: FormGroup;

  /**
   * @property {Array} existingSubgroups
   * Holds a list of existing subgroups to validate against for duplicate entries during form submission.
   */
  existingSubgroups = [
    { marketCode: 'AA', subgroupCode: 'A', marketName: 'MARKET A' },
    { marketCode: 'BB', subgroupCode: 'B', marketName: 'MARKET B' }
  ];

  constructor(
    private fb: FormBuilder, 
    private confirmationService: ConfirmationService
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

    this.addRow(); // Add an initial row on component load
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
   * Creates a new form group (row) with controls for marketCode, subgroupCode, and marketName.
   * Adds real-time transformation to uppercase for subgroupCode and marketName fields.
   * @returns {FormGroup} A new form group representing a row in the form.
   */
  createRow(): FormGroup {
    const row = this.fb.group({
      marketCode: ['BB', [Validators.required, Validators.pattern('[A-Za-z]{2}')]], // Two-letter code
      subgroupCode: ['', [Validators.required, Validators.pattern('[A-Za-z0-9]{1}')]], // One alphanumeric
      marketName: ['', Validators.required], // Market name is required
    });

    // Convert subgroupCode to uppercase on value change
    row.get('subgroupCode')?.valueChanges.subscribe(value => {
      if (value) {
        row.get('subgroupCode')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });

    // Convert marketName to uppercase on value change
    row.get('marketName')?.valueChanges.subscribe(value => {
      if (value) {
        row.get('marketName')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
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
    this.rows.removeAt(index);
  }

  /** 
   * @method validateSubgroupCode
   * Validates subgroupCode fields for duplicates across the form and against existing subgroups.
   * @param {AbstractControl} row The row form group being validated.
   */
  validateSubgroupCode(row: AbstractControl): void {
    const formGroup = row as FormGroup;
    const marketCode = formGroup.get('marketCode')?.value;
    const subgroupCode = formGroup.get('subgroupCode')?.value;
  
    if (!subgroupCode || !marketCode) {
      return; // Don't proceed if the fields are not filled
    }
  
    // Clear subgroup code errors for all rows first
    this.rows.controls.forEach(r => {
      r.get('subgroupCode')?.setErrors(null);
    });
  
    // Now validate for duplicates
    this.rows.controls.forEach((r, index) => {
      const rowMarketCode = (r as FormGroup).get('marketCode')?.value;
      const rowSubgroupCode = (r as FormGroup).get('subgroupCode')?.value;
  
      if (rowSubgroupCode && rowMarketCode) {
        // Check if this row has duplicates in other rows or in existing subgroups
        const duplicateSubgroupRows = this.rows.controls.filter((otherRow, otherIndex) =>
          otherIndex !== index &&
          (otherRow as FormGroup).get('subgroupCode')?.value === rowSubgroupCode &&
          (otherRow as FormGroup).get('marketCode')?.value === rowMarketCode
        );
  
        const existsInExistingSubgroups = this.existingSubgroups.some(
          subgroup => subgroup.marketCode === rowMarketCode && subgroup.subgroupCode === rowSubgroupCode
        );
  
        if (duplicateSubgroupRows.length > 0 || existsInExistingSubgroups) {
          r.get('subgroupCode')?.setErrors({ duplicateSubgroupCode: true });
          duplicateSubgroupRows.forEach(duplicateRow => (duplicateRow as FormGroup).get('subgroupCode')?.setErrors({ duplicateSubgroupCode: true }));
        }
      }
    });
  }
  
  /** 
   * @method validateMarketName
   * Validates marketName fields for duplicates across the form and against existing subgroups.
   * @param {AbstractControl} row The row form group being validated.
   */
  validateMarketName(row: AbstractControl): void {
    const formGroup = row as FormGroup;
    const marketCode = formGroup.get('marketCode')?.value;
    const marketName = formGroup.get('marketName')?.value;
  
    if (!marketName || !marketCode) {
      return; // Don't proceed if the fields are not filled
    }
  
    // Clear market name errors for all rows first
    this.rows.controls.forEach(r => {
      r.get('marketName')?.setErrors(null);
    });
  
    // Now validate for duplicates
    this.rows.controls.forEach((r, index) => {
      const rowMarketCode = (r as FormGroup).get('marketCode')?.value;
      const rowMarketName = (r as FormGroup).get('marketName')?.value;
  
      if (rowMarketName && rowMarketCode) {
        // Check if this row has duplicates in other rows
        const duplicateMarketRows = this.rows.controls.filter((otherRow, otherIndex) =>
          otherIndex !== index &&
          (otherRow as FormGroup).get('marketName')?.value === rowMarketName &&
          (otherRow as FormGroup).get('marketCode')?.value === rowMarketCode
        );
  
        // Check if the market name already exists in the pre-existing subgroups
        const existsInExistingSubgroups = this.existingSubgroups.some(
          subgroup => subgroup.marketCode === rowMarketCode && subgroup.marketName === rowMarketName
        );
  
        // If duplicates found in other rows or in existing subgroups
        if (duplicateMarketRows.length > 0 || existsInExistingSubgroups) {
          r.get('marketName')?.setErrors({ duplicateMarketName: true });
          duplicateMarketRows.forEach(duplicateRow => (duplicateRow as FormGroup).get('marketName')?.setErrors({ duplicateMarketName: true }));
        }
      }
    });
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

      // Sort the rows by subgroupCode: prioritize numbers first, then letters
      formValues = formValues.sort((a: any, b: any) => {
        const subgroupA = a.subgroupCode;
        const subgroupB = b.subgroupCode;

        const isANumeric = !isNaN(subgroupA);
        const isBNumeric = !isNaN(subgroupB);

        // Give preference to numbers
        if (isANumeric && !isBNumeric) return -1;
        if (!isANumeric && isBNumeric) return 1;

        // If both are numbers or both are strings, sort normally
        return subgroupA.localeCompare(subgroupB, undefined, { numeric: true });
      });

      // Clear the FormArray
      this.rows.clear();

      // Add sorted values back into the FormArray
      formValues.forEach((row: any) => {
        this.rows.push(this.fb.group({
          marketCode: [{ value: row.marketCode, disabled: true }, [Validators.required, Validators.pattern('[A-Za-z]{2}')]],
          subgroupCode: [row.subgroupCode, [Validators.required, Validators.pattern('[A-Za-z0-9]{1}')]],
          marketName: [row.marketName, Validators.required]
        }));
      });
    }
  }

/**
 * @method onCancel()
 * Manages the cancellation process when the user attempts to leave the form with unsaved changes.
 * 1. Triggers a confirmation dialog using ConfirmationService.
 * 2. If the user accepts the confirmation:
 *    - Clears the values of `subgroupCode` and `marketName` for each row, while keeping `marketCode` intact.
 * 3. If the user rejects the confirmation, no actions are taken, and the form remains unchanged.
 */
  onCancel(): void {
    this.confirmationService.confirm({
      message: 'You have unsaved changes. Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
      // Clear only subgroupCode and marketName for each row, keeping marketCode intact
      this.rows.controls.forEach((control: AbstractControl) => {
        const row = control as FormGroup; // Cast to FormGroup
        row.get('subgroupCode')?.setValue('');
        row.get('marketName')?.setValue('');     
      });
      }
    });
  }

  // Method to disable buttons if there are any form errors
  isFormInvalid(): boolean {
    return this.form.invalid || 
      this.rows.controls.some((row) => 
      row.invalid ||  
      !row.get('subgroupCode')?.value || 
      !row.get('marketName')?.value
    );    
  }
}
