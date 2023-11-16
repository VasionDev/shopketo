import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { isEuropeanCountry } from 'src/app/shared/utils/country-list';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirm-country',
  templateUrl: './confirm-country.component.html',
  styleUrls: ['./confirm-country.component.css'],
})
export class ConfirmCountryComponent implements OnInit {
  @Output() bannerHeightEvent = new EventEmitter<boolean>(false);
  selectedCountry = '';

  countries: any[] = [];
  americas: any[] = [];
  asiaPacifics: any[] = [];
  europes: any[] = [];

  isRedirectedCountry = false;
  redirectedCountryFlag = '';
  redirectedCountryName = '';
  tenant: string = '';

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getSelectedCountry();
    this.getCountries();
    this.getRedirectedCountry();
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  getCountries() {
    this.dataService.currentCountries$.subscribe((countries: any) => {
      if (countries) {
        this.countries = countries.filter(
          (country: any) => country.active === '1'
        );
        this.getGroupWiseCountries(this.countries);
      }
    });
  }

  getGroupWiseCountries(countries: any[]) {
    const tempAmericas: any[] = [],
      tempAsiaPacifics: any[] = [],
      tempEuropes: any[] = [];

    countries.forEach((country: any) => {
      if (
        country.country_code === 'CA' ||
        country.country_code === 'MX' ||
        country.country_code === 'US'
      ) {
        tempAmericas.push(country);
      }
      if (
        country.country_code === 'AU' ||
        country.country_code === 'HK' ||
        country.country_code === 'MO' ||
        country.country_code === 'MY' ||
        country.country_code === 'NZ' ||
        country.country_code === 'SG' ||
        country.country_code === 'TW' ||
        country.country_code === 'JP'
      ) {
        tempAsiaPacifics.push(country);
      }
      if (
        country.country_code === 'AT' ||
        country.country_code === 'BE' ||
        country.country_code === 'FI' ||
        country.country_code === 'FR' ||
        country.country_code === 'DE' ||
        country.country_code === 'HU' ||
        country.country_code === 'IE' ||
        country.country_code === 'IT' ||
        country.country_code === 'NL' ||
        country.country_code === 'PL' ||
        country.country_code === 'PT' ||
        country.country_code === 'ES' ||
        country.country_code === 'SE' ||
        country.country_code === 'CH' ||
        country.country_code === 'RO' ||
        country.country_code === 'GB' ||
        country.country_code === 'BG' ||
        country.country_code === 'HR' ||
        country.country_code === 'CY' ||
        country.country_code === 'CZ' ||
        country.country_code === 'DK' ||
        country.country_code === 'EE' ||
        country.country_code === 'GR' ||
        country.country_code === 'LV' ||
        country.country_code === 'LT' ||
        country.country_code === 'LU' ||
        country.country_code === 'MT' ||
        country.country_code === 'SK' ||
        country.country_code === 'SI'
      ) {
        tempEuropes.push(country);
      }
    });
    this.americas = this.sortCountryName(tempAmericas);
    this.asiaPacifics = this.sortCountryName(tempAsiaPacifics);
    this.europes = this.sortCountryName(tempEuropes);
  }

  sortCountryName(countries: any[]) {
    return countries.sort((a: any, b: any) => (a.country > b.country ? 1 : -1));
  }

  getRedirectedCountry() {
    this.dataService.currentRedictedCountry$.subscribe((country) => {
      const localMVUser = sessionStorage.getItem('MVUser');
      const MVUser = localMVUser ? JSON.parse(localMVUser) : null;
      if (country !== '' && !MVUser) {
        this.isRedirectedCountry = true;

        this.redirectedCountryFlag = country;

        this.dataService.currentCountries$.subscribe((countries: any) => {
          if (countries) {
            const allCountries: any[] = countries;

            allCountries.forEach((country: any) => {
              if (country.country_code === this.redirectedCountryFlag) {
                this.redirectedCountryName = country.country;
              }
            });
          }
        });
      }
    });
  }

  onClickContinueLocation() {
    /*localStorage.setItem(
      'ConfirmedCountry',
      JSON.stringify(this.redirectedCountryFlag)
    );*/
    const localMVUser = sessionStorage.getItem('MVUser');
    const MVUser = localMVUser ? JSON.parse(localMVUser) : null;
    if(MVUser && this.tenant === 'pruvit') {
      sessionStorage.setItem('mvuser_selected_country', this.redirectedCountryFlag);
    }
    const paramsObj = this.route.snapshot.queryParams;

    if (this.selectedCountry !== this.redirectedCountryFlag) {
      let relativeUrl = this.router.url.split('?')[0];
      if(this.selectedCountry.toLowerCase() != 'us' && !relativeUrl.includes('cloud')) {
        const splitedUrl = relativeUrl.split(`/${this.selectedCountry.toLowerCase()}/`);
        relativeUrl = splitedUrl.length > 1 ? splitedUrl[1] : '';
      }
      relativeUrl = relativeUrl.replace(/^\/+/g, '');

      if(
        (relativeUrl === 'smartship' ||
        relativeUrl === 'research' ||
        relativeUrl === 'learn' ||
        relativeUrl === 'team' ||
        relativeUrl === 'about' ||
        relativeUrl === 'vip' ||
        relativeUrl === 'promoter') && isEuropeanCountry(this.redirectedCountryFlag)
      ) {
        this.utilityService.navigateToRoute('/', this.redirectedCountryFlag, paramsObj);
      } else {
        this.utilityService.navigateToRoute(`/${relativeUrl}`, this.redirectedCountryFlag, paramsObj);
      }
      this.dataService.changeSelectedCountry(this.redirectedCountryFlag);

      // this.utilityService.navigateToRoute('/', this.redirectedCountryFlag);
      // this.dataService.changeSelectedCountry(this.redirectedCountryFlag);
    }

    this.onClickCloseLocation();
  }

  onClickCloseLocation() {
    this.isRedirectedCountry = false;

    this.bannerHeightEvent.emit(true);
  }

  onChangeCountry(countryCode: string) {
    this.redirectedCountryFlag = countryCode;

    this.countries.forEach((country: any) => {
      if (country.country_code === this.redirectedCountryFlag) {
        this.redirectedCountryName = country.country;
      }
    });
  }
}
