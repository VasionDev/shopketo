import { TestBed } from '@angular/core/testing';

import { NewgenApiService } from './newgen-api.service';

describe('NewgenApiService', () => {
  let service: NewgenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewgenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
