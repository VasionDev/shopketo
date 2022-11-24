import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreditCardCreate } from '../../customer-dashboard/models/creditCardCreate';
import { BillingAddress } from '../../customer-dashboard/models/billingAddress';
import { NotificationSettingUpdate } from '../../customer-dashboard/models/notificationSettingUpdate';
import { Person } from '../../customer-dashboard/models/person';
import { SocialSetting } from '../../customer-dashboard/models/socialSetting';
import { Verification } from '../../customer-dashboard/models/verificationPhone';
@Injectable({
  providedIn: 'root'
})
// let copyRequestWithoutProfileId = (request: any) => {
//   if (request['profileId'] !== undefined) delete request.profileId;

//   return request;
// };
export class NewgenApiService {
  newgenPath: string;
  vaptPath: string

  constructor(private http: HttpClient) {
    this.newgenPath = environment.newgenUrl;
    this.vaptPath = environment.vaptHost;
  }

  getPersonal(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/report/personal');
  }

  getOrderHistory(
    nocount: string,
    pageSize: number,
    startIndex: number,
    filter?: string
  ): Observable<any> {

    let url = this.newgenPath +
      'api/commerce/order/history?noCount=' +
      nocount +
      '&pageSize=' +
      pageSize +
      '&startIndex=' +
      startIndex +
      '&sort=dateCreated+desc'
    if (filter) {
      url = url + '&filter=' + filter
    }
    return this.http.get<any>(
      url
    );
  }

  getAddresses(
    nocount: string,
    pageSize: number,
    startIndex: number,
    filter?: string
  ): Observable<any> {

    let url = this.newgenPath +
      'api/report/AddressProfile?noCount=' +
      nocount +
      '&pageSize=' +
      pageSize +
      '&startIndex=' +
      startIndex +
      '&sort=date+desc'
    if (filter) {
      url = url + '&filter=' + filter
    }
    return this.http.get<any>(
      url
    );
  }

  cartPendingPaymentGet(userId: string): Observable<any> {
    return this.http.get<any>(
      this.newgenPath + 'api/commerce/cart-pending-payment',
      { params: { userId: userId } }
    );
  }

  getPaymentProfile(request: any): Observable<any> {
    return this.http.get<any>(
      this.newgenPath +
      'api/paymentprofile' +
      (request.profileId ? '/' + request.profileId : ''),
      { params: this.copyWithoutProfileId(request) }
    );
  }

  deletePaymentProfile(profileId: number): Observable<any> {
    return this.http.delete<any>(
      this.newgenPath + 'api/paymentprofile/' + profileId,
      { params: { paymentProfileId: profileId } }
    );
  }

  deleteAddressProfile(profileId: number): Observable<any> {
    return this.http.delete<any>(
      this.newgenPath + 'api/addressprofile/' + profileId
    );
  }

  updatePaymentProfile(id: number, request: any): Observable<any> {
    return this.http.patch<any>(
      this.newgenPath + 'api/paymentprofile/storedcard/' + id,
      request
    );
  }

  getAddressProfile(request: any): Observable<any> {
    return this.http.get<any>(
      this.newgenPath +
      'api/addressprofile' +
      (request.profileId ? '/' + request.profileId : ''),
      { params: this.copyWithoutProfileId(request) }
    );
  }

  creditCardProfileCreate(request: CreditCardCreate): Observable<any> {
    return this.http.post<CreditCardCreate>(
      this.newgenPath + 'api/paymentprofile/creditcard',
      request
    );
  }

  verifyAddress(address: BillingAddress): Observable<any> {
    return this.http.put<BillingAddress>(
      this.newgenPath + 'api/verify/address',
      address
    );
  }

  createAddressProfile(address: BillingAddress): Observable<any> {
    return this.http.post<BillingAddress>(
      this.newgenPath + 'api/addressprofile',
      address
    );
  }

