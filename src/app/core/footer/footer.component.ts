import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { isEuropeanCountry } from 'src/app/shared/utils/country-list';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  private destroyedCheckoutHeight$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() isRussellBrunson: boolean = false;
  tenant!: string;
  selectedCountry = '';
  selectedLanguage = '';
  generalSettings: any = {};
  defaultLanguage = '';
  isEUCountryExceptGB = false;
  isEUCountry = false;
  isStaging: boolean;
  productSettings = {} as ProductSettings;
  productsData: any = {};
  ladybossFooter: string = '';
  showPruvitFooter: boolean = false;
  checkoutBtnHeight: number = 0;
  isLoaded: boolean = false;
  cloudUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private router: Router,
    private promoterService: PromoterService
  ) {
    this.isStaging = environment.isStaging;
    this.tenant = environment.tenant;
    this.cloudUrl = environment.clientDomain !== '' ? `${environment.clientDomain}/cloud` : '';
  }

  ngOnInit(): void {
    this.getSelectedCountry();
    this.getSelectedLanguage();
    this.checkRoutePaths();
  }

  checkRoutePaths() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((res) => {
        let routePath = res.url.includes('?') ? res.url.split('?')[0] : res.url;
        if (this.tenant === 'ladyboss') {
          if (routePath.startsWith('/dashboard')) {
            this.ladybossFooter = 'minimal';
          } else if(routePath.startsWith('/5daycakechallenge') || routePath.startsWith('/burnit') || routePath.startsWith('/30day-slimdown') || routePath.startsWith('/5servings') || routePath.startsWith('/quickie')) {
            this.ladybossFooter = '5daycakechallenge';
          } else if(routePath.startsWith('/makecake')) {
            this.ladybossFooter = 'makecake';
          } else if (
            routePath.startsWith('/invite') ||
            routePath.startsWith('/challenge') 
          ) {
            this.ladybossFooter = 'invite';
          } else if (routePath.startsWith('/replay')) {
            this.ladybossFooter = 'replay';
          } else {
            this.ladybossFooter = 'main';
          }
        } else {
          const selectedPath = routePath && routePath !== '' ? routePath : '';
          if (routePath !== '' && this.selectedCountry !== 'US') {
            routePath = routePath.split(this.selectedCountry.toLowerCase())[1];
          }
          if (routePath === '/me' && 0) {
            this.showPruvitFooter = false;
          } else {
            this.showPruvitFooter = true;
          }
          this.setPaddingToFooterOnCart(selectedPath);
        }
      });
  }

  setPaddingToFooterOnCart(routePath: string) {
    if(routePath.startsWith('/cart')) {
      this.dataService.currentCheckoutBtnHeight$
      .pipe(takeUntil(this.destroyedCheckoutHeight$))
      .subscribe(res=> this.checkoutBtnHeight = res)
    }else {
      this.destroyedCheckoutHeight$.next(true);
      this.destroyedCheckoutHeight$.complete();
      this.checkoutBtnHeight = 0;
    }
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe((country: string) => {
      this.selectedCountry = country;
      this.checkEUCountries();
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$.subscribe((language: string) => {
      this.selectedLanguage = language;
      this.translate.use(this.selectedLanguage);
      this.getPages();
    });
  }

  getPages() {
    this.dataService.currentProductsData$.subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }

      this.defaultLanguage = data.productsData.default_lang;
      this.productsData = data.productsData;
      this.productSettings = data.productSettings;

      this.getGeneralSettings(data.productsData);
      this.isLoaded = true;
    });
  }

  getGeneralSettings(productsData: any) {
    if (productsData) {
      this.generalSettings = productsData.general_settings;
    }
  }

  onClickLogo() {
    this.utilityService.navigateToRoute('/');
  }

  onClickPage(slug: string) {
    const routeURL = '/page/' + slug;
    this.utilityService.navigateToRoute(routeURL);
  }

  getCurrentYear() {
    return new Date().getFullYear();
  }

  onClickBlog() {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog']);
    } else {
      this.router.navigate([this.selectedCountry.toLowerCase() + '/' + 'blog']);
    }
  }

  onClickResearch() {
    const routeURL = '/research';

    this.utilityService.navigateToRoute(routeURL);
  }

  onClickPress() {
    const routeURL = '/press';

    this.utilityService.navigateToRoute(routeURL);
  }

  onClickPromoterFee() {
    this.promoterService.onPromoterAddToCart(
      this.selectedCountry,
      this.selectedLanguage,
      null,
      [],
      this.productSettings
    );

    $('.drawer').drawer('open');
  }

  onClickPromoter() {
    if (this.selectedCountry === 'GB') {
      this.onClickPromoterFee();
    } else {
      const routeURL = '/promoter';

      this.utilityService.navigateToRoute(routeURL);
    }
  }

  checkEUCountries() {
    this.isEUCountry = isEuropeanCountry(this.selectedCountry.toUpperCase());
    if (
      this.selectedCountry === 'AT' ||
      this.selectedCountry === 'BE' ||
      this.selectedCountry === 'FI' ||
      this.selectedCountry === 'FR' ||
      this.selectedCountry === 'DE' ||
      this.selectedCountry === 'HU' ||
      this.selectedCountry === 'IE' ||
      this.selectedCountry === 'IT' ||
      this.selectedCountry === 'NL' ||
      this.selectedCountry === 'PL' ||
      this.selectedCountry === 'PT' ||
      this.selectedCountry === 'ES' ||
      this.selectedCountry === 'SE' ||
      this.selectedCountry === 'CH' ||
      this.selectedCountry === 'RO' ||
      this.selectedCountry === 'BG' ||
      this.selectedCountry === 'HR' ||
      this.selectedCountry === 'CY' ||
      this.selectedCountry === 'CZ' ||
      this.selectedCountry === 'DK' ||
      this.selectedCountry === 'EE' ||
      this.selectedCountry === 'GR' ||
      this.selectedCountry === 'LV' ||
      this.selectedCountry === 'LT' ||
      this.selectedCountry === 'LU' ||
      this.selectedCountry === 'MT' ||
      this.selectedCountry === 'SK' ||
      this.selectedCountry === 'SI'
    ) {
      this.isEUCountryExceptGB = true;
    } else {
      this.isEUCountryExceptGB = false;
    }
  }
}
