import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MarketService } from '../../services/market.service';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Market, MarketSubgroup } from '../../core/models/market';
import { Region } from '../../core/models/region';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { InputMaskModule } from 'primeng/inputmask';
import { RegionService } from '../../services/region.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SubgroupComponent } from "../subgroup/subgroup.component";

/**
 * LLD
 *
 * This component is used to create a new market with the specified details.
 *
 * Execution Flow:
 *  - On initialization, the `marketForm` is created to capture market details.
 *  - Regions are fetched using the `RegionService` and populated in the form.
 *  - The `MarketService` is used to validate if the market code or name already exists.
 *  - The long market code is generated based on the selected region and market code.
 *  - On form submission, the entered data is sent to the backend to create a new market.
 *
 * This screen contains the following actions:
 *  - Create New Market: Captures details like market name, code, region, and subregion.
 *  - Fetch Regions: Loads available regions from the backend.
 *  - Fetch Subregions: Loads subregions based on the selected region.
 *  - Error Handling: Validates market code and name for uniqueness and handles API errors.
 *
 * API Endpoints:
 *  - `POST https://localhost:7058/api/Market`: Creates a new market.
 *  - `GET https://localhost:7058/api/Regions`: Fetches all regions.
 *  - `GET https://localhost:7058/api/Regions/{regionId}/subregions`: Fetches subregions for a specific region.
 *  - `GET https://localhost:7058/api/Market/checkCodeExists/{code}`: Checks if a market code exists.
 *  - `GET https://localhost:7058/api/Market/checkNameExists/{name}`: Checks if a market name exists.
 *
 * Sample API Response (Create Market):
 *  {
 *    "marketId": 1,
 *    "message": "Market created successfully"
 *  }
 */

@Component({
  selector: 'app-create-market',
  standalone: true,
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    TranslateModule,
    ToastModule,
    HeaderComponent,
    InputMaskModule,
    ConfirmDialogModule,
    SubgroupComponent
],
  providers: [MessageService, ConfirmationService],
})
export class CreateMarketComponent implements OnInit {

  title:string="Create Market";

  marketForm!: FormGroup;

  regions: Region[] = [];

  subregions: Region[] = [];

  selectedRegion: number | null = null;

  selectedSubregion: string | null = null;

  codeExistsError: boolean = false;

  nameExistsError: boolean = false;

  longCodeMask: string = 'a-aa.aa.aa';

  showSubgroupComponent: boolean = false;

  subGroups: MarketSubgroup[] = [];

