import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common'; // Importing standalone directives

@Component({
  selector: 'app-navbar',
  standalone: true,  // Make it a standalone component
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [NgIf, NgClass]  // Import standalone Angular modules/directives here
})
export class NavbarComponent {
  dropdownVisible: boolean = false;

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  logout() {
    console.log('Logout clicked');
    // Add logic to log the user out
  }
}
