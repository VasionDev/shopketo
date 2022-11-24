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

  private userProStatus = new BehaviorSubject(false);

  constructor(private http: HttpClient) {
    this.clientDomain = environment.clientDomain;
    this.apiDomain = environment.apiDomain;
    this.contactHost = environment.contactHost;
    this.vaptHost = environment.vaptHost;
    this.checkoutDomain = environment.checkoutDomain;
  }

  get userProStatus$() {
    return this.userProStatus.asObservable();
  }

  setUserProStatus(status: boolean) {
    this.userProStatus.next(status);
  }

  getCustomizeData(userId: number, getToken: boolean) {
    return this.http.get<any>(
      this.apiDomain +
        '/wp-json/wp/pruvitnow/mvuser/customize-data/?userId=' +
        userId +
        '&getToken=' +
        getToken
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
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/customize-data/approve',
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

  saveTrackingeData(data: object, userId: number) {
    return this.http.post<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/mvuser/tracking-data',
      {
        userId: userId,
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

  createContactId(
    tokenType: string,
    accessToken: string,
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    countryCode: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      //Host: this.contactHost.split('https://')[0],
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
      source: this.clientDomain,
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

  createContactActivity(
    tokenType: string,
    accessToken: string,
    contactId: string,
    interested: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
      //Host: this.contactHost,
    };

    const payLoad = {
      contactId: contactId,
      body: {
        bodyType: 1,
        text: `Interested in ${interested}`,
      },
      source: this.clientDomain,
    };

    return this.http.post(`${this.contactHost}/contact/SendActivity`, payLoad, {
      headers: new HttpHeaders(headers),
    });
  }

  createSystemAlert(
    tokenType: string,
    accessToken: string,
    userId: number,
    fName: string,
    lName: string,
    interested: string
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
                  text: `${fName} ${lName} is interested in ${interested}`,
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
}
