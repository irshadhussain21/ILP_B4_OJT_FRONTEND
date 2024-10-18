import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MarketService } from '../../services/market.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockMarketService: any;

  beforeEach(async () => {
    mockMarketService = {
      getMarketDetailsById: jest.fn().mockReturnValue(of({ name: 'Test Market' }))
    };

    await TestBed.configureTestingModule({
      imports: [BreadcrumbModule, HeaderComponent],  // PrimeNG Breadcrumb
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },  // Mock route params
        { provide: MarketService, useValue: mockMarketService }  // Mock MarketService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMarketDetailsById with the correct ID', () => {
    expect(mockMarketService.getMarketDetailsById).toHaveBeenCalledWith(1);
  });

  it('should update breadcrumb items based on market details', () => {
    fixture.detectChanges();  // Trigger another round of change detection to ensure updates
    const breadcrumbItems = fixture.debugElement.queryAll(By.css('.ui-breadcrumb-item'));
    expect(breadcrumbItems.length).toBe(3);  // Home, Markets, Test Market
    expect(breadcrumbItems[2].nativeElement.textContent).toContain('Test Market');  // Verify the market name
  });

  it('should display the correct title', () => {
    component.title = 'Test Title';
    fixture.detectChanges();  // Update after changing the title
    const titleElement = fixture.debugElement.query(By.css('h1'));
    expect(titleElement.nativeElement.textContent).toContain('Test Title');
  });
});
