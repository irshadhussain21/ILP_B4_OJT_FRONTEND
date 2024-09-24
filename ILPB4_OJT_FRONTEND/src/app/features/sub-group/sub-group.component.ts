import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table'; // PrimeNG table
import { ButtonModule } from 'primeng/button'; // PrimeNG button
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-sub-group',
  standalone: true, // Declare it as a standalone component
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ConfirmDialogModule, 
    TableModule, 
    ButtonModule, 
    InputGroupModule, 
    InputTextModule, 
    DividerModule
  ], // Import the necessary modules
  providers: [ConfirmationService],
  templateUrl: './sub-group.component.html',
  styleUrls: ['./sub-group.component.css']
})
export class SubGroupComponent implements OnInit {
  form!: FormGroup;
  existingSubgroups = [
    { marketCode: 'AA', subgroupCode: 'A', marketName: 'MARKET A' }, // Example existing subgroup
    { marketCode: 'BB', subgroupCode: 'B', marketName: 'MARKET B' }
  ];

  constructor(
    private fb: FormBuilder, 
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      rows: this.fb.array([]) // FormArray to manage rows
    });

    this.addRow(); // Add an initial row on component load
  }

  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

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

  addRow(): void {
    this.rows.push(this.createRow());
  }

  deleteRow(index: number): void {
    this.rows.removeAt(index);
  }

  // Validate subgroup code for duplicates in form and existingSubgroups
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
  
  

  // Validate market name for duplicates in form and existingSubgroups
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
  

  checkSubgroupExists(subgroupData: any): boolean {
    return this.existingSubgroups.some(subgroup =>
      subgroup.marketCode === subgroupData.marketCode &&
      (subgroup.subgroupCode === subgroupData.subgroupCode || subgroup.marketName === subgroupData.marketName)
    );
  }

  onSubmit(): void {
    let formValues = this.form.value.rows;

    // Check for existing subgroup duplicates in form and pre-existing data
    for (let row of formValues) {
      const exists = this.checkSubgroupExists(row);
      if (exists) {
        return;
      }
    }

    if (this.form.valid) {
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

    console.log('Sorted and Submitted Form', formValues);
    }
  }

  onCancel(): void {
    this.confirmationService.confirm({
      message: 'You have unsaved changes. Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
      // Clear only subgroupCode and marketName for each row, keeping marketCode intact
      this.rows.controls.forEach((control: AbstractControl) => {
        const row = control as FormGroup; // Cast to FormGroup
        row.get('subgroupCode')?.setValue('');  // Clear only subgroupCode
        row.get('marketName')?.setValue('');     // Clear only marketName
      });
      },
      reject: () => {}
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
