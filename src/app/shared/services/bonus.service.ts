import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BonusService {
  url!: string;
  constructor(private http: HttpClient) {
    this.url = environment.bonusServiceIrl;
  }

  getBonusMeta(userId: string, lang: string): Observable<any> {
    return this.http.get<any>(
      this.url + '/Bonus/GetBonusesMeta?userId=urn:pruvit:profile:' + userId,
      {
        headers: new HttpHeaders({
          "Client-Id": 'pruvit',
          "Accept-Language": lang
        })
      }
    );
  }

  getBonusInfo(userId: string, productId: string, lang: string): Observable<any> {
    return this.http.get<any>(
      this.url + '/Bonus/GetBonusInfo?userId=urn:pruvit:profile:' + userId + '&productId=' + productId,
      {
        headers: new HttpHeaders({
          "Client-Id": 'pruvit',
          "Accept-Language": lang
        })
      }
    );
  }

  getFriends(userId: string, productId: string, lang: string): Observable<any> {
    return this.http.get<any>(
      this.url + '/Bonus/GetFriendsInformation?userId=urn:pruvit:profile:' + userId + '&productId=' + productId,
      {
        headers: new HttpHeaders({
          "Client-Id": 'pruvit',
          "Accept-Language": lang
        })
      }
    );
  }
}
