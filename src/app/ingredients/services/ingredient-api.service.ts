import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class IngredientApiService {
  domainPath: string;
  apiPath = 'wp-json/wp/pruvitnow/product/ingredients';

  constructor(private http: HttpClient) {
    this.domainPath = environment.apiDomain;
  }

  getIngredients(country: string, language: string, defaultLanguage: string) {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      if (language !== 'en' && defaultLanguage !== language) {
        fullApiPath =
          this.domainPath + '/' + this.apiPath + '/?lang=' + language;
      } else {
        fullApiPath = this.domainPath + '/' + this.apiPath;
      }
    } else {
      if (language !== 'en' && defaultLanguage !== language) {
        fullApiPath =
          this.domainPath +
          '/' +
          country.toLowerCase() +
          '/' +
          this.apiPath +
          '/?lang=' +
          language;
      } else {
        fullApiPath =
          this.domainPath + '/' + country.toLowerCase() + '/' + this.apiPath;
      }
    }

    return this.http.get<any[]>(fullApiPath);
  }
}
