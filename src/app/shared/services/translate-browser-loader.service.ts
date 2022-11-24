import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  makeStateKey,
  StateKey,
  TransferState,
} from '@angular/platform-browser';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslateBrowserLoaderService {
  private prefix: string = 'assets/i18n/';
  private suffix: string = '.json';

  constructor(private transferState: TransferState, private http: HttpClient) {}

  public getTranslation(lang: string): Observable<any> {
    const key: StateKey<number> = makeStateKey<number>(
      'transfer-translate-' + lang
    );

    const data = this.transferState.get(key, null);

    if (data) {
      return new Observable((observer) => {
        observer.next(data);
        observer.complete();
      });
    } else {
      return new TranslateHttpLoader(
        this.http,
        this.prefix,
        this.suffix
      ).getTranslation(lang);
    }
  }
}
