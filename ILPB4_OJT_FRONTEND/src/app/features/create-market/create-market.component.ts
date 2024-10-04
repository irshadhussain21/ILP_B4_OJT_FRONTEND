import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Market } from '../../core/models/market';
import { Region } from '../../core/models/region';
import { InputMaskModule } from 'primeng/inputmask';
import { HeaderComponent } from "../../shared/header/header.component";

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
  imports: [ReactiveFormsModule, CommonModule, RadioButtonModule, InputMaskModule, HeaderComponent],
})
export class CreateMarketComponent implements OnInit {
  /**
   * Represents the reactive form group for creating a market.
   */
  @Input() title: string = '';
  marketForm!: FormGroup;

  regions: Region[] = [];

  subregions: Region[] = [];

  selectedRegion: number | null = null;

  selectedSubregion: string | null = null;

  codeExistsError: boolean = false;

  nameExistsError: boolean = false;

  longCodeMask: string = 'a-aa.aa.aa';

  /**
   * Initializes the component with necessary services.
   * @param {FormBuilder} fb - FormBuilder for creating reactive forms.
   * @param {MarketService} marketService - Service for handling market-related operations.
   * @param {RegionService} regionService - Service for handling region-related operations.
   */
  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService
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

    // Listen to changes in marketCode and region to auto-update longCode
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
            this.marketForm.get('marketCode')?.setErrors(null);
            return [false];
          }
          return this.marketService.checkMarketCodeExists(code);
        })
      )
      .subscribe((exists) => {
        this.codeExistsError = exists;
        if (exists) {
          this.marketForm.get('marketCode')?.setErrors({ exists: true });
        } else {
          this.marketForm.get('marketCode')?.setErrors(null);
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
            this.marketForm.get('marketName')?.setErrors(null);
            return [false];
          }
          return this.marketService.checkMarketNameExists(name);
        })
      )
      .subscribe((exists) => {
        this.nameExistsError = exists;
        if (exists) {
          this.marketForm.get('marketName')?.setErrors({ exists: true });
        } else {
          this.marketForm.get('marketName')?.setErrors(null);
        }
      });
  }

  /**
   * Updates the longCode field based on the selected region and market code.
   *
   * LLD:
   * 1. Fetch the selected region from the `regions` array using the region key.
   * 2. Concatenate the first character of the region value with 'XXXXX' and the `marketCode` to form the `longCode`.
   * 3. Update the `longCode` form control without emitting change events.
   */
  updateLongCode(): void {
    const regionCode = this.marketForm.get('region')?.value;
    const shortCode = this.marketForm.get('marketCode')?.value;

    if (regionCode && shortCode) {
      // The fixed parts of the long code are region and short code
      const longCode = `${regionCode}-${shortCode.toUpperCase()}.XX.XX`;
      this.marketForm.get('longCode')?.setValue(longCode, { emitEvent: false });
    }
  }
 

  // setCursorToEditable(event: any): void {
  //   const inputElement = event.target;
    
  //   // Move cursor to the start of the editable part (first __)
  //   const editableStart = 2; // Start position after "X-"
    
  //   setTimeout(() => {
  //     inputElement.setSelectionRange(editableStart, editableStart);
  //   }, 0);
  // }

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
      },
      (error) => {
        console.error('Error loading regions:', error);
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
      },
      (error) => {
        console.error('Error loading subregions:', error);
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

 // Ensure only the middle part is editable
 setCursorToEditable(event: any) {
  const inputElement = event.target;

  // Prevent default focus behavior (optional)
  event.preventDefault();

  // Manually set cursor position to where user can start typing
  // Assuming you want the cursor after the first part (_-)
  const editablePosition = 3; // adjust this based on your input mask format
  inputElement.setSelectionRange(editablePosition, editablePosition);
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
      };

      this.marketService.createMarket(marketData).subscribe(
        (response: number) => {
          console.log('Market created successfully:', response);
          this.marketForm.reset();
          this.codeExistsError = false;
          this.nameExistsError = false;
        },
        (error) => {
          console.error('Error creating market:', error);
        }
      );
    }
  }
}