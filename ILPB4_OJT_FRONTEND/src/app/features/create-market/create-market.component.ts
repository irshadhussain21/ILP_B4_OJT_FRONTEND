import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** External Libraries */
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

/** Local imports */
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { Market, MarketSubgroup } from '../../core/models/market';
import { Region } from '../../core/models/region';
import { HeaderComponent } from '../../shared/header/header.component';
import { SubgroupComponent } from '../subgroup/subgroup.component';
import { CreateMarketConfig, RegionNames } from '../../config/market';
import { RegionEnum } from '../../core/enums/region.enum';

/**
 * LLD
 *
 * The `CreateMarketComponent` is responsible for creating and editing a market.
 * It allows users to input market details such as the market name, code, region, subregion,
 * and manage subgroups. The component supports both create and edit modes.
 *
 * Execution Flow:
 *  - On initialization (`ngOnInit`), the component determines whether it is in edit or create mode based
 *    on the presence of a market ID in the route parameters.
 *  - If in edit mode, the market details are fetched using the `MarketService`, and the form is populated.
 *  - Users can input market details and subgroup information, and the component handles validation and
 *    submission of the form.
 *
 * Main Actions:
 *  - Create Market: Allows users to create a new market by submitting the form data.
 *  - Edit Market: Allows users to modify existing market details and subgroups.
 *  - Error Handling: Validates the form inputs and handles cases where the market code or name already exists.
 *
 * Fields:
 *  - **Region**: Dropdown selection to choose the region for the market.
 *  - **Subregion**: Dropdown selection to choose the subregion under the selected region.
 *  - **Market Code**: Input field to enter a short code for the market, restricted to 2 alphabetic characters.
 *  - **Market Name**: Input field to enter the market name.
 *  - **Long Code**: Input field (masked) to display and edit the market's long code.
 *  - **Subgroups**: Section to add and manage subgroups within the market, which becomes available after entering market code/name.
 *
 * Buttons:
 *  - **Add Subgroup**: Button to display the subgroup form if the market code and name are valid.
 *  - **Submit (Create/Update Market)**: Button to submit the form data for either creating or updating a market.
 *  - **Cancel**: Button to reset the form and navigate back, with a confirmation prompt for unsaved changes.
 *
 * API Endpoints:
 *  - `GET /api/Market/{marketId}/details`: Fetches details for a specific market by its ID.
 *  - `POST /api/Market`: Creates a new market.
 *  - `PUT /api/Market/{marketId}`: Updates an existing market.
 *
 * Sample API Response:
 *  {
 *    "id": 1,
 *    "name": "Antarctica",
 *    "code": "AA",
 *    "longMarketCode": "L-AQ.AA.AA",
 *    "region": "LAAPA",
 *    "subRegion": "Africa",
 *    "marketSubGroups": [
 *      {
 *        "subGroupId": 1,
 *        "subGroupName": "Q-Island",
 *        "subGroupCode": "Q",
 *        "isDeleted": true,
 *        "isEdited": false
 *      }
 *    ]
 *  }
 */

