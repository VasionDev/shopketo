import { TestBed } from '@angular/core/testing';

import { TranslateBrowserLoaderService } from './translate-browser-loader.service';

describe('TranslateBrowserLoaderService', () => {
  let service: TranslateBrowserLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslateBrowserLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
