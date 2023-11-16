import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsiteService {
  clientDomain!: string;
  apiDomain!: string;
  contactHost!: string;
  vaptHost!: string;
  checkoutDomain!: string;
  referrer: any = {};
  tenant: string = '';
  apiClientPath: string = '';

  private userCustomizeData = new BehaviorSubject(null);

  constructor(private http: HttpClient) {
    this.clientDomain = environment.clientDomain;
    this.apiDomain = environment.apiDomain;
    this.contactHost = environment.contactHost;
    this.vaptHost = environment.vaptHost;
    this.checkoutDomain = environment.checkoutDomain;
    this.tenant = environment.tenant;
    this.apiClientPath = this.tenant === 'pruvit' ? 'pruvitnow' : 'ladyboss';
  }

  get userCustomizeData$() {
    return this.userCustomizeData.asObservable();
  }

  setUserCustomizeData(data: any) {
    this.userCustomizeData.next(data);
  }

  getCustomizeData(userId: number) {
    return this.http.get<any>(
      this.apiDomain +
        '/wp-json/wp/pruvitnow/mvuser/customize-data/?userId=' +
        userId
    );
  }

  getProductByCountry(countryCode: string) {
    return this.http.get<any>(
      this.apiDomain +
        (countryCode === 'us' ? '' : '/' + countryCode) +
        '/wp-json/wp/pruvitnow/mvuser/products/'
    );
  }

  createCustomizeData(
    data: object,
    userId: number,
    name: string,
    email: string,
    refCode: string
  ) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data',
      {
        userId: userId,
        name: name,
        email: email,
        data: data,
        refCode: refCode,
      }
    );
  }

  approveCustomizeData(data: object) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/approve1',
      data
    );
  }

  saveThemeData(
    data: object,
    userId: number) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/save/theme',
      {
        userId: userId,
        data: data
      }
    );
  }

  saveLinksData(
    data: object,
    userId: number) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/save/links',
      {
        userId: userId,
        data: data
      }
    );
  }

  saveFavProductsData(
    data: object,
    userId: number) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/save/products',
      {
        userId: userId,
        data: data
      }
    );
  }

  saveShortBioData(
    data: object,
    userId: number,
    name: string,
    email: string,
    refCode: string) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/save/short-bio',
      {
        userId: userId,
        name: name,
        email: email,
        data: data,
        refCode: refCode,
      }
    );
  }

  saveIntroVideoData(
    data: string,
    userId: number,
    name: string,
    email: string,
    refCode: string) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/save/video',
      {
        userId: userId,
        name: name,
        email: email,
        data: data,
        refCode: refCode,
      }
    );
  }

  removeIntoVideo(data: object) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/remove/video',
      data
    );
  }

  cancelShortBioData(data: object) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/cancel/short-bio',
      data
    );
  }

  cancelCustomizeData(data: object) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/cancel',
      data
    );
  }

  removeWistiaVideo(data: object) {
    return this.http.post<any>(
      this.apiDomain +
        '/wp-json/wp/pruvitnow/mvuser/customize-data/remove-video',
      data
    );
  }

  getTrackingeData(userId: number) {
    return this.http.get<any>(
      this.apiDomain +
        '/wp-json/wp/pruvitnow/mvuser/tracking-data/?userId=' +
        userId
    );
  }

  saveTrackingeData(data: object, userId: number, refCode: string) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/tracking-data',
      {
        userId: userId,
        refCode: refCode,
        data: data,
      }
    );
  }

  getPulseProStatus(userId: number) {
    return this.http.get<any>(
      this.vaptHost + '/user/get-status?userId=' + userId
    );
  }

  // getMvUserProfile(token: any, userId: number) {
  //   const headers = {
  //     Authorization: `${token.token_type} ${token.access_token}`,
  //     'Content-Type': 'application/json',
  //   };
  //   return this.http.get<any>(
  //     'https://demo.justpruvit.com/api/report/personal?UserId=' + userId,
  //     {
  //       headers: new HttpHeaders(headers),
  //     }
  //   );
  // }

  createContact(
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    countryCode: string,
    source?: string,
    claimType?: string,
    claimValue?: string
  ) {
    const payLoad: any = {
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
      source: source ? source : this.clientDomain,
      status: 'Not Contacted',
    };

    if (claimType && claimValue && claimType !== '' && claimValue !== '') {
      payLoad.customClaims = [
        {
          type: claimType,
          value: claimValue,
        },
      ];
    }

    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/create-contact',
      payLoad
    );
  }

  createContactId(
    tokenType: string,
    accessToken: string,
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    countryCode: string,
    source?: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Host: this.contactHost,
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
      source: source ? source : this.clientDomain,
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

  // createContactActivity(
  //   tokenType: string,
  //   accessToken: string,
  //   contactId: string,
  //   interested: string
  // ) {
  //   const headers = {
  //     Authorization: `${tokenType} ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   };

  //   const payLoad = {
  //     contactId: contactId,
  //     body: {
  //       bodyType: 1,
  //       text: `Interested in ${interested}`,
  //     },
  //     source: this.clientDomain,
  //   };

  //   return this.http.post(`${this.contactHost}/contact/SendActivity`, payLoad, {
  //     headers: new HttpHeaders(headers),
  //   });
  // }

  createContactActivity(
    contactId: string,
    interested: string,
    source: string,
    bodyText?: string
  ) {
    const payLoad = {
      contactId: contactId,
      body: {
        bodyType: 1,
        text:
          bodyText && bodyText !== ''
            ? bodyText
            : `Interested in ${interested}`,
      },
      source: source,
    };

    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/create-activity',
      payLoad
    );
  }

  createSystemAlert(
    tokenType: string,
    accessToken: string,
    userId: number,
    fName: string,
    lName: string,
    interested: string,
    text?: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      //Host: this.contactHost,
    };

    const payLoad = {
      tenant: 'pruvit',
      sender: 'urn:pruvit:profile:2',
      recipient: `urn:pruvit:profile:${userId}`,
      body: {
        bodyType: 6,
        body: [
          {
            bodyType: 8,
            body: {
              bodyType: 6,
              body: [
                {
                  text:
                    text && text !== ''
                      ? text
                      : `${fName} ${lName} is interested in ${interested}`,
                  bodyType: 1,
                },
                {
                  uri: `${this.clientDomain}/images/pruvit-social-blue.jpg`,
                  thumbnailUri: `${this.clientDomain}/images/pruvit-social-blue.jpg`,
                  bodyType: 2,
                },
              ],
            },
            culture: 'en',
          },
        ],
      },
    };

    return this.http.post(`${this.vaptHost}/feed/systemmessage`, payLoad, {
      headers: new HttpHeaders(headers),
    });
  }
  createSystemAlertNew(
    userId: number,
    fName: string,
    lName: string,
    interested: string,
    text?: string
  ) {
    const payLoad = {
      tenant: 'pruvit',
      sender: 'urn:pruvit:profile:2',
      recipient: `urn:pruvit:profile:${userId}`,
      body: {
        bodyType: 6,
        body: [
          {
            bodyType: 8,
            body: {
              bodyType: 6,
              body: [
                {
                  text:
                    text && text !== ''
                      ? text
                      : `${fName} ${lName} is interested in ${interested}`,
                  bodyType: 1,
                },
                {
                  uri: `${this.clientDomain}/images/pruvit-social-blue.jpg`,
                  thumbnailUri: `${this.clientDomain}/images/pruvit-social-blue.jpg`,
                  bodyType: 2,
                },
              ],
            },
            culture: 'en',
          },
        ],
      },
    };

    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/create-alert',
      payLoad
    );
  }

  updateContactName(contactId: string, firstName: string, lastName: string) {
    const payLoad = {
      contactId: contactId,
      name: {
        name: firstName + ' ' + lastName,
        firstName: firstName,
        middleName: '',
        lastName: lastName,
      },
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/'+this.apiClientPath+'/mvuser/update-contact-name',
      payLoad
    );
  }

  updateContactPhone(contactId: string, phone: string) {
    const payLoad = {
      contactId: contactId,
      phoneNumber: phone,
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/'+this.apiClientPath+'/mvuser/update-contact-number',
      payLoad
    );
  }

  updateContactEmail(contactId: string, email: string) {
    const payLoad = {
      contactId: contactId,
      email: email,
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/'+this.apiClientPath+'/mvuser/update-contact-email',
      payLoad
    );
  }

  updateContactSource(contactId: string, source: string) {
    const payLoad = {
      contactId: contactId,
      source: source,
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/'+this.apiClientPath+'/mvuser/update-contact-source',
      payLoad
    );
  }

  AddCustomClaims(contactId: string, claims: any[]) {
    const payLoad = {
      contactId: contactId,
      claims: claims,
    };

    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/add-custom-claims',
      payLoad
    );
  }

  getContactByUserId(userId: string) {
    const payLoad = {
      sponsorId: userId,
      claims: [],
      paging: {
        skipRecords: 0,
        pageSize: 100,
      },
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/user-contact',
      payLoad
    );
  }

  getContactByUserIdAndEmail(userId: string, email: string) {
    const payLoad = {
      userId: userId,
      email: email
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/get-contact-details',
      payLoad
    );
  }

  getContactByUserEmail(userId: string, email: string) {
    const payLoad = {
      userId: userId,
      email: email
    };
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/get-contact-id',
      payLoad
    );
  }
}
