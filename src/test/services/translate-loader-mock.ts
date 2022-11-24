import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

const translations: any = {
  'fill-1-or-more-boxes': 'Fill 1 or more boxes with 8 items each to continue.',
};

@Injectable()
export class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of(translations);
  }
}
