import { TestBed } from '@angular/core/testing';

import { TranslateServerLoaderService } from './translate-server-loader.service';

describe('TranslateServerLoaderService', () => {
  let service: TranslateServerLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslateServerLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
