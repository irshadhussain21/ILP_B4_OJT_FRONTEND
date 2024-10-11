import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketFormComponent } from './market-form.component';

describe('MarketFormComponent', () => {
  let component: MarketFormComponent;
  let fixture: ComponentFixture<MarketFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
