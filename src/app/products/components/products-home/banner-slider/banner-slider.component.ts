import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { Product } from 'src/app/products/models/product.model';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppTagManagerService } from 'src/app/shared/services/app-tag-manager.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
declare var bannerSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-banner-slider',
  templateUrl: './banner-slider.component.html',
  styleUrls: ['./banner-slider.component.css'],
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant!: string;
  selectedLanguage = '';
  selectedCountry = '';
  isLoggedUserExist: boolean = false;
  featureProducts: Product[] = [];
  products: Product[] = [];
  referrer: any = {};
  defaultLanguage = '';
  isStaging: boolean;
  isSubDomain = false;

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private apiService: AppApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: AppUserService,
    private translate: TranslateService,
    private tagManager: AppTagManagerService,
    private store: Store<AppState>,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.isStaging = environment.isStaging;
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getUser();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.getCartList();
    //this.getBaseUrlStatus();
  }

  getCartList() {
    this.store.select('cartList')
    .pipe(
      takeUntil(this.destroyed$),
      skip(1)
    )
    .subscribe(res => {
      if(this.products.length) {
        this.getFeatureProducts(this.products);
      }
    });
  }

  getBaseUrlStatus() {
    this.dataService.currentIsSubdomain$.pipe(takeUntil(this.destroyed$)).subscribe((status: boolean) => {
      this.isSubDomain = status;
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$.pipe(takeUntil(this.destroyed$)).subscribe(
      (language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getProducts();
      }
    );
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.pipe(takeUntil(this.destroyed$)).subscribe((country: string) => {
      this.selectedCountry = country;
    });
  }

  getReferrer() {
    this.dataService.currentReferrerData$.pipe(takeUntil(this.destroyed$)).subscribe((referrer: any) => {
      if (referrer) {
        this.referrer = referrer;
      }
    });
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isLoggedUserExist = true;
      }
    });
  }

  getProducts() {
    this.dataService.currentProductsData$.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
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
      this.products = products;
      this.getFeatureProducts(products);
    });
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

    this.featureProducts = tempFeatureProducts.filter(p => {
      return this.userService.checkUserAccess(
        p.accessLevels,
        p.customUsers
      );
    });
    this.loadBannerSlider(this.featureProducts.length);
  }

  loadBannerSlider(productsLength: number) {
    const bannerSlick = $(
      '.sk-main__banner-slider.slick-initialized'
    );
    if(bannerSlick.length) {
      $('.sk-main__banner-slider').slick('unslick');
    }
    if(productsLength > 1) {
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

  onClickBuyNow(product: Product) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);

    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: product.name },
    });
    if(this.tenant === 'pruvit') {
      this.tagManager.selectItemEvent(product, this.selectedCountry);
    }
  }

  onClickCutomCtaBtn(customLink: string) {
    let isValidUrl = this.isValidUrl(customLink);
    if (!isValidUrl) {
      this.router.navigate([`${customLink}`]);
    } else {
      window.location.href = customLink;
    }
  }

  isValidUrl(url: string) {
    try {
      return Boolean(new URL(url));
    } catch (e) {
      return false;
    }
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

  onClickProductImage(product: Product) {
    if (product) {
      if(this.tenant === 'pruvit') {
        this.tagManager.viewItemEvent(product, this.selectedCountry, 'Product Banner');
      }
      const routeURL = '/product/' + product.name;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onClickReferrerName() {
    this.dataService.changePostName({
      postName: 'referrer-modal',
      payload: { key: 'modals', value: [{ modalName: 'independentPruver' }] },
    });
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
      this.selectedCountry === 'GB' ||
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
    
    const viParams = this.getVIParams();
    const langParam = this.activatedRoute.snapshot.queryParamMap.get('lang');
    const routerUrl = this.router.url.includes('?') ? this.router.url.split('?')[0] : this.router.url;
    const redirectUrl = langParam ? environment.clientDomain + `${routerUrl}?lang=${langParam}` + (viParams ? '&' + viParams : '') : environment.clientDomain + routerUrl + (viParams ? '?' + viParams : '');
    
    const newAccountLink = `${environment.newgenUrl}#/register/${this.referrer.code}?country=${this.selectedCountry}&language=${langCode}&no_order=true&redirect_url=${encodeURIComponent(redirectUrl)}`;

    window.location.href = newAccountLink;
  }

  getVIParams() {
    const VIUser = this.userService.validateVIUserSession();
    if (VIUser !== null) {
      if (
        VIUser.hasOwnProperty('viProductId') &&
        VIUser.viProductId !== ''
      ) {
        // var localDateUtc = moment.utc(VIUser.expiryTime);
        // var localDate = moment(localDateUtc).utcOffset(10 * 60);
        // const offerExpiryTimeString = localDate.format();
        const viParams = 'userId='+this.referrer.userId+'&firstName='+VIUser.firstName+'&lastName='+VIUser.lastName+'&email='+VIUser.email+'&offererCode='+VIUser.referrer+'&viProductId='+VIUser.viProductId +'&viCode='+VIUser.viCode+'&offerExpiryTime='+VIUser.expiryTime;
        return viParams;
      }
    }
    return '';
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
