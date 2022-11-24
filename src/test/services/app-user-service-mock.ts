import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class AppUserServiceStub {
  everyMonth() {
    return of();
  }

  oneTime() {
    return of();
  }

  checkValidUser() {
    return true;
  }
}
