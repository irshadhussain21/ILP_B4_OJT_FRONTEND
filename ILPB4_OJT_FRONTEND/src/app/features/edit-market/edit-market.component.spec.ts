import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMarketComponent } from './edit-market.component';

describe('EditMarketComponent', () => {
  let component: EditMarketComponent;
  let fixture: ComponentFixture<EditMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMarketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
