import { TestBed } from '@angular/core/testing';
import { MarketService } from './market.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Market } from '../core/models/market';
import { environment } from '../../environments/environment';

describe('MarketService', () => {
  let service: MarketService;
  let httpClientMock: jest.Mocked<HttpClient>;
  const apiUrl = `${environment.apiUrl}/market`;

  beforeEach(() => {
    // Mock HttpClient
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.configureTestingModule({
      providers: [
        MarketService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(MarketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createMarket', () => {
    it('should call HttpClient.post with the correct URL and market data', () => {
      const mockMarket: Market = {
          id: 1, name: 'Market 1', code: 'M1',
          longMarketCode: 'AJSKDFJ',
          region: '1',
          subRegion: '2'
      };
      httpClientMock.post.mockReturnValue(of(1));

      service.createMarket(mockMarket).subscribe((response) => {
        expect(response).toBe(1);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(`${apiUrl}`, mockMarket);
    });
  });

  describe('getMarketDetailsById', () => {
    it('should call HttpClient.get with the correct URL', () => {
      const marketId = 1;
      const mockMarketDetails = { id: 1, name: 'Market 1', code: 'M1' };
      httpClientMock.get.mockReturnValue(of(mockMarketDetails));

      service.getMarketDetailsById(marketId).subscribe((response) => {
        expect(response).toEqual(mockMarketDetails);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}/${marketId}`);
    });
  });

  describe('getAllMarkets', () => {
    it('should call HttpClient.get with the correct URL and parameters', () => {
      const pageNumber = 1;
      const pageSize = 10;
      const searchText = 'M';
      const region = 'Region 1';
      const mockMarkets = [{ id: 1, name: 'Market 1', code: 'M1' }];
      const expectedUrl = `https://localhost:7058/api/Market?pageNumber=${pageNumber}&pageSize=${pageSize}&searchText=${encodeURIComponent(
        searchText
      )}&regions=${encodeURIComponent(region)}`;

      httpClientMock.get.mockReturnValue(of(mockMarkets));

      service
        .getAllMarkets(pageNumber, pageSize, searchText, region)
        .subscribe((response) => {
          expect(response).toEqual(mockMarkets);
        });

      expect(httpClientMock.get).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('checkMarketCodeExists', () => {
    it('should call HttpClient.get with the correct URL for market code existence', () => {
      const marketCode = 'M1';
      httpClientMock.get.mockReturnValue(of(true));

      service.checkMarketCodeExists(marketCode).subscribe((response) => {
        expect(response).toBe(true);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${apiUrl}/code/${marketCode}/exists`,
        { params: { marketCode } }
      );
    });
  });

  describe('checkMarketNameExists', () => {
    it('should call HttpClient.get with the correct URL for market name existence', () => {
      const marketName = 'Market 1';
      httpClientMock.get.mockReturnValue(of(true));

      service.checkMarketNameExists(marketName).subscribe((response) => {
        expect(response).toBe(true);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${apiUrl}/name/${marketName}/exists`,
        { params: { marketName } }
      );
    });
  });

  describe('updateMarket', () => {
    it('should call HttpClient.put with the correct URL and market data', () => {
      const marketId = 1;
      const mockMarket: Market = {
          id: 1, name: 'Updated Market', code: 'UM1',
          longMarketCode: '',
          region: '',
          subRegion: ''
      };
      httpClientMock.put.mockReturnValue(of({}));

      service.updateMarket(marketId, mockMarket).subscribe((response) => {
        expect(response).toEqual({});
      });

      expect(httpClientMock.put).toHaveBeenCalledWith(
        `${apiUrl}/${marketId}`,
        mockMarket
      );
    });
  });

  describe('deleteMarket', () => {
    it('should call HttpClient.delete with the correct URL', () => {
      const marketId = 1;
      httpClientMock.delete.mockReturnValue(of({}));

      service.deleteMarket(marketId).subscribe((response) => {
        expect(response).toEqual({});
      });

      expect(httpClientMock.delete).toHaveBeenCalledWith(`${apiUrl}/${marketId}`);
    });
  });

  describe('getMarketById', () => {
    it('should call HttpClient.get with the correct URL for market details', () => {
      const marketId = 1;
      const mockMarketDetails = { id: 1, name: 'Market 1', code: 'M1' };
      httpClientMock.get.mockReturnValue(of(mockMarketDetails));

      service.getMarketById(marketId).subscribe((response) => {
        expect(response).toEqual(mockMarketDetails);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${apiUrl}/${marketId}/details`
      );
    });
  });
});
