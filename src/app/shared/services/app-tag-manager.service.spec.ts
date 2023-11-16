import { TestBed } from '@angular/core/testing';

import { AppTagManagerService } from './app-tag-manager.service';

describe('AppTagManagerService', () => {
  let service: AppTagManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppTagManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
