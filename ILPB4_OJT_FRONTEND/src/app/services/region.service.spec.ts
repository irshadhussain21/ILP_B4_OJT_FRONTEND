import { TestBed } from '@angular/core/testing';
import { RegionService } from './region.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Region } from '../core/models/region';

describe('RegionService', () => {
  let service: RegionService;
  let httpClientMock: jest.Mocked<HttpClient>;

  const apiUrl = `${environment.apiUrl}/Region`;

  beforeEach(() => {
    // Create a mock HttpClient
    httpClientMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.configureTestingModule({
      providers: [
        RegionService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(RegionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAllRegions', () => {
    it('should fetch all regions from the API', () => {
      const mockRegions: Region[] = [
        { key: 1, value: 'Region 1' },
        { key: 2, value: 'Region 2' },
      ];

      httpClientMock.get.mockReturnValue(of(mockRegions));

      service.getAllRegions().subscribe((regions) => {
        expect(regions).toEqual(mockRegions);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}/regions`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching all regions', () => {
      const mockError = new Error('Network error');
      httpClientMock.get.mockReturnValue(throwError(() => mockError));

      service.getAllRegions().subscribe({
        next: () => fail('Expected error, but got success response'),
        error: (error) => {
          expect(error).toBe(mockError);
        },
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}/regions`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('#getSubRegionsByRegion', () => {
    it('should fetch subregions for a given region ID', () => {
      const regionId = 1;
      const mockSubregions: Region[] = [
        { key: 1, value: 'Subregion 1' },
        { key: 2, value: 'Subregion 2' },
      ];

      httpClientMock.get.mockReturnValue(of(mockSubregions));

      service.getSubRegionsByRegion(regionId).subscribe((subregions) => {
        expect(subregions).toEqual(mockSubregions);
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}/${regionId}/subregions`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching subregions for a given region ID', () => {
      const regionId = 1;
      const mockError = new Error('Network error');

      httpClientMock.get.mockReturnValue(throwError(() => mockError));

      service.getSubRegionsByRegion(regionId).subscribe({
        next: () => fail('Expected error, but got success response'),
        error: (error) => {
          expect(error).toBe(mockError);
        },
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(`${apiUrl}/${regionId}/subregions`);
      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });
  });
});
