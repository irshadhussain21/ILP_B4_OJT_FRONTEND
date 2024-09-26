import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-edit-market',
  standalone: true,
  templateUrl: './edit-market.component.html',
  styleUrls: ['./edit-market.component.css'],
  imports: [ReactiveFormsModule, RadioButtonModule, CommonModule, CheckboxModule]
})
export class EditMarketComponent implements OnInit {

  /**
   * Represents the reactive form group for editing a market.
   */
  marketForm!: FormGroup;

  /**
   * Holds a list of available regions for selection.
   */
  regions = [
    { name: 'EUROPE', value: 'EURO' },
    { name: 'Latin America, Asia Pacific, and Africa', value: 'LAAPA' },
    { name: 'North America', value: 'NOAM' }
  ];

  /**
   * Will be populated with subregions based on the selected region.
   */
  subregions: any[] = [];

  /**
   * The currently selected region value.
   */
  selectedRegion: string | null = null;

  /**
   * The currently selected subregion value.
   */
  selectedSubregion: string | null = null;

  /**
   * Contains predefined subregions for each region.
   */
  allSubregions: Record<'EURO' | 'LAAPA' | 'NOAM', { name: string; value: string }[]> = {
    EURO: [{ name: 'Europe', value: 'Europe' }],
    LAAPA: [
      { name: 'Latin America', value: 'LatinAmerica' },
      { name: 'Asia Pacific', value: 'AsiaPacific' },
      { name: 'Africa', value: 'Africa' }
    ],
    NOAM: [{ name: 'North America', value: 'NorthAmerica' }]
  };

  /**
   * Initializes the component and sets up the FormBuilder.
   * 
   * @param fb The form builder used to create and manage form controls.
   */
  constructor(private fb: FormBuilder) {}

  /**
   * Lifecycle hook that initializes the form group with necessary form controls and validators.
   * This method also fetches existing market data for editing.
   */
  ngOnInit(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: ['', [Validators.required, Validators.maxLength(2)]],
      longCode: ['', Validators.required],
      region: ['', Validators.required],
      subregion: ['']
    });

    
    this.fetchMarketData();
  }

  /**
   * Fetches existing market data and sets it in the form.
   */
  fetchMarketData(): void {
    const existingMarketData = {
      marketName: 'Sample Market',
      marketCode: 'SM',
      longCode: 'SAMPLE123',
      region: 'EURO',
      subregion: 'Europe'
    };

    this.marketForm.patchValue(existingMarketData);
    this.onRegionSelect(existingMarketData.region);
    this.selectedSubregion = existingMarketData.subregion;
  }

  /**
   * Handles the selection of a region and updates the subregions array accordingly.
   * 
   * @param regionValue The selected region value.
   */
  onRegionSelect(regionValue: string): void {
    this.selectedRegion = regionValue;
    const regionKey = regionValue as keyof typeof this.allSubregions;

    if (regionKey in this.allSubregions) {
      this.subregions = this.allSubregions[regionKey] || [];
      if (!this.subregions.some(subregion => subregion.value === this.selectedSubregion)) {
        this.selectedSubregion = null;
      }
    }
  }

  /**
   * Handles the selection of a subregion and sets it as the currently selected subregion.
   * 
   * @param event The event triggered by selecting a subregion.
   * @param subregionValue The value of the subregion being selected.
   */
  onSubregionChange(event: any, subregionValue: string): void {
    this.selectedSubregion = subregionValue;
    this.marketForm.get('subregion')?.setValue(subregionValue);
  }

  /**
   * Called when the form is submitted. Combines the form data with the selected subregion and logs the complete data.
   */
  onSubmit(): void {
    const formData = { ...this.marketForm.value, subregions: this.selectedSubregion };
    console.log('Form submitted:', formData);
  }
}
