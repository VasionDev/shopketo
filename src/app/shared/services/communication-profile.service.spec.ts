import { TestBed } from '@angular/core/testing';

import { CommunicationProfileService } from './communication-profile.service';

describe('CommunicationProfileService', () => {
  let service: CommunicationProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
