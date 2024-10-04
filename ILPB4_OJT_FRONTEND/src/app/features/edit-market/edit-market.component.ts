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

/**
 * LLD
 *
 * This component is used to edit the details of an existing market.
 *
 * Execution Flow:
 *  - On initialization, the market ID is fetched from the route parameters.
 *  - Regions are loaded from the `RegionService` and populated in the form.
 *  - If an existing market is being edited, the market details are fetched using `marketId` and pre-populated in the form.
 *  - The `MarketService` is used to check if the market name or code already exists.
 *  - If the market code or name already exists, validation errors are shown.
 *  - The `longMarketCode` is dynamically generated based on the selected region and market code.
 *  - On form submission, the updated market data is sent to the backend.
 *
 * This screen contains the following actions:
 *  - Fetch Market Details: Retrieves the market details based on `marketId`.
 *  - Fetch Regions: Loads all available regions from the backend.
 *  - Fetch Subregions: Loads subregions based on the selected region.
 *  - Error Handling: Displays validation errors if the market name or code already exists.
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
  ],
  providers:[MessageService]
})
export class EditMarketComponent implements OnInit {
  title:string="Edit Market";
  marketForm!: FormGroup;
  regions: Region[] = [];
  subregions: Region[] = [];
  selectedRegion: number | null = null;
  selectedSubregion: string | null = null;
  codeExistsError: boolean = false;
  nameExistsError: boolean = false;
  marketId!: number;

  hasEditedCode = false;
  hasEditedName = false;

  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.marketId = +this.route.snapshot.paramMap.get('id')!;
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: ['', [Validators.required, Validators.maxLength(2)]],
      longCode: [
        '',
        [Validators.required, Validators.minLength(7), Validators.maxLength(7)],
      ],
      region: ['', Validators.required],
      subregion: [''],
    });

    this.loadRegions();
    this.fetchMarketData();

    this.marketForm
      .get('marketCode')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.updateLongCode();
        this.hasEditedCode = true;
      });

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
        if (exists && this.hasEditedCode) {
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
        if (exists && this.hasEditedName) {
          this.marketForm.get('marketName')?.setErrors({ exists: true });
        } else {
          this.marketForm.get('marketName')?.setErrors(null);
        }
      });
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
      (error) => {
        console.error('Error loading regions:', error);
      }
    );
  }

  /**
   * Fetches existing market data for editing.
   * The fetched data is then patched into the form.
   * Handles any errors during the fetch process.
   *
   * @returns void
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
        console.log(data);
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
   * @param regionId The selected region ID.
   * @returns void
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
   * @param event The change event object.
   * @param subregionId The selected subregion ID.
   * @returns void
   */
  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  /**
   * Dynamically generates the long market code based on the selected region and market code.
   *
   * @returns void
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
   *
   * @returns void
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
          // this.router.navigate(['/marketlist']);
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
