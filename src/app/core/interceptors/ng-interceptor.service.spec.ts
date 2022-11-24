import { TestBed } from '@angular/core/testing';

import { NgInterceptorService } from './ng-interceptor.service';

describe('NgInterceptorService', () => {
  let service: NgInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
