import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { mockReseach } from 'src/test/data/reseach-mock';
import { ResearchApiServiceStub } from 'src/test/services/research-api-service-mock';

import { ResearchApiService } from './research-api.service';

fdescribe('ResearchApiService', () => {
  let researchApiService: ResearchApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ResearchApiService, useClass: ResearchApiServiceStub },
      ],
    });

    researchApiService = TestBed.inject(ResearchApiService);
  });

  it('should be created', () => {
    expect(researchApiService).toBeTruthy();
  });

  it('should test getResearchVideos with service spy', (done: DoneFn) => {
    const researchApiSpy = spyOn(researchApiService, 'getResearchVideos')
      .withArgs('US', 'en', 'en')
      .and.callFake(() => of(mockReseach()));

    researchApiService.getResearchVideos('US', 'en', 'en').subscribe((res) => {
      // for objects and arrays check equality between different references
      expect(res).toEqual(mockReseach());
      done();
    });

    expect(researchApiSpy).toHaveBeenCalled();
  });
});
