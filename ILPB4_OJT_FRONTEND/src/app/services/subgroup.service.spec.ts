
import { of } from 'rxjs';
import { MarketSubgroup } from '../core/models/market';
import { MarketSubgroupService} from './subgroup.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

describe('SubgroupService', () => {
  let service: MarketSubgroupService;
  let httpClientSpy : any;
  const mockApiUrl = `${environment.apiUrl}/MarketSubgroup`;

  beforeEach(() => {
    httpClientSpy = {
        get : jest.fn() //mock fn of get used in service
    }
    service = new MarketSubgroupService(httpClientSpy);
    service['apiUrl'] = mockApiUrl;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET API with valid marketId parameter and return data', (done) => {
    const mockMarketId = 1;
    const expectedData: MarketSubgroup[] = [
      {
        subGroupId: 1,
        subGroupName: 'Test Subgroup 1',
        subGroupCode: 'A',
        marketId: 1,
        isDeleted: false,
        isEdited: false
      }
    ];

    jest.spyOn(httpClientSpy,'get').mockReturnValue(of(expectedData));

    service.getSubgroups(mockMarketId).subscribe((data) => {
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${mockApiUrl}?marketId=${mockMarketId}`
      );
      expect(data).toEqual(expectedData);
      expect(data.every(item => item.marketId === mockMarketId)).toBe(true);
      done();
    });
  });
});
