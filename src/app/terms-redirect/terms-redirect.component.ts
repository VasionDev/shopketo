import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';
import { isEuropeanCountry } from '../shared/utils/country-list';

@Component({
  selector: 'app-terms-redirect',
  templateUrl: './terms-redirect.component.html',
  styleUrls: ['./terms-redirect.component.css'],
})
export class TermsRedirectComponent implements OnInit {
  selectedCountry = '';
  isPageFound = false;

  constructor(
    private dataService: AppDataService,
    private seoService: AppSeoService
  ) {}

  ngOnInit(): void {
    this.setSeo();
    this.getRedirectTermPage();
  }

  getRedirectTermPage() {
    this.isPageFound = false;
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
        if (this.selectedCountry.toLowerCase() === 'au') {
          this.isPageFound = true;
          window.location.href = 'https://support.justpruvit.com/hc/articles/4427525130381-Terms-Australia';
        }else if (this.selectedCountry.toLowerCase() === 'nz') {
          this.isPageFound = true;
          window.location.href = 'https://support.justpruvit.com/hc/articles/4427981556749-Terms-New-Zealand';
        }else {
          this.isPageFound = true;
          window.location.href = 'https://support.justpruvit.com/hc/articles/360052190452-Terms';
        }
      }
    );
  }

  getSelectedCountry() {
    this.isPageFound = false;

    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;

        if (this.selectedCountry.toLowerCase() === 'ca') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052021992';
        } else if (this.selectedCountry.toLowerCase() === 'au') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052118072';
        } else if (this.selectedCountry.toLowerCase() === 'mo') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052118092';
        } else if (this.selectedCountry.toLowerCase() === 'hk') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052574291';
        } else if (this.selectedCountry.toLowerCase() === 'sg') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052574551';
        } else if (this.selectedCountry.toLowerCase() === 'my') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052118132';
        } else if (this.selectedCountry.toLowerCase() === 'mx') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052023472';
        } else if (this.selectedCountry.toLowerCase() === 'nz') {
          // window.location.href =
          //   'https://support.justpruvit.com/hc/en-us/articles/360052118492';
        } else if (isEuropeanCountry(this.selectedCountry.toUpperCase())) {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452-Terms';
        } /*else if (this.selectedCountry.toLowerCase() === 'gb') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'it') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/it/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'es') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'nl') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'at') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'pl') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'ie') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'se') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'hu') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'fr') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'pt') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'fi') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'be') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        } else if (this.selectedCountry.toLowerCase() === 'ro') {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        }*/ else {
          this.isPageFound = true;
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052190452';
        }
      }
    );
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('Terms');
    this.seoService.updateDescription(
      'The use of this site or any other site owned or maintained by Pruvit Ventures, Inc. (“Company”) is governed by the policies, terms and conditions'
    );

    this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('noindex,follow');
      }
    });
  }
}
