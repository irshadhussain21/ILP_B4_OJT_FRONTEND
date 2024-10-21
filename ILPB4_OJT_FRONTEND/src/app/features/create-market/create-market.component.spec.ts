import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateMarketComponent } from './create-market.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MarketService } from '../../services/market.service';
import { RegionService } from '../../services/region.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService, TranslateLoader, TranslateStore } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock TranslateLoader
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('CreateMarketComponent', () => {
  let component: CreateMarketComponent;
  let fixture: ComponentFixture<CreateMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateMarketComponent,
        ReactiveFormsModule,
        FormsModule,
        RadioButtonModule,
        ToastModule,
        InputMaskModule,
        ConfirmDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }, // Mock TranslateLoader
        }),
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MarketService,
        RegionService,
        MessageService,
        ConfirmationService,
        TranslateService,
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA], 
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize the form', () => {
    component.ngOnInit();
    expect(component.marketForm).toBeDefined();
    expect(component.marketForm.controls['marketName'].value).toBe('');
    expect(component.marketForm.controls['marketCode'].value).toBe('');
  });
});
