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
