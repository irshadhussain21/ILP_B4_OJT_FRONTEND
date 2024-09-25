import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketlistComponent } from './market-list.component';

describe('MarketlistComponent', () => {
  let component: MarketlistComponent;
  let fixture: ComponentFixture<MarketlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
