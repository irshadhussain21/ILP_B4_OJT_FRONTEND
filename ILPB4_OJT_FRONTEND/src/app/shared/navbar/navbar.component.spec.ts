import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],  // Remove deprecated RouterTestingModule
      providers: [
        provideRouter([]),  // Provide an empty router configuration or define your routes here
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Trigger change detection
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

 

  it('should log out the user', () => {
    const logSpy = jest.spyOn(console, 'log');  // Jest spy to mock console.log
    component.logout();
    expect(logSpy).toHaveBeenCalledWith('Logout clicked');
  });

  it('should display the logo with the correct routerLink', () => {
    const logo = fixture.debugElement.query(By.css('.logo'));
    expect(logo.nativeElement.getAttribute('routerLink')).toBe('/');
  });

});
