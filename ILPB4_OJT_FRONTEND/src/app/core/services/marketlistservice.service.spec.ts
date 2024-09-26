import { TestBed } from '@angular/core/testing';

import { MarketlistserviceService } from './marketlist.service';

describe('MarketlistserviceService', () => {
  let service: MarketlistserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketlistserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
