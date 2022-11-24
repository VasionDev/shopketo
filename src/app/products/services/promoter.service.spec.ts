import { TestBed } from '@angular/core/testing';

import { PromoterService } from './promoter.service';

describe('PromoterService', () => {
  let service: PromoterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromoterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
