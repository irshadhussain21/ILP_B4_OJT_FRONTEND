import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMarketDetailsComponent } from './view-market-details.component';
import { NgFor, CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../../shared/header/header.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

// Mock TranslateLoader
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}
describe('ViewMarketDetailsComponent', () => {
  let component: ViewMarketDetailsComponent;
  let fixture: ComponentFixture<ViewMarketDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ViewMarketDetailsComponent,
        CardModule,
        PanelModule,
        TagModule,
        ChipModule,
        MenuModule,
        ButtonModule,
        HeaderComponent,
        NgFor,
        CommonModule,
        ConfirmDialogModule,
        ToastModule,
       
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }, // Mock TranslateLoader
        }),
        
      ],providers:[
        provideHttpClient(),
        provideRouter([]),
        ConfirmationService,MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewMarketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
