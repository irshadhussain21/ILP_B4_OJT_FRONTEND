import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { SubGroupComponent } from "../sub-group/sub-group.component"; // Required for *ngFor and other common directives

@Component({
  selector: 'app-create-market',
  standalone: true, // Declare the component as standalone
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.css'],
  imports: [ReactiveFormsModule, RadioButtonModule, CommonModule, SubGroupComponent] // Import necessary modules for standalone
 // Import necessary modules for standalone
})
export class CreateMarketComponent implements OnInit {
  marketForm: FormGroup;

  regions = [
    { name: 'EURO - Europe', value: 'euro' },
    { name: 'LAAPA - Latin America, Asia Pacific and Africa', value: 'laapa' },
    { name: 'NOAM - North America', value: 'noam' }
  ];

  constructor(private fb: FormBuilder) {
    this.marketForm = this.fb.group({
      region: [null, Validators.required],
      shortCode: [null, [Validators.required, Validators.maxLength(2)]],
      marketName: [null, Validators.required],
      longCode: [null, Validators.required],
      subGroups: this.fb.array([])
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.marketForm.valid) {
      console.log(this.marketForm.value);
    }
  }
}