@Component({
  selector: 'app-market-form',
  standalone: true,
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    TranslateModule,
    ToastModule,
    HeaderComponent,
    InputMaskModule,
    ConfirmDialogModule,
    SubgroupComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class CreateMarketComponent implements OnInit {
  isMarketFormValid: boolean = false;
  marketForm!: FormGroup;
  title: string = CreateMarketConfig.TITLE_CREATE;
  isEditMode: boolean = false;
  marketId?: number;
  regions: Region[] = [];
  subregions: Region[] = [];
  subGroups: MarketSubgroup[] = [];
  selectedRegion: number | null = null;
  selectedSubregion: string | null = null;
  hasCodeExistsError: boolean = false;
  hasNameExistsError: boolean = false;
  hasEditedCode: boolean = false;
  hasEditedName: boolean = false;

  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {}

  /**
   * On component initialization, it checks if the market ID is present in the route parameters
   * to determine if the component is in edit mode. It also initializes the form and loads the regions.
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadRegions();
    this.getRoute();
    this.setupFieldListeners();
  }

  /**
   * Retrieves the market ID from the route parameters and sets the component to edit mode if an ID is present.
   */
  getRoute() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.marketId = +params['id'];
        this.title = CreateMarketConfig.TITLE_EDIT;
        this.fetchMarketData(this.marketId);
      }
    });
  }

  /**
   * Initializes the form with required controls for market details.
   */
  initializeForm(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(CreateMarketConfig.MIN_MARKET_CODE_LENGTH),
          Validators.minLength(CreateMarketConfig.MAX_MARKET_CODE_LENGTH),
        ],
      ],
      longCode: [
        '',
        [
          Validators.required,
          Validators.minLength(CreateMarketConfig.MIN_LONG_CODE_LENGTH),
          Validators.maxLength(CreateMarketConfig.MAX_LONG_CODE_LENGTH),
        ],
      ],
      region: ['', Validators.required],
      subregion: [''],
    });

    this.marketForm.statusChanges.subscribe((status) => {
      this.isMarketFormValid = status === 'VALID';
    });
  }

  /**
   * Sets up listeners on specific form fields in the market form.
   *
   * The listeners include:
   * - 'region': Updates the long code whenever the region changes.
   * - 'marketCode': Adds a debounce for user input, checks if the code already exists,
   *   sets validation errors accordingly, and updates the long code.
   * - 'marketName': Adds a debounce for user input, checks if the name already exists,
   *   and sets validation errors based on the existence check.
   */
  setupFieldListeners(): void {
    this.marketForm
      .get('region')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.updateLongCode();
      });

    this.marketForm
      .get('marketCode')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((code) => {
          if (!this.hasEditedCode) return [false];
          this.hasCodeExistsError = false;
          if (!code) {
            this.marketForm.get('marketCode')?.setErrors({ required: true });
            return [false];
          }
          return this.marketService.checkMarketCodeExists(code);
        })
      )
      .subscribe((exists) => {
        this.hasCodeExistsError = exists;
        if (exists) {
          this.marketForm.get('marketCode')?.setErrors({ exists: true });
        }
        this.updateLongCode();
      });

    this.marketForm
      .get('marketName')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name) => {
          if (!this.hasEditedName) return [false];
          this.hasNameExistsError = false;
          if (!name) {
            this.marketForm.get('marketName')?.setErrors({ required: true });
            return [false];
          }
          return this.marketService.checkMarketNameExists(name);
        })
      )
      .subscribe((exists) => {
        this.hasNameExistsError = exists;
        if (exists) {
          this.marketForm.get('marketName')?.setErrors({ exists: true });
        }
      });
  }

  getRegionNames(regionId: number) {
    const regionID = regionId as RegionEnum;
    const regionName = RegionNames[regionID];
    return regionName;
  }
  /**
   * Handles the selection of a subregion and updates the subregion form control.
   * @param event - The event triggered by subregion selection.
   * @param subregionId - The ID of the selected subregion.
   */
  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  /**
   * Restricts the input in the market code field to allow only alphabetic characters.
   * @param event - The keyboard event triggered by user input.
   */
  onMarketCodeInput(event: KeyboardEvent) {
    const allowedChars = CreateMarketConfig.MARKET_CODE_VALIDATION_REGEX;
    const key = event.key;

    if (
      key === 'Backspace' ||
      key === 'Tab' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Delete' ||
      key === 'Escape'
    ) {
      return;
    }

    if (!allowedChars.test(key)) {
      event.preventDefault();
    }
  }

  getRegionName(regionId: number) {
    const regionEnum = regionId as RegionEnum;
    const regionName = RegionNames[regionEnum];
    return regionName;
  }
  /**
   * Updates the long code field based on the selected region and market code.
   */
  updateLongCode(): void {
    const region = this.regions.find(
      (r) => r.key === this.marketForm.get('region')?.value
    );
    const marketCode =
      this.marketForm.get('marketCode')?.value.toUpperCase() || '';

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
   * Fetches the market data for editing when the component is in edit mode.
   * @param marketId - The ID of the market to be edited.
   */
  fetchMarketData(marketId: number): void {
    this.marketService.getMarketDetailsById(marketId).subscribe((data) => {
      this.marketForm.patchValue({
        marketName: data.name,
        marketCode: data.code,
        longCode: data.longMarketCode,
        region: data.region,
        subregion: data.subRegion,
      });
      this.subGroups = data.marketSubGroups || [];

      this.onRegionSelect(Number(data.region));
    });
  }

  /**
   * Gets the text for the submit button, which varies depending on whether the component is in create or edit mode.
   */
  getSubmitButtonText(): string {
    return this.isEditMode
      ? CreateMarketConfig.BUTTONS.UPDATE_MARKET
      : CreateMarketConfig.BUTTONS.CREATE_MARKET;
  }

  /**
   * Handles form submission to either create or update a market based on the mode.
   */
  onSubmit(): void {
    if (this.marketForm.valid) {

      let longCode = this.marketForm.value.longCode;
      const formattedLongCode = this.applyLongCodeFormat(longCode);
      const marketData: Market = {
        name: this.marketForm.value.marketName,
        code: this.marketForm.value.marketCode,
        longMarketCode: formattedLongCode.toUpperCase(),
        region: this.marketForm.value.region,
        subRegion: this.marketForm.value.subregion,
        marketSubGroups:
          this.subGroups.length > 0
            ? this.subGroups.map((subGroup) => ({
                subGroupId: subGroup.subGroupId || null,
                subGroupName: subGroup.subGroupName,
                subGroupCode: subGroup.subGroupCode,
                marketCode: subGroup.marketCode || this.marketForm.value.marketCode,
                isEdited: subGroup.isEdited || false,
                isDeleted: subGroup.isDeleted || false,
              }))
            : [],
      };

      if (this.isEditMode) {
        this.updateMarket(marketData);
      } else {
        this.createMarket(marketData);
      }
    }
  }

  /**
   * Creates a new market by submitting the form data to the backend API.
   * @param marketData - The form data to create a new market.
   */
  createMarket(marketData: Market): void {
    this.marketService.createMarket(marketData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translateService.instant(
            CreateMarketConfig.MESSAGES.SUCCESS_MESSAGES.MARKET_CREATED
          ),
        });
        setTimeout(() => {
          this.router.navigate(['/markets']);
        }, 1000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translateService.instant(
            CreateMarketConfig.MESSAGES.ERROR_MESSAGES.CREATE
          ),
        });
      },
    });
  }

  /**
   * Updates the existing market with new form data by sending a PUT request to the API.
   * @param marketData - The updated market data to be submitted.
   */
  updateMarket(marketData: Market): void {
    this.marketService.updateMarket(this.marketId!, marketData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translateService.instant(
            CreateMarketConfig.MESSAGES.SUCCESS_MESSAGES.MARKET_UPDATED
          ),
        });
        setTimeout(() => {
          this.router.navigate(['/markets']);
        }, 1000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translateService.instant(
            CreateMarketConfig.MESSAGES.ERROR_MESSAGES.UPDATE
          ),
        });
      },
    });
  }

  /**
   * Handles the selection of a region, updates the region form control, and loads the corresponding subregions.
   * @param regionId - The ID of the selected region.
   */
  onRegionSelect(regionId: number): void {
    this.selectedRegion = regionId;
    this.marketForm.get('region')?.setValue(regionId);
    this.updateLongCode();

    this.regionService
      .getSubRegionsByRegion(regionId)
      .subscribe((subregions) => {
        this.subregions = subregions;
        this.selectedSubregion = null;
      });
  }

  /**
   * Cancels the form action and confirms with the user before resetting the form and navigating away.
   */
  onCancel(): void {
    this.confirmationService.confirm({
      message: this.translateService.instant(
        CreateMarketConfig.MESSAGES.CONFIRM_MESSAGES.CONFIRM_CANCEL
      ),
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.marketForm.reset();
        this.router.navigate(['/markets']);
      },
    });
  }

  /**
   * Updates the market's subgroup list when changes are emitted from the SubGroupComponent.
   * Clears form errors if all subgroups are marked as deleted.
   *
   * @param event - An object containing the updated list of subgroups.
   * @param event.subGroups - The array of MarketSubgroup objects reflecting the current state of subgroups.
   */
  onSubGroupsChanged(event: { subGroups: MarketSubgroup[] }): void {
    this.subGroups = [...event.subGroups];
    const allSubgroupsDeleted = this.subGroups.every(
      (subGroup) => subGroup.isDeleted
    );

    if (allSubgroupsDeleted) {
      this.marketForm.setErrors(null);
    }
  }

  /**
   * Updates the market form's validation state based on subgroup errors.
   * @param hasErrors - Indicates whether subgroup errors are present.
   */
  onSubgroupErrorsFound(hasErrors: boolean): void {
    if (hasErrors) {
      this.marketForm.setErrors({ subgroupErrors: true });
    } else {
      if (this.marketForm.errors?.['subgroupErrors']) {
        const errors = { ...this.marketForm.errors };
        delete errors['subgroupErrors'];
        this.marketForm.setErrors(
          Object.keys(errors).length > 0 ? errors : null
        );
      }
    }
  }

  /**
   * Loads all available regions from the backend API to populate the region selection dropdown.
   */
  loadRegions(): void {
    this.regionService.getAllRegions().subscribe((regions) => {
      this.regions = regions;
    });
  }
  // Helper method to format longCode
  applyLongCodeFormat(longCode: string): string {
   
     const formattedCode = longCode.replace(/([A-Z])([A-Z]{2})([A-Z]{2})([A-Z]{2})/, '$1-$2.$3.$4');
    return formattedCode;
  }
}
