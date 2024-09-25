import { TestBed } from '@angular/core/testing';

import { MarketlistService } from './marketlist.service';

describe('MarketlistserviceService', () => {
  let service: MarketlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
