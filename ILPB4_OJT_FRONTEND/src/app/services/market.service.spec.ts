// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { MarketService } from './market.service';
// import { Market } from '../core/models/market';
// import { environment } from '../../environments/environment';

// describe('MarketService', () => {
//   let service: MarketService;
//   let httpMock: HttpTestingController;
//   const apiUrl = `${environment.apiUrl}/market`;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [MarketService],
//     });

//     service = TestBed.inject(MarketService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   // Test case for createMarket()
//   it('should create a market and return its ID', () => {
//     const newMarket: Market = { name: 'Market 1', code: 'MK', longMarketCode: 'LMC001', region: 'Region1', subRegion: 'SubRegion1' };
//     const expectedMarketId = 1;

//     service.createMarket(newMarket).subscribe((marketId) => {
//       expect(marketId).toEqual(expectedMarketId);
//     });

//     const req = httpMock.expectOne(`${apiUrl}`);
//     expect(req.request.method).toBe('POST');
//     req.flush(expectedMarketId);
//   });

//   // Test case for getMarketDetailsById()
//   it('should fetch market details by ID', () => {
//     const marketId = 1;
//     const marketDetails = { id: marketId, name: 'Market 1', code: 'MK', longMarketCode: 'LMC001', region: 'Region1', subRegion: 'SubRegion1' };

//     service.getMarketDetailsById(marketId).subscribe((details) => {
//       expect(details).toEqual(marketDetails);
//     });

//     const req = httpMock.expectOne(`${apiUrl}/${marketId}`);
//     expect(req.request.method).toBe('GET');
//     req.flush(marketDetails);
//   });

//   // Test case for getAllMarkets()
//   it('should fetch all markets with pagination', () => {
//     const markets: Market[] = [
//       { id: 1, name: 'Market 1', code: 'MK', longMarketCode: 'LMC001', region: 'Region1', subRegion: 'SubRegion1' },
//       { id: 2, name: 'Market 2', code: 'MJ', longMarketCode: 'LMC002', region: 'Region2', subRegion: 'SubRegion2' }
//     ];
//     const pageNumber = 1;
//     const pageSize = 10;

//     service.getAllMarkets(pageNumber, pageSize).subscribe((result) => {
//       expect(result.length).toBe(2);
//       expect(result).toEqual(markets);
//     });

//     const req = httpMock.expectOne(`${apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
//     expect(req.request.method).toBe('GET');
//     req.flush(markets);
//   });

//   // Test case for checkMarketCodeExists()
//   it('should check if a market code exists', () => {
//     const marketCode = 'MK';
//     const exists = true;

//     service.checkMarketCodeExists(marketCode).subscribe((result) => {
//       expect(result).toBe(exists);
//     });

//     const req = httpMock.expectOne(`${apiUrl}/code/${marketCode}/exists`);
//     expect(req.request.method).toBe('GET');
//     req.flush(exists);
//   });

//   // Test case for checkMarketNameExists()
//   it('should check if a market name exists', () => {
//     const marketName = 'Market 1';
//     const exists = true;

//     service.checkMarketNameExists(marketName).subscribe((result) => {
//       expect(result).toBe(exists);
//     });

//     const req = httpMock.expectOne(`${apiUrl}/name/${marketName}/exists`);
//     expect(req.request.method).toBe('GET');
//     req.flush(exists);
//   });

//   // Test case for updateMarket()
//   it('should update a market', () => {
//     const marketId = 1;
//     const updatedMarket: Market = { id: marketId, name: 'Updated Market', code: 'UMKT', longMarketCode: 'ULMC001', region: 'Region1', subRegion: 'SubRegion1' };

//     service.updateMarket(marketId, updatedMarket).subscribe((response) => {
//       expect(response).toBeTruthy();
//     });

//     const req = httpMock.expectOne(`${apiUrl}/${marketId}`);
//     expect(req.request.method).toBe('PUT');
//     req.flush({});
//   });

//   // Test case for deleteMarket()
//   it('should delete a market by ID', () => {
//     const marketId = 1;

//     service.deleteMarket(marketId).subscribe((response) => {
//       expect(response).toBeTruthy();
//     });

//     const req = httpMock.expectOne(`${apiUrl}/${marketId}`);
//     expect(req.request.method).toBe('DELETE');
//     req.flush({});
//   });

//   // Test case for searchMarkets()
//   it('should search markets by text', () => {
//     const searchText = 'Market';
//     const markets: Market[] = [{ id: 1, name: 'Market 1', code: 'MK', longMarketCode: 'LMC001', region: 'Region1', subRegion: 'SubRegion1' }];

//     service.searchMarkets(searchText).subscribe((result) => {
//       expect(result).toEqual(markets);
//     });

//     const req = httpMock.expectOne(`${apiUrl}/search?searchText=${searchText}`);
//     expect(req.request.method).toBe('GET');
//     req.flush(markets);
//   });

//   // Test case for getFilteredMarkets()
//   it('should get filtered markets by region', () => {
//     const regions = 'Region 1';
//     const markets: Market[] = [{ id: 1, name: 'Market 1', code: 'MK', longMarketCode: 'LMC001', region: 'Region1', subRegion: 'SubRegion1' }];

//     service.getFilteredMarkets(regions).subscribe((result) => {
//       expect(result).toEqual(markets);
//     });

//     const req = httpMock.expectOne(`${apiUrl}/filter?Regions=${encodeURIComponent(regions)}`);
//     expect(req.request.method).toBe('GET');
//     req.flush(markets);
//   });

//   // Test case for getMarketById()
//   it('should get market by ID with details', () => {
//     const marketId = 1;
//     const marketDetails = { id: marketId, name: 'Market 1', code: 'MK', longMarketCode: 'LMC001', region: 'Region1', subRegion: 'SubRegion1' };

//     service.getMarketById(marketId).subscribe((details) => {
//       expect(details).toEqual(marketDetails);
//     });

//     const req = httpMock.expectOne(`${apiUrl}/${marketId}/details`);
//     expect(req.request.method).toBe('GET');
//     req.flush(marketDetails);
//   });
// });
