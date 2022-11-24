import { TestBed } from '@angular/core/testing';

import { ProductsUtilityService } from './products-utility.service';

describe('ProductsUtilityService', () => {
  let service: ProductsUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
