import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserEmitterService {
  private userObservable: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor() {}

  getProfileObs(): Observable<any> {
    return this.userObservable.asObservable();
  }

  setProfileObs(user: any) {
    this.userObservable.next(user);
  }
}
