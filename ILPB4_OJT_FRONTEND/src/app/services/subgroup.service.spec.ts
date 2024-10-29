import { TestBed } from '@angular/core/testing';
import { MarketSubgroupService } from "./subgroup.service"
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MarketSubgroup } from '../core/models/market';

describe('MarketSubgroupService', () => {
  let service: MarketSubgroupService;
  let httpClientMock: jest.Mocked<HttpClient>;

  // Base URL for the API as defined in the service
  const apiUrl = `${environment.apiUrl}/MarketSubgroup`;

  beforeEach(() => {
    // Create a mock HttpClient
    httpClientMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.configureTestingModule({
      providers: [
        MarketSubgroupService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(MarketSubgroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getSubgroups', () => {
    it('should fetch subgroups for a given market ID', () => {
      const marketId = 1;
      const mockSubgroups: MarketSubgroup[] = [
        { subGroupId: 1, subGroupName: 'Subgroup 1', subGroupCode: 'SG1', marketCode: 'M1', isDeleted: false, isEdited: false },
        { subGroupId: 2, subGroupName: 'Subgroup 2', subGroupCode: 'SG2', marketCode: 'M1', isDeleted: false, isEdited: false },
      ];

      httpClientMock.get.mockReturnValue(of(mockSubgroups));

      service.getSubgroups(marketId).subscribe((subgroups) => {
        expect(subgroups).toEqual(mockSubgroups);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}?marketId=${marketId}`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });

    it('should fetch all subgroups if no market ID is provided', () => {
      const mockSubgroups: MarketSubgroup[] = [
        { subGroupId: 1, subGroupName: 'Subgroup 1', subGroupCode: 'SG1', marketCode: 'M1', isDeleted: false, isEdited: false },
        { subGroupId: 2, subGroupName: 'Subgroup 2', subGroupCode: 'SG2', marketCode: 'M2', isDeleted: false, isEdited: false },
      ];

      httpClientMock.get.mockReturnValue(of(mockSubgroups));

      service.getSubgroups().subscribe((subgroups) => {
        expect(subgroups).toEqual(mockSubgroups);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}?marketId=undefined`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching subgroups', () => {
      const mockError = new Error('Network error');

      httpClientMock.get.mockReturnValue(throwError(() => mockError));

      service.getSubgroups(1).subscribe({
        next: () => fail('Expected error, but got success response'),
        error: (error) => {
          expect(error).toBe(mockError);
        },
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}?marketId=1`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });
  });
});
