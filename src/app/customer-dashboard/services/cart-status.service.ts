import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CartStatusService {
  newgenPath: string;
  constructor(private http: HttpClient) {
    this.newgenPath = environment.newgenUrl;
  }

  cartStatusGet(): Observable<any> {
    return this.http.get<any>(this.newgenPath + 'api/commerce/cart-status');
  }

  cartStatusAcknowledge(key: any): Observable<any> {
    return this.http.post<any>(
      this.newgenPath + 'api/commerce/cart-status/acknowledge',
      { uniqueKey: key }
    );
  }
}
