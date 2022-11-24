import { TestBed } from '@angular/core/testing';

import { PhraseInterceptor } from './phrase.interceptor';

describe('PhraseInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      PhraseInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: PhraseInterceptor = TestBed.inject(PhraseInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
