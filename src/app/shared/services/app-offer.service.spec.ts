import { TestBed } from '@angular/core/testing';

import { AppOfferService } from './app-offer.service';

describe('ProductsDetailService', () => {
  let service: AppOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
