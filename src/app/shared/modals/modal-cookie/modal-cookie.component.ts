import { Component, OnDestroy, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-cookie',
  templateUrl: './modal-cookie.component.html',
  styleUrls: ['./modal-cookie.component.css'],
})
export class ModalCookieComponent implements OnInit, OnDestroy {
  preference = false;
  cookieChecked = {
    performance: true,
    analytics: true,
    advertising: true,
  };
  privacyPolicyUrl = '';
  private destroy$ = new Subject();

  constructor(
    private cookieService: CookieService,
    private dataService: AppDataService
  ) {
    const isCookiePresent = this.cookieService.check('CookieConsent');

    if (isCookiePresent) {
      const cookieConsent = this.cookieService.get('CookieConsent');
      const parsedCookieConsent = JSON.parse(cookieConsent);

      this.cookieChecked = {
        performance: parsedCookieConsent.performance,
        analytics: parsedCookieConsent.analytics,
        advertising: parsedCookieConsent.advertising,
      };
    }
  }

  ngOnInit(): void {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language: string) => {
        if (language === 'de') {
          this.privacyPolicyUrl =
            'https://support.justpruvit.com/hc/de/articles/360052642111';
        } else if (language === 'it') {
          this.privacyPolicyUrl =
            'https://support.justpruvit.com/hc/it/articles/360052642111';
        } else {
          this.privacyPolicyUrl =
            'https://support.justpruvit.com/hc/en-us/articles/360052642111';
        }
      });
  }

  togglePreference() {
    this.cookieChecked = {
      performance: true,
      analytics: false,
      advertising: false,
    };

    this.preference = !this.preference;
  }

  onCookieChecked(event: any, type: 'ANALYTICS' | 'ADVERTISING') {
    if (type === 'ANALYTICS') {
      this.cookieChecked.analytics = event.target.checked;
    }
    if (type === 'ADVERTISING') {
      this.cookieChecked.advertising = event.target.checked;
    }
  }

  onSaveCookies() {
    this.dataService.setCookieDialogStatus(true);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 365);

    this.cookieService.set(
      'CookieConsent',
      JSON.stringify(this.cookieChecked),
      expiredDate
    );

    if (!this.cookieChecked.analytics) {
      window.location.reload();
    }
  }

  onClickAcceptCookies() {
    this.dataService.setCookieDialogStatus(true);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 365);

    this.cookieService.set(
      'CookieConsent',
      JSON.stringify({
        performance: true,
        analytics: true,
        advertising: true,
      }),
      expiredDate
    );
  }

  onRejectCookies() {
    this.dataService.setCookieDialogStatus(true);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 365);

    this.cookieService.set(
      'CookieConsent',
      JSON.stringify({
        performance: true,
        analytics: false,
        advertising: false,
      }),
      expiredDate
    );

    window.location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
