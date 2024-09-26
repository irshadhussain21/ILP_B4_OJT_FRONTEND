import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MarketService } from '../../core/services/market.service';
import { RegionService } from '../../core/services/region.service';
import { Region } from '../../core/models/region';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Market } from '../../core/models/market';

@Component({
  selector: 'app-create-market',
  standalone: true, // Ensures this component is treated as standalone
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RadioButtonModule], // Import necessary modules
})
export class CreateMarketComponent implements OnInit {
  marketForm!: FormGroup;
  regions: Region[] = [];
  subregions: Region[] = [];
  selectedRegion: number | null = null;
  selectedSubregion: string | null = null;
  codeExistsError: boolean = false; // Flag to indicate if the market code already exists
  nameExistsError: boolean = false; // Flag to indicate if the market name already exists

  /**
   * Initializes the component with necessary services.
   * 
   * @param fb The FormBuilder service used to create the form group.
   * @param marketService The service used to manage market-related operations.
   * @param regionService The service used to manage region-related operations.
   * 
   * LLD:
   * - Injects required services: FormBuilder, MarketService, and RegionService.
   * - Sets up the necessary dependencies for form creation and service interactions.
   */
  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService
  ) {}

  /**
   * Angular lifecycle hook that initializes the form and loads regions.
   * 
   * @returns void
   * 
   * LLD:
   * 1. Initializes `marketForm` using `FormBuilder` with the required form controls and validations:
   *    - marketName: Required
   *    - marketCode: Required and max length of 2
   *    - longCode: Required
   *    - region: Required
   *    - subregion: Optional
   * 2. Calls `loadRegions()` to fetch available regions.
   * 3. Sets up value change subscriptions to check if the market code and name already exist.
   */
  ngOnInit(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: ['', [Validators.required, Validators.maxLength(2)]],
      longCode: ['', Validators.required],
      region: ['', Validators.required],
      subregion: ['']
    });

    this.loadRegions();

    // Check for market code existence
    this.marketForm.get('marketCode')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged(), // Ensure the value has actually changed
        switchMap(code => this.marketService.checkMarketCodeExists(code))
      )
      .subscribe(exists => {
        this.codeExistsError = exists;
        if (exists) {
          this.marketForm.get('marketCode')?.setErrors({ exists: true });
        }
      });

    // Check for market name existence
    this.marketForm.get('marketName')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged(), // Ensure the value has actually changed
        switchMap(name => this.marketService.checkMarketNameExists(name))
      )
      .subscribe(exists => {
        this.nameExistsError = exists;
        if (exists) {
          this.marketForm.get('marketName')?.setErrors({ exists: true });
        }
      });
  }

  /**
   * Fetches all regions from the RegionService and assigns them to the `regions` array.
   * 
   * @returns void
   * 
   * LLD:
   * 1. Calls `getAllRegions()` method from `RegionService` to fetch all regions.
   * 2. Subscribes to the response:
   *    - On success: Assigns the fetched regions to the `regions` array.
   *    - On error: Logs the error in the console.
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
   * Handles the selection of a region, sets the selected region, updates the form value,
   * and fetches subregions for the selected region.
   * 
   * @param regionId The ID of the selected region.
   * @returns void
   * 
   * LLD:
   * 1. Sets `selectedRegion` to the selected `regionId`.
   * 2. Updates the `region` form control with the selected `regionId`.
   * 3. Calls `getSubRegionsByRegion(regionId)` from `RegionService` to fetch subregions for the selected region.
   * 4. Subscribes to the response:
   *    - On success: Updates the `subregions` array with the fetched subregions and resets `selectedSubregion`.
   *    - On error: Logs the error in the console.
   */
  onRegionSelect(regionId: number): void {
    this.selectedRegion = regionId;
    this.marketForm.get('region')?.setValue(regionId);

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
   * Handles the selection of a subregion, sets the selected subregion, and updates the form value.
   * 
   * @param event The event triggered when a subregion is selected.
   * @param subregionId The ID of the selected subregion.
   * @returns void
   * 
   * LLD:
   * 1. Converts `subregionId` to a string and assigns it to `selectedSubregion`.
   * 2. Updates the `subregion` form control with the selected `subregionId`.
   */
  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  /**
   * Handles the form submission by calling the MarketService to create a new market entry.
   * 
   * @returns void
   * 
   * LLD:
   * 1. Checks if `marketForm` is valid.
   * 2. If valid:
   *    - Constructs `marketData` object containing `name`, `code`, `longMarketCode`, `region`, and `subRegion` from form values.
   *    - Calls `createMarket()` method of `MarketService` with `marketData`.
   *    - Subscribes to the response:
   *      - On success: Logs the success message and resets the form.
   *      - On error: Logs the error in the console.
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
