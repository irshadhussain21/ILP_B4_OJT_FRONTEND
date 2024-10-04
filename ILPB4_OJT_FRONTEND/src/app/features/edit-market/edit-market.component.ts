import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HeaderComponent } from '../../shared/header/header.component';
import { InputMaskModule } from 'primeng/inputmask';

/**
 * LLD
 * 
 * This component is used to edit the details of an existing market.
 * 
 * Execution Flow:
 *  - On initialization, the market ID is fetched from the route parameters.
 *  - Regions are loaded from the `RegionService` and populated in the form.
 *  - If an existing market is being edited, the market details are fetched using `marketId` and pre-populated in the form.
 *  - The `MarketService` is used to check if the market name or code already exists, but only when the data has been changed by the user.
 *  - If the market code or name already exists, validation errors are shown only after edits.
 *  - The `longMarketCode` is dynamically generated based on the selected region and market code.
 *  - On form submission, the updated market data is sent to the backend for saving.
 *
 * This screen contains the following actions:
 *  - Fetch Market Details: Retrieves the market details based on `marketId`.
 *  - Fetch Regions: Loads all available regions from the backend.
 *  - Fetch Subregions: Loads subregions based on the selected region.
 *  - Error Handling: Displays validation errors if the market name or code already exists, but only after user edits.
 *  - Submit Updated Market: Sends the updated market data to the backend for saving.
 * 
 * API Endpoints:
 *  - `GET https://localhost:7058/api/Market/{id}/details`: Fetches details for a specific market.
 *  - `GET https://localhost:7058/api/Regions`: Fetches all regions.
 *  - `GET https://localhost:7058/api/Regions/{regionId}/subregions`: Fetches subregions for a specific region.
 *  - `PUT https://localhost:7058/api/Market/{id}`: Updates an existing market.
 *  - `GET https://localhost:7058/api/Market/checkCodeExists/{code}`: Checks if a market code exists.
 *  - `GET https://localhost:7058/api/Market/checkNameExists/{name}`: Checks if a market name exists.
 *
 * Sample API Response (Market Details):
 *  {
 *    "marketId": 1,
 *    "marketName": "Antarctica",
 *    "marketCode": "AA",
 *    "longMarketCode": "L-AQ.AA.AA",
 *    "region": "LAAPA",
 *    "subRegion": "Africa",
 *    "marketSubGroups": [
 *      {
 *        "subGroupId": 1,
 *        "subGroupName": "Q-Island",
 *        "subGroupCode": "Q"
 *      },
 *      {
 *        "subGroupId": 2,
 *        "subGroupName": "Ross Island",
 *        "subGroupCode": "R"
 *      }
 *    ]
 *  }
 */

@Component({
  selector: 'app-edit-market',
  standalone: true,
  templateUrl: './edit-market.component.html',
  styleUrls: ['./edit-market.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    TranslateModule,
    ToastModule,
    HeaderComponent,
    InputMaskModule,
  ],
  providers: [MessageService],
})
export class EditMarketComponent implements OnInit {
  /**
   * Represents the title of the form.
   */
  title: string = 'Edit Market';

  /**
   * The reactive form group that holds all the market data fields.
   */
  marketForm!: FormGroup;

  /**
   * List of all regions that will be displayed in the form.
   */
  regions: Region[] = [];

  /**
   * List of subregions based on the selected region.
   */
  subregions: Region[] = [];

  /**
   * Stores the selected region's key.
   */
  selectedRegion: number | null = null;

  /**
   * Stores the selected subregion's key.
   */
  selectedSubregion: string | null = null;

  /**
   * Flags to control whether the market code validation error is displayed.
   */
  codeExistsError: boolean = false;

  /**
   * Flags to control whether the market name validation error is displayed.
   */
  nameExistsError: boolean = false;

  /**
   * Stores the market ID from the route.
   */
  marketId!: number;

  /**
   * Flags to check if the user has edited the code.
   */
  hasEditedCode = false;

