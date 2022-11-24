import { TestBed } from '@angular/core/testing';

import { ProductsTagAndCategoryService } from './products-tag-and-category.service';

describe('ProductsTagAndCategoryService', () => {
  let service: ProductsTagAndCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsTagAndCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
