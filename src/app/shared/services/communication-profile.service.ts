import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommunicationProfileService {
  bonusPath?: string;
  constructor(private http: HttpClient) {
    this.bonusPath = environment.bonusServiceIrl;
  }

  getUserComProfile(): Observable<any> {
    return this.http.get<any>(
      this.bonusPath + '/ComProfile'
    );
  }

  getAvailableCountries(): Observable<any> {
    return this.http.get<any>(
      this.bonusPath + '/ComProfile/GetAvailableCountries'
    );
  }

  updateProfile(profile: any): Observable<any> {
    return this.http.post<any>(
      this.bonusPath + '/ComProfile',
      profile
    );
  }
}
