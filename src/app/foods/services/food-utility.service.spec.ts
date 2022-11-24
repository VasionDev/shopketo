import { TestBed } from '@angular/core/testing';

import { FoodUtilityService } from './food-utility.service';

describe('FoodsDataService', () => {
  let service: FoodUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
