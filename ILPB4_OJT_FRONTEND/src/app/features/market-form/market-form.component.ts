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
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

/**Local imports */
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { Market, MarketSubgroup } from '../../core/models/market';
import { Region } from '../../core/models/region';
import { HeaderComponent } from '../../shared/header/header.component';
import { SubgroupComponent } from '../subgroup/subgroup.component';

@Component({
  selector: 'app-market-form',
  standalone: true,
  templateUrl: './market-form.component.html',
  styleUrls: ['./market-form.component.css'],
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
export class MarketFormComponent implements OnInit {
  marketForm!: FormGroup;
  title: string = 'Create Market';
  isEditMode: boolean = false;
  marketId?: number;
  regions: Region[] = [];
  subregions: Region[] = [];
  subGroups: MarketSubgroup[] = [];
  selectedRegion: number | null = null;
  selectedSubregion: string | null = null;
  codeExistsError: boolean = false;
  nameExistsError: boolean = false;
  hasEditedCode = false;
  hasEditedName = false;
  showSubgroupComponent: boolean = false;

  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private regionService: RegionService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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
        this.title = 'Edit Market';
        this.fetchMarketData(this.marketId); 
      }
    });
  }

  private initializeForm(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: [
        '',
        [Validators.required, Validators.maxLength(2), Validators.minLength(2)],
      ],
      longCode: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(20),
        ],
      ],
      region: ['', Validators.required],
      subregion: [''],
    });
  }

  private setupFieldListeners(): void {
    // this.marketForm.get('marketCode')?.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
    //   this.updateLongCode();
    // });

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
        this.updateLongCode();
      });

    this.marketForm
      .get('marketName')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name) => {
          if (!this.hasEditedName) return [false];
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

  onSubregionChange(event: any, subregionId: number): void {
    this.selectedSubregion = subregionId.toString();
    this.marketForm.get('subregion')?.setValue(subregionId);
  }

  onMarketCodeInput(event: KeyboardEvent) {
    const allowedChars = /^[a-zA-Z]+$/;

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

      // Show the SubgroupComponent if there are existing subgroups
      if (this.subGroups.length > 0) {
        this.showSubgroupComponent = true;
      }

      // Select the region and load subregions
      this.onRegionSelect(Number(data.region));
    });
  }

  getSubmitButtonText(): string {
    return this.isEditMode
      ? 'PAGE.BUTTONS.UPDATE_MARKET'
      : 'PAGE.BUTTONS.CREATE_MARKET';
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
        marketSubGroups: this.subGroups.map((subGroup) => ({
          subGroupId: subGroup.subGroupId || 0,
          subGroupName: subGroup.subGroupName,
          subGroupCode: subGroup.subGroupCode,
          marketId: subGroup.marketId || this.marketId,
          marketCode: subGroup.marketCode || this.marketForm.value.marketCode,
        })),
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
          detail: 'Market created successfully',
        });
        this.router.navigate(['/markets']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while creating the market',
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
          detail: 'Market updated successfully',
        });
        this.router.navigate(['/markets']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while updating the market',
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
      message: 'You have unsaved changes. Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.marketForm.reset();
        this.router.navigate(['/markets']);
      },
    });
  }

  showSubgroup() {
    this.showSubgroupComponent = true;
  }

  onSubGroupsChanged(subGroups: MarketSubgroup[]): void {
    this.subGroups = subGroups;
  }

  onNoRowsLeftChanged(event: {
    noRowsLeft: boolean;
    subGroups: MarketSubgroup[];
  }): void {
    this.subGroups = [...event.subGroups];
    if (event.noRowsLeft) {
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

  loadRegions(): void {
    this.regionService.getAllRegions().subscribe((regions) => {
      this.regions = regions;
    });
  }
}
