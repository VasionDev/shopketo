import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';
import { AppUtilityService } from '../shared/services/app-utility.service';
declare var $: any;
declare var aboutSliderJs: any;
declare var aosJS: any;

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  isCountryAvailable = true;
  referrer: any = {};
  isLoaded = false;
  allowedCountry = ['US', 'CA'];

  constructor(
    private dataService: AppDataService,
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
    $(document).ready(() => {
      aboutSliderJs();
      $('body').on('hidden.bs.modal', '#pruvitTVModal', function () {
        $('#pruvitTVModal').remove();
      });
    });
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
        if (!this.allowedCountry.includes(countryCode))
          this.isCountryAvailable = false;
      });
  }

  onClickPruvitTv() {
    const videoLink = `https://pruvit.tv/stream?embed=106`;
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
    return false;
  }

  setSeo() {
    this.seoService.updateTitle('Our Story');
    this.meta.updateTag( { property: 'og:title', content: 'Our Story' });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
