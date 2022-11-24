import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class ResearchApiServiceStub {
  domainPath = environment.apiDomain;
  apiPath = 'wp-json/wp/pruvitnow/research-videos';

  getResearchVideos(
    country: string,
    language: string,
    defaultLanguage: string
  ) {
    return of();
  }
}
