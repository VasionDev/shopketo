import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { Product } from 'src/app/products/models/product.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
declare var bannerSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-banner-slider',
  templateUrl: './banner-slider.component.html',
  styleUrls: ['./banner-slider.component.css'],
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  isLoggedUserExist: boolean = false;
  featureProducts: Product[] = [];
  referrer: any = {};
  defaultLanguage = '';
  subscriptions: SubscriptionLike[] = [];
  isStaging: boolean;
  isSubDomain = false;
  hasCustomizeData = false;

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private websiteService: WebsiteService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getUser();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.getBaseUrlStatus();
    this.getUserCustomizeData();
  }

  getBaseUrlStatus() {
    this.subscriptions.push(
      this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
        this.isSubDomain = status;
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);

          this.getProducts();
        }
      )
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
      })
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

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isLoggedUserExist = true;
      }
    });
  }

  getProducts() {
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

        const products = data.products.filter(
          (p) =>
            !p.accessLevels.isCustom.on &&
            (p.categories.length > 0 || p.tags.length > 0) &&
            (!p.accessLevels.isLoggedUser.on ||
              (p.accessLevels.isLoggedUser.on && this.isLoggedUserExist))
        );
        this.getFeatureProducts(products);
      })
    );
  }

  getTranslatedText() {
    let translatedText = '';
    switch (this.selectedLanguage) {
      case 'en':
        translatedText = 'How it works';
        break;
      case 'de':
        translatedText = 'Wie es funktioniert';
        break;
      case 'es':
        translatedText = 'Cómo funciona';
        break;
      case 'it':
        translatedText = 'Come funziona';
        break;
      case 'zh-hans':
        translatedText = '运作机制';
        break;
      case 'zh-hant':
        translatedText = '運作機制';
        break;
      default:
        translatedText = 'How it works';
        break;
    }
    return translatedText;
  }

  getFeatureProducts(products: Product[]) {
    const tempFeatureProducts: Product[] = [];

    if (products) {
      products.forEach((product) => {
        const prevDate = new Date(product.bannerStartUnixTime * 1000);
        const nextDate = new Date(product.bannerEndUnixTime * 1000);

        const today = new Date();

        if (today > prevDate && today < nextDate) {
          tempFeatureProducts.push(product);
        }
      });
    }

    this.featureProducts = tempFeatureProducts;
    this.loadBannerSlider(this.featureProducts.length);
  }

  loadBannerSlider(productsLength: number) {
    if (productsLength === 1) {
      bannerSliderJS(false);
    }
    if (productsLength > 1) {
      const bannerSlick = $(
        '.sk-main__banner-slider.slick-initialized.slick-slider.slick-dotted'
      );

      if (bannerSlick.length > 0) {
        $('.sk-main__banner-slider').slick('unslick');
      }
      setTimeout(() => {
        bannerSliderJS(true);
      });
    }
  }

  getWistiaVideoID(videoLink: string) {
    let videoID = '';
    if (videoLink) {
      if (videoLink.includes('home.wistia.com')) {
        videoID = videoLink.substring(videoLink.lastIndexOf('/') + 1);
      } else {
        videoID = videoLink;
      }
    }
    return videoID;
  }

  isPruvitTVPresent(videoLink: string) {
    if (videoLink) {
      if (videoLink.includes('pruvit.tv')) {
        return true;
      }
    }
    return false;
  }

  onClickPruvitTvVideo(videoLink: string) {
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);

    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: postName },
    });
  }

  getBackgroundColor(bgImage?: string, rgb1?: string, rgb2?: string) {
    if (bgImage !== '') {
      return 'url(' + bgImage + ')';
    } else if (rgb1 !== '' && rgb2 !== '') {
      return `linear-gradient(45deg, ${rgb1}, ${rgb2})`;
    } else {
      return '';
    }
  }

  onClickProductImage(postName: string) {
    if (postName) {
      const routeURL = '/product/' + postName;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onClickReferrerName() {
    if (this.hasCustomizeData) {
      const path = this.isStaging ? '/me?ref=' + this.referrer.code : '/me';
      this.router.navigateByUrl(path);
    } else {
      this.dataService.changePostName({
        postName: 'referrer-modal',
        payload: { key: 'modals', value: [{ modalName: 'independentPruver' }] },
      });
    }
  }

  getUserCustomizeData() {
    if (this.referrer?.userId && this.selectedCountry === 'US') {
      this.subscriptions.push(
        this.websiteService
          .getCustomizeData(this.referrer?.userId, false)
          .subscribe((res) => {
            if (typeof res.success && res.success === true) {
              this.hasCustomizeData =
                res.data.status === 'approved' ? true : false;
            }
          })
      );
    }
  }

  isEuropeCountryShown() {
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
      this.selectedCountry === 'GB'
    ) {
      return true;
    } else {
      return false;
    }
  }

  onClickCreateAccount() {
    let langCode = '';

    if (this.selectedLanguage === 'es') langCode = 'es-mx';
    else if (this.selectedLanguage === 'pt-pt') langCode = 'pt';
    else langCode = this.selectedLanguage;

    const newAccountLink = `http://cloud.justpruvit.com/#/register/${this.referrer.code}?country=${this.selectedCountry}&language=${langCode}`;

    window.location.href = newAccountLink;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
