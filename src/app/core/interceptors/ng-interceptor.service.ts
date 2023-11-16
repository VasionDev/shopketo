import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class NgInterceptorService implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private oidcSecurityService: OidcSecurityService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let requestToForward = req;

    if (
      req.url.includes(environment.phraseBase) ||
      req.url.includes('upload.wistia.com')
    ) {
      return next.handle(requestToForward);
    }
    if (req.url.includes(environment.accountHost)) {
      return next.handle(requestToForward);
    }

    if (req.url.includes('connect/token')) {
      return next.handle(requestToForward);
    }

    if (req.url.includes(environment.unicomShortenUrlEndPoint)) {
      return next.handle(requestToForward);
    }

    if (this.oidcSecurityService === undefined) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }

    if (this.oidcSecurityService !== undefined) {
      const impersonationSession = sessionStorage.getItem('ImpersonationUser');
      const impersonationData =
        impersonationSession !== null ? JSON.parse(impersonationSession) : null;
      if (impersonationData && impersonationData.access_token !== '') {
        let token = impersonationData.access_token;
        let tokenValue = 'Bearer ' + token;
        requestToForward = req.clone({
          setHeaders: { Authorization: tokenValue },
        });
      } else {
        let token = this.oidcSecurityService.getToken();
        if (token !== '') {
          let tokenValue = 'Bearer ' + token;
          requestToForward = req.clone({
            setHeaders: { Authorization: tokenValue },
          });
        }
      }
    } else {
      console.debug('OidcSecurityService undefined: NO auth header');
    }
    return next.handle(requestToForward);
  }
}
