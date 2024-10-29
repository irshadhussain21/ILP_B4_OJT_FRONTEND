import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { SubgroupComponent } from './subgroup.component';
import { MarketSubgroupService } from '../../services/subgroup.service';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MarketSubgroup } from '../../core/models/market';

class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('SubgroupComponent', () => {
  let component: SubgroupComponent;
  let fixture: ComponentFixture<SubgroupComponent>;
  let mockSubgroupService: jest.Mocked<MarketSubgroupService>;

  beforeEach(async () => {
    // Mock MarketSubgroupService
    mockSubgroupService = {
      getSubgroups: jest.fn().mockReturnValue(
        of([
          {
            subGroupId: 1,
            subGroupName: 'Sub Group 1',
            subGroupCode: 'A',
            marketId: 1,
            isDeleted: false,
            isEdited: false,
          },
        ])
      ),
    } as unknown as jest.Mocked<MarketSubgroupService>;

    const mockConfirmationService = {
      confirm: jest.fn((confirmation: ConfirmationService) => {
        // Simulate user acceptance by emitting a value
        if (confirmation.accept) {
          confirmation.accept.subscribe(() => {
            // Simulate the user accepting
          });
        }
        return confirmation;
      }),
    };

    // Configure the testing module
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ConfirmDialogModule,
        TableModule,
        ButtonModule,
        InputGroupModule,
        InputTextModule,
        DividerModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        SubgroupComponent,
      ],

      providers: [
        provideHttpClient(),
        { provide: MarketSubgroupService, useValue: mockSubgroupService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with an empty rows array', () => {
    component.initializeForm();
    expect(component.form.contains('rows')).toBe(true);
    expect(component.rows.length).toBe(0);
  });

  it('should load subgroups if marketId exists', () => {
    component.marketId = 1;
    const subGroups: MarketSubgroup[] = [
      {
        subGroupId: 1,
        subGroupName: 'Test Group',
        subGroupCode: 'A',
        marketId: 1,
        marketCode: 'AA',
        isDeleted: false,
        isEdited: false,
      },
    ];
    mockSubgroupService.getSubgroups.mockReturnValue(of(subGroups));

    component.loadSubGroupsIfMarketIdExists();

    expect(mockSubgroupService.getSubgroups).toHaveBeenCalledWith(1);
    expect(component.showSubgroup).toBe(true);
    expect(component.rows.length).toBe(subGroups.length);
  });

  it('should set form controls based on subgroups data from service', () => {
    const subGroups: MarketSubgroup[] = [
      {
        subGroupId: 1,
        subGroupName: 'Test Group',
        subGroupCode: 'A',
        marketId: 1,
        marketCode: 'AA',
        isDeleted: false,
        isEdited: false,
      },
    ];
    mockSubgroupService.getSubgroups.mockReturnValue(of(subGroups));

    component.loadSubGroups();

    expect(component.rows.length).toBe(1);
    expect(component.showSubgroup).toBe(true);
  });

  it('should emit valid subgroups on form value changes', fakeAsync(() => {
    const emitValidSubGroupsSpy = jest.spyOn(component, 'emitValidSubGroups');
    component.initializeForm();
    component.subscribeToFormChanges();

    const testSubGroup: MarketSubgroup = {
      subGroupName: 'Test Group',
      subGroupCode: 'A',
      marketId: 1,
      marketCode: 'AA',
      isDeleted: false,
      isEdited: false,
    };

    // Add row with testSubGroup data
    component.rows.push(component.createRow(testSubGroup));
    component.form.updateValueAndValidity();
    tick(300);
    expect(emitValidSubGroupsSpy).toHaveBeenCalled();
  }));

  it('should emit isSubGroupFormInvalid with true when form status changes to INVALID', () => {
    const emitSpy = jest.spyOn(component.isSubGroupFormInvalid, 'emit');
    component.initializeForm();
    component.subscribeToFormChanges();

    // Define the invalid test data for the row
    const testSubGroup: MarketSubgroup = {
      subGroupName: '',
      subGroupCode: 'A',
      marketId: 1,
      marketCode: 'AA',
      isDeleted: false,
      isEdited: false,
    };

    // Add row with invalid test data
    component.rows.push(component.createRow(testSubGroup));

    // Manually trigger form status evaluation
    component.form.updateValueAndValidity();

    // Assert that isSubGroupFormInvalid emitted with true
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should emit new valid subgroups and track dirty and invalid rows', () => {
    // Ensure marketCode is set before adding rows
    component.marketCode = 'AA';
    component.initializeForm();
  
    const testSubGroupValid: MarketSubgroup = {
      subGroupName: 'Valid Group',
      subGroupCode: 'A',
      marketId: 1,
      marketCode: 'AA',
      isDeleted: false,
      isEdited: false,
    };
  
    const testSubGroupInvalid: MarketSubgroup = {
      subGroupName: '',
      subGroupCode: 'A',
      marketId: 1,
      marketCode: 'AA',
      isDeleted: false,
      isEdited: false,
    };
  
    // Add rows: one valid and one invalid
    component.rows.push(component.createRow(testSubGroupValid));
    component.rows.push(component.createRow(testSubGroupInvalid)); // Invalid row
  
    // Force update values and validity to reflect changes
    component.form.updateValueAndValidity();
  
    const emitSpy = jest.spyOn(component.subGroupsChanged, 'emit');
    component.emitValidSubGroups();
  
    // Assert emitted value: Only the valid row should be emitted
    expect(emitSpy).toHaveBeenCalledWith({
      subGroups: [
        {
          ...testSubGroupValid,
          subGroupId: null
        }
      ],
      isDirty: false,
    });
  });
  
});
