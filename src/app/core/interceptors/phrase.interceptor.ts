import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable()
export class PhraseInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const headers = {
      Authorization: environment.phraseAppToken,
    };
    const modifiedRequest = request.clone({
      headers: new HttpHeaders(headers),
    });
    if (request.url.includes(environment.phraseBase)) {
      return next.handle(modifiedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error);
        })
      );
    }
    return next.handle(request);
  }
}
