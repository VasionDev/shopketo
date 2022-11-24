import { TestBed } from '@angular/core/testing';

import { AppCartTotalService } from './app-cart-total.service';

describe('AppCartTotalService', () => {
  let service: AppCartTotalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCartTotalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