  getCollection(number: number): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/lcollection/' + number);
  }

  getNotificationSettings(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/social/notification-setting');
  }

  updateNotificationSettings(setting: NotificationSettingUpdate): Observable<any> {
    return this.http.patch<any>(this.newgenPath + 'api/social/notification-setting', setting);
  }

  copyWithoutProfileId(request: any) {
    if (request['profileId'] !== undefined) delete request.profileId;
    return request;
  }

  getReferrer(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/commission/parent', { params: { expandContact: true, expandImage: true } });
  }

  checkReferrerCode(code: string): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/social/referrer-code/check', { params: { code: code } });
  }

  updateReferrerCode(code: string, newCode: string): Observable<any> {
    return this.http.patch<any>(this.newgenPath + 'api/social/referrer-code', { code: code, newCode: newCode });
  }

  setAsDefault(id: number): Observable<any> {
    return this.http.post<BillingAddress>(
      this.newgenPath + 'api/addressprofile/setdefault',
      { profileId: id }
    );
  }

  getActiveAutoships(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/autoship?expandSubscriptionShipping=true');
  }

  personProfileUpdate(person: Person): Observable<any> {
    return this.http.patch<Person>(this.newgenPath + 'api/person', person);
  }

  socialSettingUpdate(socialSetting: SocialSetting): Observable<any> {
    return this.http.patch<SocialSetting>(this.newgenPath + 'api/setting/' + socialSetting.typeId, socialSetting);
  }

  getProfileSettings(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/setting');
  }

  getProfilePersonalSettings(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/report/personal?noCount=true');
  }

  verifyPhoneSend(phone: Verification): Observable<any> {
    return this.http.put<Verification>(this.newgenPath + 'api/verify/phone/send', phone);
  }

  verifyCodeSend(phone: Verification): Observable<any> {
    return this.http.put<Verification>(this.newgenPath + 'api/verify/phone', phone);
  }

  changePassword(password: string): Observable<any> {
    return this.http.post<any>(this.newgenPath + 'api/user/password', { password: password });
  }

  uploadProfileImage(image: any): Observable<any> {
    return this.http.post<any>(
      this.newgenPath + 'mvc/upload/image',
      image,
    );
  }

  getNameChangeHistory(

  ): Observable<any> {
    let url = this.newgenPath +
      'api/report/UserNameChangeRequests?pageSize=1'
    return this.http.get<any>(
      url
    );
  }

  getCountryChangeHistory(

  ): Observable<any> {
    let url = this.newgenPath +
      'api/report/UserCountryChangeRequests?pageSize=1'
    return this.http.get<any>(
      url
    );
  }

  getPhoneVerification(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/person?expandContact=true');
  }

  getWalletStatus(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/payout/wallet-status');
  }

  postCountry(addressProfileId: number, countryCode: string): Observable<any> {
    return this.http.post<any>(
      this.newgenPath + 'api/user/country',
      { addressProfileId: addressProfileId, newCountryCode: countryCode },
    );
  }

  getPaymentReview(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/commerce/invoice-in-payment-review?expandGeneral=true');
  }

  adBanners(): Observable<any> {
    return this.http.get<any>(this.vaptPath + '/Ads/User/Targeted?Client=web');
  }

  invoiceGetCode(invoiceId: number): Observable<any> {
    return this.http.post<any>(
      this.newgenPath + 'api/commerce/invoice-in-payment-review/phone/send',
      { invoiceId: invoiceId },
    );
  }

  invoiceCodeVerify(invoiceId: number, code: string): Observable<any> {
    return this.http.post<any>(
      this.newgenPath + 'api/commerce/invoice-in-payment-review/phone/verify',
      { invoiceId: invoiceId, code: code },
    );
  }

  agentUpdate(imageString64Base: any): Observable<any> {
    return this.http.patch<Person>(this.newgenPath + 'api/commission/agents', { expandImage: true, imageString64Base });
  }
}
