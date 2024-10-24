import { TestBed } from '@angular/core/testing';

import { RegionService } from './region.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RegionService', () => {
  let service: RegionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],  
      providers: [RegionService]  
    });
    service = TestBed.inject(RegionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
