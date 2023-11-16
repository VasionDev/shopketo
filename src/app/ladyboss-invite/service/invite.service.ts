import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  bonusApiUrl!: string;
  inviteApiUrl!: string;
  newgenApiUrl!: string;
  inviteAuthClientId!: string;
  inviteAuthClienScrt!: string;
  ladybossAuthApiUrl!: string;
  inviteAuthScopes!: string;
  contactApiUrl!: string;
  apiDomain!: string;

  inviteAPIToken: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.bonusApiUrl = environment.bonusServiceIrl;
    this.inviteApiUrl = environment.inviteApiUrl;
    this.ladybossAuthApiUrl = environment.iaaConfig.stsServer;
    this.inviteAuthScopes = environment.inviteScopes;
    this.inviteAuthClientId = environment.inviteClientId;
    this.inviteAuthClienScrt = environment.inviteClientSecret;
    this.newgenApiUrl = environment.newgenUrl;
    this.apiDomain = environment.apiDomain;
    this.contactApiUrl = environment.contactHost;
  }

  getAuthToken() {
    //return;
    var urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'client_credentials');
    urlencoded.append('scope', this.inviteAuthScopes);
    return this.http.post<any>(
      this.ladybossAuthApiUrl + '/connect/token',
      urlencoded,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            btoa(this.inviteAuthClientId + ':' + this.inviteAuthClienScrt),
        }),
      }
    );
  }

  get inviteAPIToken$() {
    return this.inviteAPIToken.asObservable();
  }

  setInviteAPIToken(toekn: any) {
    this.inviteAPIToken.next(toekn);
  }

  getReferrerData(refCode: string) {
    return this.http.get<any>(
      this.apiDomain + '/wp-json/wp/pruvitnow/referrer/?ref_code=' + refCode
    );
  }

  getContactData(contactId: string) {
    return this.http.get<any>(
      this.apiDomain +
        '/wp-json/wp/ladyboss/get-contact-info/?contactId=' +
        contactId
    );
  }

  createContact(
    tokenType: string,
    accessToken: string,
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    countryCode: string,
    phone: string,
    source: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    };

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
      phoneNumber: phone !== '' ? phone : '',
      source: source !== '' ? source : 'InviteFunnel',
      status: 'Not Contacted',
    };

    return this.http.post(
      `${this.contactApiUrl}/contact/CreateAndGenerateTrackingCode`,
      payLoad,
      {
        headers: new HttpHeaders(headers),
      }
    );
  }

  getPolicies(country: string) {
    return this.http.get<any>(
      this.newgenApiUrl + 'api/policy?countryCode=' + country
    );
  }

  getOffer(offerId: string, lang: string, token: any) {
    return this.http.get<any>(
      this.bonusApiUrl + '/Offer/GetOffer?offerId=' + offerId,
      {
        headers: new HttpHeaders({
          'Client-Id': 'ladyboss',
          'Accept-Language': lang,
          Authorization: token.token_type + ' ' + token.access_token,
        }),
      }
    );
  }

  getProposal(offerId: string, contactId: string, lang: string, token: any) {
    return this.http.get<any>(
      this.bonusApiUrl +
        '/Offer/GetProposalInvite?offerId=' +
        offerId +
        '&contactId=' +
        contactId,
      {
        headers: new HttpHeaders({
          Authorization: token.token_type + ' ' + token.access_token,
        }),
      }
    );
  }

  checkPhone(phoneCountry: number, phoneNumber: number) {
    return this.http.get<any>(
      this.apiDomain +
        '/wp-json/wp/ladyboss/mvuser/phone-check?phoneCountry=' +
        phoneCountry +
        '&phoneNumber=' +
        phoneNumber
    );
  }

  checkEmail(email: string) {
    return this.http.get<any>(
      this.apiDomain + '/wp-json/wp/ladyboss/mvuser/email-check?email=' + email
    );
  }

  registerUser(request: any, token: any) {
    return this.http.post<any>(
      this.bonusApiUrl + '/Invite/AcceptInvite',
      request,
      {
        headers: new HttpHeaders({
          Authorization: token.token_type + ' ' + token.access_token,
        }),
      }
    );
  }

  updateNotificationSettings(params: string) {
    return this.http.get<any>(
      this.apiDomain +
        '/wp-json/wp/ladyboss/mvuser/update-notification-settings' +
        params
    );
  }

  getAutoLoginToken(params: string) {
    return this.http.get<any>(
      this.apiDomain + '/wp-json/wp/ladyboss/mvuser/auto-login' + params
    );
  }

  createPersonalInvite(request: any) {
    return this.http.post<any>(
      this.bonusApiUrl + '/Invite/CreatePersonalInvite',
      request
    );
  }

  recycleCredit(request: any) {
    return this.http.post<any>(
      this.bonusApiUrl + '/Invite/RecycleInvite',
      request
    );
  }
}
