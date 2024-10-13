/**Angular Libraries */
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/**External Libraries */
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

/**Local imports */
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { Market, MarketSubgroup } from '../../core/models/market';
import { Region } from '../../core/models/region';
import { HeaderComponent } from '../../shared/header/header.component';
import { SubgroupComponent } from '../subgroup/subgroup.component';
import { CreateMarketConfig } from '../../config/create-market-config';
@Component({
  selector: 'app-market-form',
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
    SubgroupComponent,
  ],
  providers: [MessageService, ConfirmationService],
})


export class CreateMarketComponent implements OnInit {

  isFormValid: boolean = false;
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
  hasEditedCode = false;
  hasEditedName = false;

  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService:TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadRegions();
    this.getRoute();
    this.setupFieldListeners();
  }

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

  private initializeForm(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: [
        '',
        [Validators.required, Validators.maxLength(CreateMarketConfig.MIN_MARKET_CODE_LENGTH), Validators.minLength(CreateMarketConfig.MAX_MARKET_CODE_LENGTH)],
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

    this.marketForm.statusChanges.subscribe(status => {
      this.isFormValid = status === 'VALID';
    });
  }

  private setupFieldListeners(): void {


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

  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  onMarketCodeInput(event: KeyboardEvent) {
    const allowedChars =CreateMarketConfig.MARKET_CODE_VALIDATION_REGEX;

    const key = event.key;

    if (
      key === 'Backspace' ||
      key === 'Tab' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Delete' ||
      key === 'Escape'
    ) {
      return
    }

    if (!allowedChars.test(key)) {
      event.preventDefault();
    }
  }

  private updateLongCode(): void {
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

  getSubmitButtonText(): string {
    return this.isEditMode
      ? CreateMarketConfig.BUTTONS.UPDATE_MARKET
      : CreateMarketConfig.BUTTONS.CREATE_MARKET;
  }

  onSubmit(): void {
    if (this.marketForm.valid) {
      const marketData: Market = {
        id: this.marketId,
        name: this.marketForm.value.marketName,
        code: this.marketForm.value.marketCode,
        longMarketCode: this.marketForm.value.longCode,
        region: this.marketForm.value.region,
        subRegion: this.marketForm.value.subregion,
        marketSubGroups: this.subGroups.length > 0 ? this.subGroups.map((subGroup) => ({
          subGroupId: subGroup.subGroupId || 0,
          subGroupName: subGroup.subGroupName,
          subGroupCode: subGroup.subGroupCode,
          marketId: subGroup.marketId || this.marketId,
          marketCode: subGroup.marketCode || this.marketForm.value.marketCode,
        })) : [],
      };

      if (this.isEditMode) {
        this.updateMarket(marketData);
      } else {
        this.createMarket(marketData);
      }
    }
  }

  private createMarket(marketData: Market): void {
    this.marketService.createMarket(marketData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translateService.instant(CreateMarketConfig.MESSAGES.SUCCESS_MESSAGES.MARKET_CREATED),
        });
        setTimeout(()=>{
          this.router.navigate(['/markets']);
        },1000)
        
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translateService.instant(CreateMarketConfig.MESSAGES.ERROR_MESSAGES.CREATE),
        });
      },
    });
  }

  private updateMarket(marketData: Market): void {
    this.marketService.updateMarket(this.marketId!, marketData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translateService.instant(CreateMarketConfig.MESSAGES.SUCCESS_MESSAGES.MARKET_UPDATED),
        });
        setTimeout(()=>{
          this.router.navigate(['/markets']);
        },1000)
        
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:this.translateService.instant(CreateMarketConfig.MESSAGES.ERROR_MESSAGES.UPDATE),
        });
      },
    });
  }

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

  onCancel(): void {
    this.confirmationService.confirm({
      message: this.translateService.instant(CreateMarketConfig.MESSAGES.CONFIRM),
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.marketForm.reset();
        this.router.navigate(['/markets']);
      },
    });
  }

  onSubGroupsChanged(subGroups: MarketSubgroup[]): void {
    this.subGroups = subGroups;
    if (this.subGroups.length === 0) {
      this.marketForm.setErrors(null);
    }
  }

  onNoRowsLeftChanged(event: {
    noRowsLeft: boolean;
    subGroups: MarketSubgroup[];
  }): void {
    this.subGroups = [...event.subGroups];
    // Disable subgroup errors if no rows are left
    if (event.noRowsLeft) {
      this.marketForm.setErrors(null); // Clear errors related to subgroups
    }
  }

  onHasErrorsChanged(hasErrors: boolean): void {
    // Only set subgroup-related errors when there are subgroups
    if (this.subGroups.length > 0 && hasErrors) {
      this.marketForm.setErrors({ subgroupErrors: true });
    } else {
      this.marketForm.setErrors(null); // No subgroup errors if there are no subgroups or no errors
    }
  }  

  loadRegions(): void {
    this.regionService.getAllRegions().subscribe((regions) => {
      this.regions = regions;
    });
  }
}
