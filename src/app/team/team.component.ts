import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppApiService } from '../shared/services/app-api.service';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';
import { AppUtilityService } from '../shared/services/app-utility.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  isCountryAvailable = true;
  specialists: any = [];
  referrer: any = {};
  modalData: any = null;
  isLoaded = false;
  allowedCountry = ['US', 'CA'];

  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private translate: TranslateService,
    private utilityService: AppUtilityService,
    private router: Router,
    private seoService: AppSeoService,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.setRedirectURL();
    this.setSeo();
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((height: number) => {
        this.discountHeight = height;
      });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
      });
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((countryCode: string) => {
        this.selectedCountry = countryCode;
        if (this.allowedCountry.includes(countryCode)) {
          this.getSpecialists();
        } else {
          this.isCountryAvailable = false;
        }
      });
  }

  getSpecialists() {
    this.apiService
      .getSpecialists()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.specialists = res;
        this.isLoaded = true;
      });
  }

  
  setSeo() {
    this.seoService.updateTitle('Meet the team');
    this.meta.updateTag( { property: 'og:title', content: 'Meet the team' });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
