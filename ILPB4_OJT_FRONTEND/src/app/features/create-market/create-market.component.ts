import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { MarketService } from '../../core/services/market.service';
import { RegionService } from '../../core/services/region.service';
import { Market } from '../../core/models/market';
import { Region } from '../../core/models/region'; // Make sure to import the correct Region interface

@Component({
  selector: 'app-create-market',
  standalone: true,
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.css'],
  imports: [ReactiveFormsModule, RadioButtonModule, CommonModule, CheckboxModule], 
})
export class CreateMarketComponent implements OnInit {
  marketForm!: FormGroup;
  regions: Region[] = [];
  subregions: Region[] = [];
  selectedRegion: number | null = null;
  selectedSubregion: string | null = null;

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
        this.regions = regions; // No need to map since it already matches your interface structure
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
        this.subregions = subregions; // No need to map since it already matches your interface structure
        this.selectedSubregion = null; // Clear the selected subregion
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
        },
        error => {
          console.error('Error creating market:', error);
        }
      );
    }
  }
}
