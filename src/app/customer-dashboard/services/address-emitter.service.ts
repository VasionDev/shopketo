import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AddressEmitterService {
  private addressSubject$ = new BehaviorSubject<any>({});
  constructor() { }

  setAddress(address: any) {
    this.addressSubject$.next(address)
  }

  getAddress(): Observable<any> {
    return this.addressSubject$.asObservable()
  }
}
