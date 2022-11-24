import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UnicomShortenUrlResponse } from '../interface';

@Injectable({
  providedIn: 'root',
})
export class AppApiService {
  domainPath: string;
  phraseBase: string;
  clientDomain: string;
  cloudDomainPath: string;
  contactHost: string;
  vaptHost: string;
  apiPath = 'wp-json/wp/pruvitnow/products';
  usersPath = 'wp-json/wp/pruvitnow/mvuser-info';

  constructor(private http: HttpClient, private apollo: Apollo) {
    this.domainPath = environment.apiDomain;
    this.phraseBase = environment.phraseBase;
    this.clientDomain = environment.clientDomain;
    this.cloudDomainPath = environment.userURL;
    this.contactHost = environment.contactHost;
    this.vaptHost = environment.vaptHost;
  }

  getCountries() {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/country-list'
    );
  }

  getLanguagesForCountry(country: string) {
    if (country.toLowerCase() === 'us') {
      return this.http.get(
        this.domainPath + '/wp-json/wp/pruvitnow/language-list'
      );
    } else {
      return this.http.get(
        this.domainPath +
          '/' +
          country.toLowerCase() +
          '/wp-json/wp/pruvitnow/language-list'
      );
    }
  }

  getCheckoutCountries(country: string) {
    const fullApiPath = `${this.cloudDomainPath}api/countries`;

    const params = new HttpParams()
      .set('CountryCode', country)
      .set('IsShippingAllowed', true);

    return this.http.get<any>(fullApiPath, { params: params });
  }

  getUsers(country: string) {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      fullApiPath = this.domainPath + '/' + this.usersPath;
    } else {
      fullApiPath =
        this.domainPath + '/' + country.toLowerCase() + '/' + this.usersPath;
    }

    const time = new Date().getTime();
    fullApiPath += `?t=${time}`;

    return this.http.get<any>(fullApiPath);
  }

  getReferrer(refCode: string) {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/referrer/?ref_code=' + refCode
    );
  }

  getAuthCheckoutURL(code: string, productSku: string) {
    return this.http.get(
      this.domainPath +
        '/wp-json/wp/pruvitnow/mvauth/?code=' +
        code +
        '&product_sku=' +
        productSku
    );
  }

  getLangJsonData() {
    this.http.get('assets/i18n/data(3).json').subscribe((data: any) => {
      const langData: any = {};
      data.StringList.map((element: any) => {
        const myId = element.id;
        langData['"' + myId + '"'] = element.zhhant;
      });
      console.log(langData);
    });
  }

  shortenURlByBitly(urlBody: any) {
    const headers = {
      Authorization: 'Bearer 67026bd9a413f9c11b1eb0649f53ab8192c60766',
      'Content-Type': 'application/json',
    };
    return this.http.post('https://api-ssl.bitly.com/v4/shorten', urlBody, {
      headers: headers,
    });
  }

  getBitlyGroupUid() {
    const headers = {
      Host: 'api-ssl.bitly.com',
      Authorization: 'Bearer 67026bd9a413f9c11b1eb0649f53ab8192c60766',
      Accept: 'application/json',
    };
    return this.http.get('https://api-ssl.bitly.com/v4/groups', {
      headers: headers,
    });
  }

  getGeoCountryCode() {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/geo-redirection-code/'
    );
  }

  getPhraseLanguages(): Observable<any> {
    return this.http.get(
      this.phraseBase + environment.phraseAppId + '/locales/'
    );
  }

  getPhraseTranslation(langID: string) {
    return this.http
      .get(
        this.phraseBase +
          environment.phraseAppId +
          '/locales/' +
          langID +
          '/download/?file_format=json'
      )
      .pipe(
        map((responseData: any) => {
          const finalData = Object.entries(responseData).map((item: any) => {
            var translationObj: any = {};
            translationObj[item[0]] = item[1].message;
            return translationObj;
          });
          return Object.assign({}, ...finalData);
        })
      );
  }

  getStaticTranslation(langCode: string) {
    if (
      langCode === 'en' ||
      langCode === 'de' ||
      langCode === 'es-es' ||
      langCode === 'es' ||
      langCode === 'it' ||
      langCode === 'pt-pt' ||
      langCode === 'zh-hans' ||
      langCode === 'zh-hant'
    ) {
      return this.http.get(`./assets/i18n/${langCode}.json`);
    } else {
      return this.http.get(`./assets/i18n/en.json`);
    }
  }

  readCSVFile(url: string): Observable<number[]> {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
    return this.http.get(url, { headers: headers, responseType: 'text' }).pipe(
      map((res) => {
        return res
          .split('\n')
          .filter((item, index) => index !== 0 && +item !== 0)
          .map((str) => +str);
      })
    );
  }

  getTinyUrl(url: string) {
    return this.http.get(
      'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url),
      {
        responseType: 'text',
      }
    );
  }

  getUnicomShortenUrl(urlObj: { originalUrl: string }): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          btoa(
            `${environment.unicomAuthUserName}:${environment.unicomAuthPassword}`
          ),
      }),
    };

    return this.http
      .post<UnicomShortenUrlResponse>(
        environment.unicomShortenUrlEndPoint,
        urlObj,
        httpOptions
      )
      .pipe(map((res) => res.shortUrl));
  }

  getGngOfferId(offerId: string) {
    return this.http.get(
      `${this.vaptHost}/Samples/GetOffer?offerId=${offerId}`
    );
  }

  getContactToken() {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/get-contact-token'
    );
  }

  sendContactActivity(
    tokenType: string,
    accessToken: string,
    contactId: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      // Host: this.contactHost,
    };
    const payLoad = {
      contactId: contactId,
      body: {
        bodyType: 1,
        text: 'Give & Get form submitted.',
      },
      source: this.clientDomain,
    };

    return this.http.post(`${this.contactHost}/contact/SendActivity`, payLoad, {
      headers: new HttpHeaders(headers),
    });
  }

  getSystemAlertToken() {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/get-system-alert-token'
    );
  }

  updateContactNameAndEmail(
    tokenType: string,
    accessToken: string,
    contactId: string,
    firstName: string,
    lastName: string,
    email: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      // Host: this.contactHost,
    };

    const namePayLoad = {
      contactId: contactId,
      name: {
        name: firstName + ' ' + lastName,
        firstName: firstName,
        middleName: '',
        lastName: lastName,
      },
    };

    const emailPayLoad = {
      contactId: contactId,
      email: email,
    };

    return forkJoin([
      this.http.post(`${this.contactHost}/contact/Rename`, namePayLoad, {
        headers: new HttpHeaders(headers),
      }),
      this.http.post(
        `${this.contactHost}/contact/ChangeEmailAddress`,
        emailPayLoad,
        {
          headers: new HttpHeaders(headers),
        }
      ),
    ]);
  }

  updateContactName(
    tokenType: string,
    accessToken: string,
    contactId: string,
    firstName: string,
    lastName: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      // Host: this.contactHost,
    };
    const payLoad = {
      contactId: contactId,
      name: {
        name: firstName + ' ' + lastName,
        firstName: firstName,
        middleName: '',
        lastName: lastName,
      },
    };
    return this.http.post(`${this.contactHost}/contact/Rename`, payLoad, {
      headers: new HttpHeaders(headers),
    });
  }

  updateContactEmail(
    tokenType: string,
    accessToken: string,
    contactId: string,
    email: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      // Host: this.contactHost,
    };

    const payLoad = {
      contactId: contactId,
      email: email,
    };

    return this.http.post(
      `${this.contactHost}/contact/ChangeEmailAddress`,
      payLoad,
      {
        headers: new HttpHeaders(headers),
      }
    );
  }

  createContactId(
    tokenType: string,
    accessToken: string,
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    countryCode: string,
    phone?: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      // Host: this.contactHost,
    };

    const payLoad = {
      sponsorId: userId,
      name: {
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        middleName: '',
        lastName: lastName,
      },
      email: email,
      address: {
        streetAddress: '',
        formatted: '',
        postalCode: '',
        locality: '',
        country: countryCode,
        region: '',
      },
      phoneNumber: phone ? phone : '',
      source: this.domainPath,
      status: 'Not Contacted',
    };

    return this.http.post(
      `${this.contactHost}/contact/CreateAndGenerateTrackingCode`,
      payLoad,
      {
        headers: new HttpHeaders(headers),
      }
    );
  }

  getGngProposal(offerId: string, contactId: string) {
    return this.http.get(
      `${this.vaptHost}/Samples/GetProposal?offerId=${offerId}&contactId=${contactId}`
    );
  }

  getWistiaThumbnailImage(wistiaId: string | number) {
    const wistiaUrl = `https://fast.wistia.net/oembed?url=http://home.wistia.com/medias/${wistiaId}?embedType=async`;

    return this.http
      .get(wistiaUrl)
      .pipe(map((item: any) => item.thumbnail_url as string));
  }

  getPruvitTvThumbnailImage(pruvitTvId: string | number): Observable<string> {
    const GET_THUMBS = gql`
    query {
      media(id: ${pruvitTvId}) {
        thumbs {
          medium {
            url
          }
        }
      }
    }  
    `;

    return this.apollo
      .query({
        query: GET_THUMBS,
      })
      .pipe(
        map((res: any) => res.data.media.thumbs?.medium?.url),
        catchError(() => of(''))
      );
  }

  getTrainingCenterData(language?: string) {
    const langCode = language && language !== '' ? language : 'en';
    return this.http.get<[]>(
      this.domainPath + '/wp-json/wp/pruvitnow/training-data/?lang_code='+langCode
    )
  }

  getUserTrainingData(userId: number) {
    return this.http.get<any>(
      this.domainPath + '/wp-json/wp/pruvitnow/user/training-center/training-data/?userId='+userId,
    )
  }

  saveUserTrainingData(userId: number, indexArray: any[], lessonArray: any[], completedCategory: any[]) {
    return this.http.post<any>(
      this.domainPath + '/wp-json/wp/pruvitnow/user/training-center/training-data',
      {
        userId: userId,
        indexArray: indexArray,
        lessonArray: lessonArray,
        completedCategory: completedCategory
      }
    )
  }
  
  setImpersonation(name: string, token: string) {
    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'password');
    urlencoded.append('username', name);
    urlencoded.append(
      'password',
      (Math.random() + 1).toString(36).substring(7)
    );
    urlencoded.append(
      'scope',
      'openid newgen email phone profile offline_access'
    );
    urlencoded.append('acr_values', 'impersonate:' + token);

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          btoa(
            `${environment.accountClientId}:${environment.accountClientsecret}`
          ),
      }),
    };
    return this.http.post<any>(
      environment.accountHost + '/connect/token',
      urlencoded,
      options
    );
  }

  getSpecialists() {
    return this.http.get<any>(
      this.domainPath + '/wp-json/wp/pruvitnow/specialists'
    );
  }
}
