import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
declare var $: any;
declare var ladybossHomeJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  tenant!: string;
  isStaging!: boolean;
  isCountryAvailable = true;
  discountHeight = 0;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private seoService: AppSeoService
  ) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    this.checkCountry();
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedCountry();
    if (this.tenant === 'ladyboss') {
      setTimeout(() => {
        ladybossHomeJS();
      });
    }
  }

  checkCountry() {
    const routeUrl = window.location.pathname.split('/')[1];
    const countryCode: string = routeUrl.toLowerCase();

    if (
      countryCode === 'ca' ||
      countryCode === 'au' ||
      countryCode === 'mo' ||
      countryCode === 'hk' ||
      countryCode === 'sg' ||
      countryCode === 'my' ||
      countryCode === 'tw' ||
      countryCode === 'jp' ||
      countryCode === 'mx' ||
      countryCode === 'nz' ||
      countryCode === 'de' ||
      countryCode === 'gb' ||
      countryCode === 'it' ||
      countryCode === 'es' ||
      countryCode === 'nl' ||
      countryCode === 'at' ||
      countryCode === 'pl' ||
      countryCode === 'ie' ||
      countryCode === 'se' ||
      countryCode === 'hu' ||
      countryCode === 'fr' ||
      countryCode === 'pt' ||
      countryCode === 'fi' ||
      countryCode === 'be' ||
      countryCode === 'ro' ||
      countryCode === 'bg' ||
      countryCode === 'hr' ||
      countryCode === 'ch' ||
      countryCode === 'cy' ||
      countryCode === 'cz' ||
      countryCode === 'dk' ||
      countryCode === 'ee' ||
      countryCode === 'gr' ||
      countryCode === 'lv' ||
      countryCode === 'lt' ||
      countryCode === 'lu' ||
      countryCode === 'mt' ||
      countryCode === 'sk' ||
      countryCode === 'si' ||
      countryCode === 'us' ||
      routeUrl === ''
    ) {
      this.isCountryAvailable = true;
    } else {
      this.isCountryAvailable = false;
    }

    this.setSeo();
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = height;
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.subscriptions.push(
      this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
        if (status) {
          if (this.isCountryAvailable) {
            this.seoService.updateTitle('');
            this.seoService.updateDescription('');
          } else {
            this.seoService.updateTitle('Page not found');
          }
        } else {
          if (this.isCountryAvailable) {
            this.seoService.updateTitle('');
            this.seoService.updateDescription('');
            this.seoService.updateRobots('index,follow');
          } else {
            this.seoService.updateTitle('Page not found');
            this.seoService.updateRobots('noindex,follow');
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
