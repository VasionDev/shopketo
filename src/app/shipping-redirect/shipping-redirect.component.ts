import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';

@Component({
  selector: 'app-shipping-redirect',
  templateUrl: './shipping-redirect.component.html',
  styleUrls: ['./shipping-redirect.component.css'],
})
export class ShippingRedirectComponent implements OnInit {
  selectedCountry = '';
  isPageFound = false;

  constructor(
    private dataService: AppDataService,
    private seoService: AppSeoService
  ) {}

  ngOnInit(): void {
    this.setSeo();
    this.getSelectedCountry();
  }

  getSelectedCountry() {
    this.isPageFound = false;

    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;

        if (this.selectedCountry.toLowerCase() === 'ca') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052021992';
        } else if (this.selectedCountry.toLowerCase() === 'au') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118072';
        } else if (this.selectedCountry.toLowerCase() === 'mo') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118092';
        } else if (this.selectedCountry.toLowerCase() === 'hk') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574291';
        } else if (this.selectedCountry.toLowerCase() === 'sg') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574551';
        } else if (this.selectedCountry.toLowerCase() === 'my') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118132';
        } else if (this.selectedCountry.toLowerCase() === 'mx') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052023472';
        } else if (this.selectedCountry.toLowerCase() === 'nz') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118492';
        } else if (this.selectedCountry.toLowerCase() === 'de') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118652';
        } else if (this.selectedCountry.toLowerCase() === 'gb') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574911';
        } else if (this.selectedCountry.toLowerCase() === 'it') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574651';
        } else if (this.selectedCountry.toLowerCase() === 'es') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574931';
        } else if (this.selectedCountry.toLowerCase() === 'nl') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118712';
        } else if (this.selectedCountry.toLowerCase() === 'at') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118532';
        } else if (this.selectedCountry.toLowerCase() === 'pl') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574671';
        } else if (this.selectedCountry.toLowerCase() === 'ie') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118672';
        } else if (this.selectedCountry.toLowerCase() === 'se') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574891';
        } else if (this.selectedCountry.toLowerCase() === 'hu') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574631';
        } else if (this.selectedCountry.toLowerCase() === 'fr') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574591';
        } else if (this.selectedCountry.toLowerCase() === 'pt') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052574871';
        } else if (this.selectedCountry.toLowerCase() === 'fi') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052470551';
        } else if (this.selectedCountry.toLowerCase() === 'be') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052118552';
        } else if (this.selectedCountry.toLowerCase() === 'ro') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360059692491-Shipping-Policy-Romania';
        } else if (this.selectedCountry.toLowerCase() === 'si') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415762421645-Shipping-Policy-Slovenia';
        } else if (this.selectedCountry.toLowerCase() === 'sk') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415664144909-Shipping-Policy-Slovakia';
        } else if (this.selectedCountry.toLowerCase() === 'mt') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415610371853-Shipping-Policy-Malta';
        } else if (this.selectedCountry.toLowerCase() === 'lu') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415548585997-Shipping-Policy-Luxembourg';
        } else if (this.selectedCountry.toLowerCase() === 'lt') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415518885261-Shipping-Policy-Lithuania';
        } else if (this.selectedCountry.toLowerCase() === 'lv') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415453636493-Shipping-Policy-Latvia';
        } else if (this.selectedCountry.toLowerCase() === 'gr') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415372654477-Shipping-Policy-Greece';
        } else if (this.selectedCountry.toLowerCase() === 'ee') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415350554765-Shipping-Policy-Estonia';
        } else if (this.selectedCountry.toLowerCase() === 'dk') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16415327976973-Shipping-Policy-Denmark';
        } else if (this.selectedCountry.toLowerCase() === 'cz') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16414408436621-Shipping-Policy-Czech-Republic';
        } else if (this.selectedCountry.toLowerCase() === 'cy') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16414092011021-Shipping-Policy-Cyprus';
        } else if (this.selectedCountry.toLowerCase() === 'hr') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16414049737869-Shipping-Policy-Croatia';
        } else if (this.selectedCountry.toLowerCase() === 'bg') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/16413922677517-Shipping-Policy-Bulgaria';
        } else {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052472171';
        }
      }
    );
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('Shipping Policy');
    this.seoService.updateDescription(
      'Thank you for visiting and shopping Prüvit. Following are the terms and conditions that constitute our Shipping Policy.'
    );

    this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('noindex,follow');
      }
    });
  }
}
