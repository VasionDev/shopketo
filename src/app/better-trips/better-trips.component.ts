import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';
declare var $: any;
declare var betterTripsSliderJs: any;
declare var aosJS: any;

@Component({
  selector: 'app-better-trips',
  templateUrl: './better-trips.component.html',
  styleUrls: ['./better-trips.component.css'],
})
export class BetterTripsComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  isCountryAvailable = true;
  subscriptions: SubscriptionLike[] = [];
  referrer: any = {};
  isLoaded = false;

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private seoService: AppSeoService,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.setSeo();
    $(document).ready(() => {
      betterTripsSliderJs();
      aosJS();
      $('body').on('hidden.bs.modal', '#pruvitTVModal', function () {
        $('#pruvitTVModal').remove();
      });
    });
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);
          //this.getProducts();
        }
      )
    );
  }

  getReferrer() {
    this.subscriptions.push(
      this.dataService.currentReferrerData$.subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      })
    );
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  setSeo() {
    this.seoService.updateTitle('Better Trips');
    this.meta.updateTag( { property: 'og:title', content: 'Better Trips' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
