import { TestBed } from '@angular/core/testing';

import { BlogInterceptor } from './blog.interceptor';

describe('BlogInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BlogInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: BlogInterceptor = TestBed.inject(BlogInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
