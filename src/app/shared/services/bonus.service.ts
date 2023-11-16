import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BonusGatewayInvitationResponse } from 'src/app/customer-dashboard/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BonusService {
  url!: string;
  tenant!: string;
  constructor(private http: HttpClient) {
    this.url = environment.bonusServiceIrl;
    this.tenant = environment.tenant;
  }

  getBonusMeta(userId: string, lang: string): Observable<any> {
    return this.http.get<any>(
      this.url +
        '/Bonus/GetBonusesMeta?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getBonusInfo(
    userId: string,
    productId: string,
    lang: string
  ): Observable<any> {
    return this.http.get<any>(
      this.url +
        '/Bonus/GetBonusInfo?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId +
        '&productId=' +
        productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getExpCreditsInfo(userId: string, productId: string, lang: string): Observable<any> {
    return this.http.get<any>(
      this.url +
      '/Product/Credits/GetExpiringCredits?userId=urn:' +
      this.tenant +
      ':profile:' +
      userId +
      '&productId=' +
      productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  checkBonusExpireInfo(productId: string, lang: string): Observable<any> {
    return this.http.get<any>(
      this.url + '/Product/CheckAvailability/' + productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getBonusCredits(
    userId: string,
    productId: string,
    lang: string
  ): Observable<any> {
    return this.http.get<any>(
      this.url +
        '/Bonus/GetAvailableCredits?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId +
        '&productId=' +
        productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getFriends(
    userId: string,
    productId: string,
    lang: string,
    apiPath: string
  ): Observable<any> {
    return this.http.get<any>(
      this.url +
        '/Bonus/' +
        apiPath +
        '?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId +
        '&productId=' +
        productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getPendingLeads(userId: string, productId: string, lang: string) {
    return this.http.get<any>(
      this.url +
        '/Bonus/PendingLeads?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId +
        '&productId=' +
        productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getInvitationStatusInfo(
    userId: string,
    productId: string,
    lang: string
  ): Observable<BonusGatewayInvitationResponse> {
    return this.http.get<BonusGatewayInvitationResponse>(
      this.url +
        '/Bonus/GetInvitationStatusInformation?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId +
        '&productId=' +
        productId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getInviteLink(userId: string, contactId: string, lang: string) {
    return this.http.get(
      this.url +
        '/Bonus/GetLinkByRecipient?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId +
        '&contactId=' +
        contactId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  getUserVipProgress(userId: string, lang: string) {
    return this.http.get(
      this.url +
        '/Vip/Status?userId=urn:' +
        this.tenant +
        ':profile:' +
        userId,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }
  
  createPersonalInvite(requestBody: any, lang: string) {
    return this.http.post<any>(
      this.url + '/Offer/ComposePersonal',
      requestBody,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }

  recycleCredit(requestBody: any, lang: string) {
    return this.http.post<any>(
      this.url + '/Offer/RecycleOfferProposal',
      requestBody,
      {
        headers: new HttpHeaders({
          'Client-Id': this.tenant,
          'Accept-Language': lang,
        }),
      }
    );
  }
  
}