  /**
   * Flags to check if the user has edited the name.
   */
  hasEditedName = false;

  /**
   * Constructor to inject the necessary services and initialize the form builder.
   * 
   * @param fb - FormBuilder instance for handling form controls.
   * @param marketService - Service to interact with market-related API operations.
   * @param regionService - Service to fetch regions and subregions from the backend.
   * @param route - ActivatedRoute to get route parameters.
   * @param router - Router for navigation purposes.
   * @param messageService - Service to display success or error messages.
   */
  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  /**
   * Lifecycle hook to initialize the component.
   * - Fetches the market ID from the route.
   * - Initializes the form controls.
   * - Loads regions and market data.
   */
  ngOnInit(): void {
    this.marketId = +this.route.snapshot.paramMap.get('id')!;
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
    this.fetchMarketData();

    // Listen for changes in the marketCode field
    this.marketForm
      .get('marketCode')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.updateLongCode();
        this.hasEditedCode = true;
      });

    // Listen for changes in the region field to update longCode
    this.marketForm
      .get('region')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => this.updateLongCode());

    // Perform code validation only when the user edits the marketCode
    this.marketForm
      .get('marketCode')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((code) => {
          if (!this.hasEditedCode) return [false];
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
        if (exists && this.hasEditedCode) {
          this.marketForm.get('marketCode')?.setErrors({ exists: true });
        } else {
          this.marketForm.get('marketCode')?.setErrors(null);
        }
      });

    // Perform name validation only when the user edits the marketName
    this.marketForm
      .get('marketName')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name) => {
          if (!this.hasEditedName) return [false];
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
        if (exists && this.hasEditedName) {
          this.marketForm.get('marketName')?.setErrors({ exists: true });
        } else {
          this.marketForm.get('marketName')?.setErrors(null);
        }
      });
  }

  /**
   * Fetches all regions from the `RegionService` and assigns them to the regions array.
   * Handles any errors during the fetch process.
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
   * Fetches the existing market data for editing.
   * The fetched data is then patched into the form.
   * Handles any errors during the fetch process.
   */
  fetchMarketData(): void {
    this.marketService.getMarketDetailsById(this.marketId).subscribe(
      (data: Market) => {
        this.marketForm.patchValue({
          marketName: data.name,
          marketCode: data.code,
          longCode: data.longMarketCode,
          region: data.region,
          subregion: data.subRegion,
        });
        this.onRegionSelect(Number(data.region));
      },
      (error) => {
        console.error('Error fetching market data:', error);
      }
    );
  }

  /**
   * Updates the selected region in the form and fetches subregions based on the selected region.
   * Dynamically updates the long market code based on the selected region and market code.
   *
   * @param regionId - The selected region ID.
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
   * Updates the selected subregion in the form when the user selects a new subregion.
   *
   * @param event - The change event object.
   * @param subregionId - The selected subregion ID.
   */
  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  /**
   * Dynamically generates the long market code based on the selected region and market code.
   */
  private updateLongCode(): void {
    const region = this.regions.find(
      (r) => r.key === this.marketForm.get('region')?.value
    );
    const marketCode = this.marketForm.get('marketCode')?.value || '';

    if (region && marketCode.length === 2) {
      const firstChar = region.value.charAt(0).toUpperCase();
      const newLongCode = `${firstChar}XXXXX${marketCode}`;
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
   * Submits the updated market form to the backend.
   * If the form is valid, the updated data is sent to the backend for saving.
   * Handles any errors during the submission process.
   */
  onSubmit(): void {
    if (this.marketForm.valid) {
      const marketData: Market = {
        id: this.marketId,
        name: this.marketForm.value.marketName,
        code: this.marketForm.value.marketCode,
        longMarketCode: this.marketForm.value.longCode,
        region: this.marketForm.value.region,
        subRegion: this.marketForm.value.subregion,
      };

      this.marketService.updateMarket(this.marketId, marketData).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Market is Successfully Edited',
          });
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while Editing the market',
          });
        }
      );
    }
  }
}
