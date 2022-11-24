import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-country-bar',
  templateUrl: './country-bar.component.html',
  styleUrls: ['./country-bar.component.css'],
})
export class CountryBarComponent implements OnInit, AfterViewInit, OnDestroy {
  languages: any[] = [];
  americas: any[] = [];
  asiaPacifics: any[] = [];
  europes: any[] = [];
  selectedCountry = '';
  selectedLanguage = '';
  currentURL = '';
  defaultLanguage = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    $(document).on('shown.bs.collapse', '#accordionExample', () => {
      setTimeout(() => {
        $('.drawer').drawer('softRefresh');
      }, 0);
    });
    $(document).on('hidden.bs.collapse', '#accordionExample', () => {
      setTimeout(() => {
        $('.drawer').drawer('softRefresh');
      }, 0);
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getCountries();
    this.getSelectedCountry();
    this.getRedirectURL();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  getRedirectURL() {
    this.subscriptions.push(
      this.dataService.currentRedirectURL$.subscribe((url: string) => {
        this.currentURL = url;
        this.getLanguages();
      })
    );
  }

  getCountries() {
    this.subscriptions.push(
      this.dataService.currentCountries$.subscribe((countries: any) => {
        const allCountries: any[] = countries.filter(
          (country: any) => country.active === '1'
        );
        this.getGroupWiseCountries(allCountries);
      })
    );
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

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);
        }
      )
    );
  }

  getFilteredUrl() {
    let filteredUrl: string = '';
    let filteredSlug: string = '';

    if (this.currentURL === '/' || this.currentURL === '') {
      filteredUrl = '';
    } else {
      const splitedLink: string = this.currentURL.split('/')[1];
      const splitedSlug: string = this.currentURL.split('/')[2];

      if (
        splitedLink !== 'page' &&
        splitedLink !== 'product' &&
        splitedLink !== 'category' &&
        splitedLink !== 'tag' &&
        splitedLink !== 'search' &&
        splitedLink !== 'smartship' &&
        splitedLink !== 'research'
      ) {
        filteredUrl = '';
        filteredSlug = '';
      } else {
        filteredUrl = splitedLink;
        filteredSlug = splitedSlug;
      }
    }
    return { url: filteredUrl, slug: filteredSlug };
  }

  getObjForLanguage(lang: string) {
    if (lang === 'en') {
      return {
        found: true,
        langObj: {
          value: 'en',
          name: 'English',
          flag: 'uk.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'es') {
      return {
        found: true,
        langObj: {
          value: 'es',
          name: 'Español',
          flag: 'mexico.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'zh-hans') {
      return {
        found: true,
        langObj: {
          value: 'zh-hans',
          name: '简体中文',
          flag: 'china.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'zh-hant') {
      return {
        found: true,
        langObj: {
          value: 'zh-hant',
          name: '繁體中文',
          flag: 'china.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'de') {
      return {
        found: true,
        langObj: {
          value: 'de',
          name: 'Deutsch',
          flag: 'DE.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'it') {
      return {
        found: true,
        langObj: {
          value: 'it',
          name: 'Italiano',
          flag: 'italian.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'pt-pt') {
      return {
        found: true,
        langObj: {
          value: 'pt-pt',
          name: 'Português',
          flag: 'PT.svg',
          elementID: 0,
        },
      };
    } else if (lang === 'es-es') {
      return {
        found: true,
        langObj: {
          value: 'es-es',
          name: 'Spanish',
          flag: 'ES.svg',
          elementID: 0,
        },
      };
    } else {
      return {
        found: false,
        langObj: {
          value: 'en',
          name: 'English',
          flag: 'uk.svg',
          elementID: 0,
        },
      };
    }
  }

  getPageLanguages(productsData: any, page: { url: string; slug: string }) {
    const tempLanguages: any[] = [];
    if (page.url === 'product') {
      productsData.list.forEach((product: any) => {
        if (product.post_name === page.slug) {
          Object.entries(product.translated_data).forEach(
            ([language, value]: [string, any]) => {
              if (this.getObjForLanguage(language).found) {
                const langObject = this.getObjForLanguage(language).langObj;

                langObject.elementID = +value.element_id;

                tempLanguages.push(langObject);
              }
            }
          );
        }
      });
    } else {
      let searchList = [];
      if (page.url === 'category') {
        searchList = Object.values(productsData.parent_category);
      }
      if (page.url === 'tag') {
        searchList = productsData.product_tag;
      }
      if (page.url === 'page') {
        searchList = productsData.page;
      }
      if (searchList.length > 0) {
        searchList.forEach((product: any) => {
          if (product.slug === page.slug) {
            Object.entries(product.translated_data).forEach(
              ([language, value]: [string, any]) => {
                if (this.getObjForLanguage(language).found) {
                  const langObject = this.getObjForLanguage(language).langObj;

                  langObject.elementID = +value.element_id;

                  tempLanguages.push(langObject);
                }
              }
            );
          } else {
            if (product.hasOwnProperty('child_categories')) {
              product.child_categories.forEach((child: any) => {
                if (child.slug === page.slug) {
                  Object.entries(child.translated_data).forEach(
                    ([cLanguage, cValue]: [string, any]) => {
                      if (this.getObjForLanguage(cLanguage).found) {
                        const langObject =
                          this.getObjForLanguage(cLanguage).langObj;

                        langObject.elementID = +cValue.element_id;

                        tempLanguages.push(langObject);
                      }
                    }
                  );
                }
              });
            }
          }
        });
      }
    }
    return tempLanguages;
  }

  getLanguages() {
    const page = this.getFilteredUrl();

    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }

        this.defaultLanguage = data.productsData.default_lang;

        this.languages = [];
        if (
          page.url === '' ||
          page.url === 'search' ||
          page.url === 'smartship' ||
          page.url === 'research'
        ) {
          this.subscriptions.push(
            this.dataService.currentLanguagesData$.subscribe(
              (languagesData: any) => {
                if (languagesData) {
                  const tempLanguages: any[] = [];
                  Object.keys(languagesData).forEach((language: string) => {
                    if (this.getObjForLanguage(language).found) {
                      tempLanguages.push(
                        this.getObjForLanguage(language).langObj
                      );
                    }
                  });
                  this.languages = tempLanguages;
                }
              }
            )
          );
        } else {
          this.languages = this.getPageLanguages(data.productsData, page);
        }
        this.changeDetectionRef.detectChanges();
      })
    );
  }

  getFilteredLanguages(countryCode: string, languages: any[]) {
    if (countryCode === 'AU' || countryCode === 'NZ' || countryCode === 'CA') {
      return languages.filter((language: any) => language.value === 'en');
    } else if (countryCode === 'US') {
      return languages.filter(
        (language: any) =>
          language.value === 'en' ||
          language.value === 'es' ||
          language.value === 'zh-hans' ||
          language.value === 'zh-hant'
      );
    } else {
      return languages;
    }
  }

  onClickCountry(countryCode: string) {
    if (this.selectedCountry !== countryCode) {
      this.languages = [];

      this.dataService.setPageSlug({});

      this.utilityService.navigateToRoute('/', countryCode);

      this.selectedCountry = countryCode;
      this.dataService.changeSelectedCountry(this.selectedCountry);

      $('.drawer').drawer('close');
      $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    }
  }

  getLanguageName(countryCode: string) {
    let languageName = '';
    if (this.selectedLanguage === 'en') {
      languageName = 'English';
    }
    if (this.selectedLanguage === 'es') {
      languageName = 'Español';
    }
    if (this.selectedLanguage === 'zh-hans') {
      languageName = '简体中文';
    }
    if (this.selectedLanguage === 'zh-hant') {
      languageName = '繁體中文';
    }
    if (this.selectedLanguage === 'it') {
      languageName = 'Italiano';
    }
    if (this.selectedLanguage === 'de') {
      languageName = 'Deutsch';
    }
    if (this.selectedLanguage === 'pt-pt') {
      languageName = 'Português';
    }
    if (this.selectedLanguage === 'es-es') {
      languageName = 'Spanish';
    }

    if (countryCode === this.selectedCountry) {
      return languageName;
    } else {
      return '';
    }
  }

  changeLanguage(language: string, elementID: number) {
    if (this.selectedLanguage !== language) {
      const page = this.getFilteredUrl();

      let redirectUrl = '';
      if (page.url === '') {
        redirectUrl = '/';
      } else if (page.url === 'search') {
        redirectUrl = '/search';
      } else if (page.url === 'smartship') {
        redirectUrl = '/smartship';
      } else if (page.url === 'research') {
        redirectUrl = '/research';
      } else {
        const pageSlug = { url: page.url, elementId: elementID };
        this.dataService.setPageSlug(pageSlug);
      }

      if (
        page.url === '' ||
        page.url === 'search' ||
        page.url === 'smartship' ||
        page.url === 'research'
      ) {
        this.dataService.setPageSlug({});

        this.selectedLanguage = language;
        this.dataService.changeSelectedLanguage(this.selectedLanguage);

        this.utilityService.navigateToRoute(redirectUrl);

        this.dataService.changeSelectedCountry(this.selectedCountry);
      } else {
        this.selectedLanguage = language;
        this.dataService.changeSelectedLanguage(this.selectedLanguage);

        this.dataService.changeSelectedCountry(this.selectedCountry);
      }
    }
    $('.drawer').drawer('close');
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  getCountryName(country: any) {
    return this.utilityService.getNativeCountryName(
      country,
      this.selectedLanguage
    );
  }

  onClickCloseCountry() {
    $('.drawer').drawer('close');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
