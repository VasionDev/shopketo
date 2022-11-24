import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class AppUtilityServiceStub {
  everyMonth() {
    return of();
  }

  oneTime() {
    return of();
  }

  getUrlParameter(str: string) {
    return false;
  }

  isEuropeanCountry() {}

  createDynamicComponent() {}

  getOneTimeStorage(country: string, language: string) {
    return [];
  }
  getEveryMonthStorage(country: string, language: string) {
    return [];
  }

  getEditSelectionsStatus() {}
}
