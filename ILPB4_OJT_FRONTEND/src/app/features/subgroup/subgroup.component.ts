import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
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
import { debounceTime } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

/**
 * LLD (Low-Level Design)
 *
 * The `SubgroupComponent` is responsible for managing the subgroups associated with a market.
 * It allows users to dynamically add, edit, and delete subgroups within a market.
 * The component handles form control, validation, and communicates changes back to the parent component.
 *
 * Execution Flow:
 *  - On initialization (`ngOnInit`), the component initializes the form and loads existing subgroups if a market ID is provided.
 *  - The form is set up with dynamic rows for each subgroup, and value changes are monitored for validation and event emission.
 *  - When a market code changes, the form rows are updated accordingly.
 *
 * Main Actions:
 *  - Load Subgroups: Fetches existing subgroups for a market and populates the form.
 *  - Add Subgroup: Allows users to add a new subgroup row to the form.
 *  - Delete Subgroup: Allows users to remove a subgroup row from the form, with a confirmation dialog.
 *  - Emit Changes: Emits valid subgroups and form status changes to the parent component.
 *
 * Fields:
 *  - **SubGroup Code**: Input field for the subgroup code, restricted to 1 alphanumeric character.
 *  - **SubGroup Name**: Input field for the subgroup name.
 *
 * Buttons:
 *  - **Add Subgroup**: Button to add a new subgroup row to the form.
 *  - **Delete Subgroup**: Icon to delete an existing subgroup row from the form, with confirmation.
 *
 * API Endpoints:
 *  - `GET /api/MarketSubGroup?marketId=${marketId}`: Fetches subgroups for a specific market by its ID.
 *
 * Sample API Response:
 *  [
 *    {
 *      "subGroupId": 1,
 *      "subGroupName": "Place 1",
 *      "subGroupCode": "P",
 *      "marketId": 1,
 *      "isDeleted": false,
 *      "isEdited": false
 *    }
 *  ]
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
    TranslateModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './subgroup.component.html',
  styleUrls: ['./subgroup.component.scss'],
})
export class SubgroupComponent implements OnInit {
  @Input() marketCode: string = '';
  @Input() marketId?: number;
  @Input() isMarketFormValid: boolean | undefined;
  @Output() subGroupsChanged = new EventEmitter<{
    subGroups: MarketSubgroup[];
  }>();
  @Output() isSubGroupFormInvalid = new EventEmitter<boolean>();

  showSubgroup: boolean = false;

  form!: FormGroup;

  subGroups: MarketSubgroup[] = [];

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private marketSubgroupService: MarketSubgroupService
  ) {}

  /**
   * Lifecycle hook for component initialization.
   * Initializes the form and loads existing subgroups if `marketId` is provided.
   * Subscribes to form value and status changes for validation and event emission.
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadSubGroupsIfMarketIdExists();
    this.subscribeToFormChanges();
  }

  /**
   * Lifecycle hook to handle input changes.
   * Updates the form with the new `marketCode` whenever it changes.
   * 
   * @param changes - Object containing the changed properties of inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.handleMarketCodeChange(changes);
  }

  /**
   * Handles changes to the market code.
   * Updates the market code in each form row without triggering change events.
   * 
   * @param changes - Object containing the current and previous market code values.
   */
  handleMarketCodeChange(changes: SimpleChanges): void {
    if (changes['marketCode'] && changes['marketCode'].currentValue) {
      this.marketCode = changes['marketCode'].currentValue.toUpperCase();

      this.rows.controls.forEach((row) => {
        row.get('marketCode')?.setValue(this.marketCode, { emitEvent: false });
      });
    }
  }

  /**
   * Initializes the form structure with a `FormArray` for subgroup rows.
   */
  initializeForm(): void {
    this.form = this.fb.group({
      rows: this.fb.array([]),
    });
  }

  /**
   * Loads existing subgroups if `marketId` is provided.
   * Adds a new empty row if no subgroups are found.
   */
  loadSubGroupsIfMarketIdExists(): void {
    if (this.marketId) {
      this.loadSubGroups();
    } else {
      this.addRow();
    }
  }

  /**
   * Subscribes to form value and status changes.
   * Debounces value changes for performance and emits subgroup data to the parent component.
   */
  subscribeToFormChanges(): void {
    this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.emitValidSubGroups();
    });

    this.form.statusChanges.subscribe((status) => {
      const isInvalid = status === 'INVALID';
      this.isSubGroupFormInvalid.emit(isInvalid);
    });
  }

  /**
   * Ensures that the subgroup section is visible.
   * Adds a new row if all existing rows are marked as deleted.
   */
  showSubgroupFunc() {
    this.showSubgroup = true;
    if (this.rows.controls.every(row => row.get('isDeleted')?.value === true)) {
      this.addRow();
    }
  }

  /**
   * Emits valid subgroup data to the parent component and flags if the form is invalid.
   */
  emitValidSubGroups(): void {
    const validSubGroups = this.rows.controls
    .filter((row) => row.valid)
    .map((row) => row.value);
    
    const hasInvalidRow = this.rows.controls.some((row) => row.invalid);
    this.isSubGroupFormInvalid.emit(hasInvalidRow);
    this.subGroupsChanged.emit({ subGroups: validSubGroups });
  }

  /**
   * Loads subgroups for a given market ID via the service and populates the form.
   * If no subgroups are found, an empty row is added.
   */
  loadSubGroups(): void {
    this.marketSubgroupService.getSubgroups(this.marketId).subscribe({
      next: (subGroups: MarketSubgroup[]) => {
        if (subGroups.length > 0) {
          this.form.setControl(
            'rows',
            this.fb.array(subGroups.map((subGroup) => this.createRow(subGroup)))
          );
          this.showSubgroup = true;
        } else {
          this.addRow();
        }
      }
    });
  }

  /**
   * Getter for the form array of subgroup rows.
   * 
   * @returns FormArray - Array of form groups representing subgroup rows.
   */
  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  /**
   * Creates a form group (row) for a new or existing subgroup.
   * Sets up validation for the subgroup code and name, ensuring they are in uppercase.
   * 
   * @param subGroup - Optional `MarketSubgroup` object used to initialize the row.
   * @returns FormGroup - A form group representing a subgroup row.
   */
  createRow(subGroup?: MarketSubgroup): FormGroup {
    const row = this.fb.group(
      {
        subGroupId: [subGroup?.subGroupId || null],
        marketId: [subGroup?.marketId],
        marketCode: [this.marketCode],
        subGroupCode: [
          subGroup?.subGroupCode || '',
          [Validators.required, Validators.pattern('^[A-Za-z0-9]{1}$')],
        ],
        subGroupName: [subGroup?.subGroupName || '', Validators.required],
        isDeleted: [subGroup?.isDeleted || false],
        isEdited: [subGroup?.isEdited || false],
      },
      {
        validators: [
          this.duplicateSubgroupCodeValidator(),
          this.duplicateSubgroupNameValidator(),
        ],
      }
    );

    row.get('subGroupCode')?.valueChanges.subscribe((value) => {
      if (value && value !== value.toUpperCase()) {
        row
          .get('subGroupCode')
          ?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    if (row.get('subGroupId')?.value !== null) {
      row.get('isEdited')?.setValue(true, { emitEvent: false });
    }
    });

    row.get('subGroupName')?.valueChanges.subscribe((value) => {
      if (value && value !== value.toUpperCase()) {
        row
          .get('subGroupName')
          ?.setValue(value.toUpperCase(), { emitEvent: false });
      }
      if (row.get('subGroupId')?.value !== null) {
        row.get('isEdited')?.setValue(true, { emitEvent: false });
      }
    });
    return row;
  }

  /**
   * Validator for duplicate subgroup codes in the form.
   *
   * @returns ValidatorFn - A validator function that checks for duplicate subgroup codes.
   */
  duplicateSubgroupCodeValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const subGroupCode = formGroup.get('subGroupCode')?.value;
      const marketCode = formGroup.get('marketCode')?.value;
      const duplicate = this.rows.controls.some((otherRow) => {
        if (otherRow.get('isDeleted')?.value) {
          return false;
        }
        return (
          otherRow !== formGroup &&
          otherRow.get('subGroupCode')?.value === subGroupCode &&
          otherRow.get('marketCode')?.value === marketCode
        );
      });

      return duplicate ? { duplicateSubgroupCode: true } : null;
    };
  }

  /**
   * Validator for duplicate subgroup names in the form.
   *
   * @returns ValidatorFn - A validator function that checks for duplicate subgroup names.
   */
  duplicateSubgroupNameValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const subGroupName = formGroup.get('subGroupName')?.value;
      const marketCode = formGroup.get('marketCode')?.value;

      const duplicate = this.rows.controls.some((otherRow) => {
        if (otherRow.get('isDeleted')?.value) {
          return false;
        }
        return (
          otherRow !== formGroup &&
          otherRow.get('subGroupName')?.value === subGroupName &&
          otherRow.get('marketCode')?.value === marketCode
        );
      });

      return duplicate ? { duplicateSubgroupName: true } : null;
    };
  }

  /**
   * Adds a new subgroup row to the form.
   */
  addRow(): void {
    this.rows.push(this.createRow());
  }

  /**
   * Marks the selected row as deleted after confirmation.
   * Updates the subgroup visibility based on undeleted rows.
   * 
   * @param rowIndex - Index of the row to delete.
   */
  deleteRow(rowIndex: number): void {
    const rowsArray = this.form.get('rows') as FormArray | null;
    if (!rowsArray) {
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this subgroup?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const row = this.rows.at(rowIndex);
        row.get('isDeleted')?.setValue(true);
        this.emitValidSubGroups();
        this.showSubgroup = this.rows.controls.some(row => row.get('isDeleted')?.value === false);
      },
      reject: () => {},
    });
  }

  /**
   * Checks if any undeleted row is invalid, emitting the result.
   * Determines whether a new subgroup can be added.
   * 
   * @returns boolean - True if a new subgroup can be added.
   */
  canAddSubgroup(): boolean {
    const hasInvalidRow = this.rows.controls.some((row) =>!row.get('isDeleted')?.value && row.invalid);
    this.isSubGroupFormInvalid.emit(hasInvalidRow);
    return !hasInvalidRow;
  }  
}