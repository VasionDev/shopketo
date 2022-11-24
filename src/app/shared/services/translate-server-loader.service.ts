import { Inject, Injectable } from '@angular/core';
import {
  makeStateKey,
  StateKey,
  TransferState,
} from '@angular/platform-browser';
import { join } from 'path';
import { Observable } from 'rxjs';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root',
})
export class TranslateServerLoaderService {
  constructor(
    private transferState: TransferState,
    @Inject(String) private prefix: string = 'i18n',
    @Inject(String) private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    return new Observable((observer) => {
      const assets_folder = join(
        process.cwd(),
        'dist',
        'ng-shopketo',
        'browser',
        'assets',
        this.prefix
      );

      const jsonData = JSON.parse(
        fs.readFileSync(`${assets_folder}/${lang}${this.suffix}`, 'utf8')
      );

      const key: StateKey<number> = makeStateKey<number>(
        'transfer-translate-' + lang
      );
      this.transferState.set(key, jsonData);

      observer.next(jsonData);
      observer.complete();
    });
  }
}
