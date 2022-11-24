import { TestBed } from '@angular/core/testing';

import { AppCheckoutService } from './app-checkout.service';

describe('AppCheckoutService', () => {
  let service: AppCheckoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCheckoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
