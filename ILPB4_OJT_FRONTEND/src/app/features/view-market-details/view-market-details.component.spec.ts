import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMarketDetailsComponent } from './view-market-details.component';

describe('ViewMarketDetailsComponent', () => {
  let component: ViewMarketDetailsComponent;
  let fixture: ComponentFixture<ViewMarketDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMarketDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMarketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
