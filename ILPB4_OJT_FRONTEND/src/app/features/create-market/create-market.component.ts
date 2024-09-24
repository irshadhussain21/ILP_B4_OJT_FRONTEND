import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
 // Import CheckboxModule for subregions
import { CommonModule } from '@angular/common'; // Required for *ngFor and other common directives
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-create-market',
  standalone: true, // Declare the component as standalone
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.css'],
  imports: [ReactiveFormsModule, RadioButtonModule, CommonModule,CheckboxModule] // Import necessary modules for standalone
})
export class CreateMarketComponent implements OnInit {
  marketForm!: FormGroup; // Using the `!` to assert that this will be initialized later
  regions = [
    { name: 'Europe', value: 'EURO' },
    { name: 'Latin America, Asia Pacific, and Africa', value: 'LAAPA' },
    { name: 'North America', value: 'NOAM' }
  ];

  // Subregions array will be updated based on the selected region
  subregions: any[] = [];
  selectedSubregions: string[] = []; // Array to hold selected subregions

  // Predefined subregions for each region
  allSubregions: Record<'EURO' | 'LAAPA' | 'NOAM', { name: string; value: string }[]> = {
    EURO: [{ name: 'Europe', value: 'Europe' }],
    LAAPA: [
      { name: 'Latin America', value: 'LatinAmerica' },
      { name: 'Asia Pacific', value: 'AsiaPacific' },
      { name: 'Africa', value: 'Africa' }
    ],
    NOAM: [{ name: 'North America', value: 'NorthAmerica' }]
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.marketForm = this.fb.group({
      marketName: ['', Validators.required],
      marketCode: ['', [Validators.required, Validators.maxLength(2)]],
      longCode: ['', Validators.required],
      region: ['', Validators.required],
      subregion: [''] // This is a placeholder field to validate subregions
    });
  }

  // Handle region selection
  onRegionSelect(regionValue: string): void {
    // Ensure that the regionValue is treated as the correct key type
    const regionKey = regionValue as keyof typeof this.allSubregions;

    if (regionKey in this.allSubregions) {
      this.subregions = this.allSubregions[regionKey] || [];
      this.selectedSubregions = []; // Clear selected subregions when region changes
    }
  }

  // Manage the selection of subregions
  onSubregionChange(event: any, subregionValue: string): void {
    if (event.checked) {
      this.selectedSubregions.push(subregionValue);
    } else {
      this.selectedSubregions = this.selectedSubregions.filter(subregion => subregion !== subregionValue);
    }

    // Set the value of the form control for validation purposes
    this.marketForm.get('subregion')?.setValue(this.selectedSubregions.length > 0 ? this.selectedSubregions : '');
  }

  onSubmit(): void {
    // Include the selected subregions in the form value
    const formData = { ...this.marketForm.value, subregions: this.selectedSubregions };
    console.log('Form submitted:', formData);
  }
}

