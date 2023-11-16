import { TestBed } from '@angular/core/testing';

import { AddressEmitterService } from './address-emitter.service';

describe('AddressEmitterService', () => {
  let service: AddressEmitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
