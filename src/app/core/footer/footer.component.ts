import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  selectedCountry = '';
  selectedLanguage = '';
  generalSettings: any = {};
  defaultLanguage = '';
  isEUCountryExceptGB = false;
  isStaging: boolean;
  productSettings = {} as ProductSettings;
  productsData: any = {};

  constructor(
    private route: ActivatedRoute,
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private router: Router,
    private promoterService: PromoterService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getSelectedCountry();
    this.getSelectedLanguage();
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
      this.selectedCountry === 'RO'
    ) {
      this.isEUCountryExceptGB = true;
    } else {
      this.isEUCountryExceptGB = false;
    }
  }
}