  /**
   * Initializes the component with necessary services.
   * @param {FormBuilder} fb - FormBuilder for creating reactive forms.
   * @param {MarketService} marketService - Service for handling market-related operations.
   * @param {RegionService} regionService - Service for handling region-related operations.
   */
  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService ,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  /**
   * Lifecycle hook that initializes the form and sets up value change subscriptions.
   * This method also loads regions and sets up validators for checking market code and name existence.
   *
   * @returns void
   *
   * LLD:
   * 1. Initialize the `marketForm` with controls for `marketName`, `marketCode`, `longCode`, `region`, and `subregion`.
   * 2. Load available regions by calling `loadRegions()`.
   * 3. Set up subscriptions to listen for changes to `marketCode` and `region` fields to update `longCode`.
   * 4. Set up validation checks for `marketCode` and `marketName` existence using the `marketService`.
   */
  ngOnInit(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: ['', [Validators.required, Validators.maxLength(2)]],
      longCode: [
        '',
        [Validators.required, Validators.minLength(7), Validators.maxLength(20)],
      ],
      region: ['', Validators.required],
      subregion: [''],
    });

    this.loadRegions();

    this.marketForm
      .get('marketCode')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.updateLongCode());

    this.marketForm
      .get('region')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => this.updateLongCode());

      this.marketForm
      .get('marketCode')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((code) => {
          this.codeExistsError = false;
          if (!code) {
            this.marketForm.get('marketCode')?.setErrors({ required: true });
            return [false];
          }
          return this.marketService.checkMarketCodeExists(code);
        })
      )
      .subscribe((exists) => {
        this.codeExistsError = exists;
        if (exists) {
          this.marketForm.get('marketCode')?.setErrors({ exists: true });
        }
      });

    this.marketForm
      .get('marketName')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name) => {
          this.nameExistsError = false;
          if (!name) {
            this.marketForm.get('marketName')?.setErrors({ required: true });
            return [false];
          }
          return this.marketService.checkMarketNameExists(name);
        })
      )
      .subscribe((exists) => {
        this.nameExistsError = exists;
        if (exists) {
          this.marketForm.get('marketName')?.setErrors({ exists: true });
        }
      });    
    }

  showSubgroup() {
    this.showSubgroupComponent = true;
  }

  /**
   * Updates the longCode field based on the selected region and market code.
   *
   * LLD:
   * 1. Fetch the selected region from the `regions` array using the region key.
   * 2. Concatenate the first character of the region value with 'XXXXX' and the `marketCode` to form the `longCode`.
   * 3. Update the `longCode` form control without emitting change events.
   */
  private updateLongCode(): void {
  
    const region = this.regions.find(
      (r) => r.key === this.marketForm.get('region')?.value
    );
    const marketCode = this.marketForm.get('marketCode')?.value.toUpperCase()|| '';
    
    if (region && marketCode.length === 2) {
      const firstChar = region.value.charAt(0).toUpperCase();
     
      const newLongCode = `${firstChar}XXXX${marketCode}`;
      this.marketForm
        .get('longCode')
        ?.setValue(newLongCode, { emitEvent: false });
    } else if (region) {
      const firstChar = region.value.charAt(0).toUpperCase();
      this.marketForm
        .get('longCode')
        ?.setValue(firstChar, { emitEvent: false });
    } else {
      this.marketForm.get('longCode')?.setValue('', { emitEvent: false });
    }
  }

  /**
   * Fetches all regions from the RegionService and assigns them to the `regions` array.
   * Handles any errors during the fetch process.
   *
   * @returns void
   */
  loadRegions(): void {
    this.regionService.getAllRegions().subscribe(
      (regions: Region[]) => {
        this.regions = regions;
      }
    );
  }

  /**
   * Handles the selection of a region and fetches corresponding subregions.
   *
   * @param {number} regionId - The ID of the selected region.
   * @returns void
   *
   * LLD:
   * 1. Set `selectedRegion` to `regionId` and update the `region` form control.
   * 2. Call `updateLongCode()` to adjust the `longCode` based on the selected region.
   * 3. Fetch subregions for the selected region from the `RegionService` and update the `subregions` array.
   */
  onRegionSelect(regionId: number): void {
    this.selectedRegion = regionId;
    this.marketForm.get('region')?.setValue(regionId);
    this.updateLongCode();

    this.regionService.getSubRegionsByRegion(regionId).subscribe(
      (subregions: Region[]) => {
        this.subregions = subregions;
        this.selectedSubregion = null;
      }
    );
  }

  /**
   * Handles the change event when a subregion is selected.
   *
   * @param {any} event - The event object triggered by the selection change.
   * @param {number} subregionId - The ID of the selected subregion.
   * @returns void
   */
  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  onSubGroupsChanged(subGroups: MarketSubgroup[]): void {
    this.subGroups = subGroups;
  }

  onNoRowsLeftChanged(event : { noRowsLeft: boolean, subGroups: MarketSubgroup[] }): void {
    this.subGroups = [...event.subGroups];
    if(event.noRowsLeft){
      this.showSubgroupComponent = false;
    }
  }

  onHasErrorsChanged(hasErrors: boolean): void {
    if (hasErrors) {
      this.marketForm.setErrors({ subgroupErrors: true });
    } else {
      this.marketForm.setErrors(null);
    }
  }

 setCursorToEditable(event: any) {
  const inputElement = event.target;
  const start = 2; 
  const end = 8;   

  
  setTimeout(() => {
    inputElement.setSelectionRange(start, start); 
  }, 0);


   inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
    const cursorPosition = inputElement.selectionStart;
    if (cursorPosition && (cursorPosition < start || cursorPosition > end)) {
      e.preventDefault(); 
    }
  });
}

  /**
   * Submits the market creation form, validates the form data, and sends it to the MarketService.
   *
   * LLD:
   * 1. Validate the form to ensure all required data is present.
   * 2. Construct a `Market` object from the form values.
   * 3. Call `createMarket()` in `MarketService` to submit the data.
   * 4. Reset the form and error flags upon successful creation.
   * 5. Handle errors appropriately if the API call fails.
   */
  onSubmit(): void {
    if (this.marketForm.valid) {
      const marketData: Market = {
        name: this.marketForm.value.marketName,
        code: this.marketForm.value.marketCode,
        longMarketCode: this.marketForm.value.longCode,
        region: this.marketForm.value.region,
        subRegion: this.marketForm.value.subregion,
        marketSubGroups: this.subGroups.map(subGroup => ({
          subGroupName: subGroup.subGroupName,
          subGroupCode: subGroup.subGroupCode,
          marketCode: this.marketForm.value.marketCode
        }))
      };
  
      this.marketService.createMarket(marketData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Market is Successfully added',
          });
          this.resetForm();
          this.router.navigate(['/marketlist']);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while adding the market',
          });
        }
      });
    }
  }
  

  private resetForm(): void {
    this.marketForm.reset();
    this.codeExistsError = false;
    this.nameExistsError = false;
    this.subGroups = [];
  }

  onCancel(): void {
    this.confirmationService.confirm({
      message: 'You have unsaved changes. Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.marketForm.reset();
        this.router.navigate(['/marketlist']);
      }
    });
  }
}