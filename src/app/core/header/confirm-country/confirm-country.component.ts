import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';

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

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService
  ) {}

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
        country.country_code === 'TW'
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
        country.country_code === 'GB'
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
      if (country !== '') {
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
    localStorage.setItem(
      'ConfirmedCountry',
      JSON.stringify(this.redirectedCountryFlag)
    );

    if (this.selectedCountry !== this.redirectedCountryFlag) {
      this.utilityService.navigateToRoute('/', this.redirectedCountryFlag);

      this.dataService.changeSelectedCountry(this.redirectedCountryFlag);
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
