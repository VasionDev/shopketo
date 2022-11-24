import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class OidcSecurityServiceStub {
  checkAuth() {
    return of(true);
  }
}
