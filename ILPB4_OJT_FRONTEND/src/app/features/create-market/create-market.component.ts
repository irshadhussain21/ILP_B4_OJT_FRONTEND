import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MarketService } from '../../core/services/market.service';
import { SubGroupComponent } from "../sub-group/sub-group.component";
import { RegionService } from '../../core/services/region.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Market } from '../../core/models/market';
import { Region } from '../../core/models/region';

@Component({
  selector: 'app-create-market',
  standalone: true, 
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RadioButtonModule], 
})
export class CreateMarketComponent implements OnInit {
  /**
   * Represents the reactive form group for creating a market.
   */
  marketForm!: FormGroup;

  /**
   * Holds a list of available regions for selection.
   */
  regions: Region[] = [];

  /**
   * Will be populated with subregions based on the selected region.
   */
  subregions: Region[] = [];

  /**
   * The currently selected region ID.
   */
  selectedRegion: number | null = null;

  /**
   * The currently selected subregion value.
   */
  selectedSubregion: string | null = null;

  /**
   * Flag to indicate if the market code already exists.
   */
  codeExistsError: boolean = false;

  /**
   * Flag to indicate if the market name already exists.
   */
  nameExistsError: boolean = false;

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
      longCode: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(7)]], 
      region: ['', Validators.required],
      subregion: ['']
    });

    this.loadRegions();

    // Listen to changes in marketCode and region to auto-update longCode
    this.marketForm.get('marketCode')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.updateLongCode());

    this.marketForm.get('region')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.updateLongCode());

    // Check if market code exists
    this.marketForm.get('marketCode')?.valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged(), 
        switchMap(code => {
          this.codeExistsError = false;
          if (!code) {
            this.marketForm.get('marketCode')?.setErrors(null);
            return [false];
          }
          return this.marketService.checkMarketCodeExists(code);
        })
      )
      .subscribe(exists => {
        this.codeExistsError = exists;
        if (exists) {
          this.marketForm.get('marketCode')?.setErrors({ exists: true });
        } else {
          this.marketForm.get('marketCode')?.setErrors(null);
        }
      });

    // Check if market name exists
    this.marketForm.get('marketName')?.valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged(), 
        switchMap(name => {
          this.nameExistsError = false;
          if (!name) {
            this.marketForm.get('marketName')?.setErrors(null);
            return [false];
          }
          return this.marketService.checkMarketNameExists(name);
        })
      )
      .subscribe(exists => {
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
  private updateLongCode(): void {
    const region = this.regions.find(r => r.key === this.marketForm.get('region')?.value);
    const marketCode = this.marketForm.get('marketCode')?.value || '';

    if (region && marketCode.length === 2) {
      const firstChar = region.value.charAt(0).toUpperCase();
      const newLongCode = `${firstChar}XXXXX${marketCode}`;
      this.marketForm.get('longCode')?.setValue(newLongCode, { emitEvent: false });
    } else if (region) {
      const firstChar = region.value.charAt(0).toUpperCase();
      this.marketForm.get('longCode')?.setValue(firstChar, { emitEvent: false });
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
      },
      error => {
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
      error => {
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
        subRegion: this.marketForm.value.subregion
      };

      this.marketService.createMarket(marketData).subscribe(
        (response: number) => {
          console.log('Market created successfully:', response);
          this.marketForm.reset();
          this.codeExistsError = false; 
          this.nameExistsError = false; 
        },
        error => {
          console.error('Error creating market:', error);
        }
      );
    }
  }
}