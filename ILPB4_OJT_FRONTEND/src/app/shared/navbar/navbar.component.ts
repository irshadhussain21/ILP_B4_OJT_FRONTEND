import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [NgIf, NgClass,RouterLink]
})
export class NavbarComponent {
  
  /**
   * Property: dropdownVisible
   * Represents whether the dropdown menu is visible or not.
   */
  dropdownVisible: boolean = false;

  /**
   * Method: toggleDropdown
   * Toggles the visibility of the dropdown menu.
   */
  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  /**
   * Method: logout
   * Logs out the current user and executes any logout-related logic.
   */
  logout() {
    console.log('Logout clicked');
    // Add logic to log the user out
  }
}