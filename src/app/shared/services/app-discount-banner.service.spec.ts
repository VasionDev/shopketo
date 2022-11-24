import { TestBed } from '@angular/core/testing';

import { AppDiscountBannerService } from './app-discount-banner.service';

describe('AppDiscountBannerService', () => {
  let service: AppDiscountBannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppDiscountBannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
