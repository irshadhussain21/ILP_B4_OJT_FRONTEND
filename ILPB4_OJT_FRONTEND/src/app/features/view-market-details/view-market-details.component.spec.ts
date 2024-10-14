
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ActivatedRoute } from '@angular/router';
// import { of } from 'rxjs';
// import { MarketService } from '../../services/market.service';
// import { ViewMarketDetailsComponent } from './view-market-details.component';
// import { MarketDetails } from '../../core/market-details';


// describe('ViewMarketDetailsComponent', () => {
//   let component: ViewMarketDetailsComponent;
//   let fixture: ComponentFixture<ViewMarketDetailsComponent>;
//   let mockMarketService: any;
//   const mockMarketDetails: MarketDetails = {
//     marketId: 1,
//     marketName: 'Antarctica',
//     marketCode: 'AA',
//     longMarketCode: 'L-AQ.AA.AA',
//     region: 'LAAPA',
//     subRegion: 'Africa',
//     marketSubGroups: [{ subGroupCode: 'Q', subGroupId: 1, subGroupName: 'Q-Island' }]
//   };

//   beforeEach(async () => {
//     mockMarketService = jasmine.createSpyObj('MarketService', ['getMarketById']);

//     await TestBed.configureTestingModule({
//       declarations: [ViewMarketDetailsComponent],
//       providers: [
//         { provide: MarketService, useValue: mockMarketService },
//         { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
//       ]
//     }).compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(ViewMarketDetailsComponent);
//     component = fixture.componentInstance;
//     mockMarketService.getMarketById.and.returnValue(of(mockMarketDetails));
//     fixture.detectChanges();
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should fetch market details on initialization', () => {
//     component.ngOnInit();
//     expect(component.marketDetails).toEqual(mockMarketDetails);
//     expect(mockMarketService.getMarketById).toHaveBeenCalledWith(1);
//   });

//   it('should display the correct market details in the template', () => {
//     fixture.detectChanges();
//     const compiled = fixture.nativeElement;
//     expect(compiled.querySelector('.panel-content').textContent).toContain('Antarctica');
//   });
// });
