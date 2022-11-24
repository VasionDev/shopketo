import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  PlatformRef,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CookieService } from 'ngx-cookie-service';
import { FacebookService, InitParams } from 'ngx-facebook';
import { initializePhraseAppEditor } from 'ngx-translate-phraseapp';
import { Subscription, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { BlogApiService } from './blogs/services/blog-api.service';
import { ModalAccessLevelComponent } from './products/modals/modal-access-level/modal-access-level.component';
import { ModalProductsComponent } from './products/modals/modal-products/modal-products.component';
import { ProductTagOrCategory } from './products/models/product-tag-or-category.model';
import { ProductsApiService } from './products/services/products-api.service';
import {
  PhraseConfig,
  PHRASE_CONFIG_TOKEN,
} from './shared/config/phrase-config';
import { ModalCheckoutComponent } from './shared/modals/modal-checkout/modal-checkout.component';
import { ModalCookieComponent } from './shared/modals/modal-cookie/modal-cookie.component';
import { ModalImpersonationComponent } from './shared/modals/modal-impersonation/modal-impersonation.component';
import { ModalPurchaseWarningComponent } from './shared/modals/modal-purchase-warning/modal-purchase-warning.component';
import { ModalRestrictCheckoutComponent } from './shared/modals/modal-restrict-checkout/modal-restrict-checkout.component';
import { ModalRestrictShareCartComponent } from './shared/modals/modal-restrict-share-cart/modal-restrict-share-cart.component';
import { ModalUtilitiesComponent } from './shared/modals/modal-utilities/modal-utilities.component';
import { ModalViComponent } from './shared/modals/modal-vi/modal-vi.component';
import { Cart } from './shared/models/cart.model';
import { AppApiService } from './shared/services/app-api.service';
import { AppDataService } from './shared/services/app-data.service';
import { AppSeoService } from './shared/services/app-seo.service';
import { AppUserService } from './shared/services/app-user.service';
import { AppUtilityService } from './shared/services/app-utility.service';
import { isEuropeanCountry } from './shared/utils/country-list';
import { setEveryMonth, setOneTime } from './sidebar/store/cart.actions';
import { AppState } from './store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('modalcontainer', { read: ViewContainerRef })
  modalcontainer!: ViewContainerRef;
  sidebarName = '';
  selectedLanguage = '';
  selectedCountry = '';
  isLoaded = false;
  langCode = '';
  fbPageID = '';
  production: boolean;
  isStaging: boolean;
  clientDomain = '';
  defaultLanguage = '';
  refCode = '';
  translationsList: any[] = [];
  referrerVideoId = '';
  isCodePresent = false;
  isCookiePresent = false;
  isRootRoute = false;
  isBrowser: boolean;
  isAuthenticated: boolean = false;
  isEuropeanCountry = false;
  showCookieDialog = false;
  cookieTimerSubscription!: Subscription;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private blogApiService: BlogApiService,
    private apiService: AppApiService,
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    public utilityService: AppUtilityService,
    private fb: FacebookService,
    private renderer: Renderer2,
    private translate: TranslateService,
    private productsApiService: ProductsApiService,
    private seoService: AppSeoService,
    private store: Store<AppState>,
    private newgenApiService: NewgenApiService,
    private userEmitterService: UserEmitterService,
    private cookieService: CookieService,
    private userService: AppUserService,
    private location: Location,
    @Inject(PHRASE_CONFIG_TOKEN) private phraseConfig: PhraseConfig,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: PlatformRef
  ) {
    if (window.localStorage.getItem('redirect')) {
      if (
        window.localStorage.getItem('redirect')!.indexOf('order-success') >
          -1 &&
        window.localStorage.getItem('redirect')!.indexOf('?code=') > -1
      ) {
        window.localStorage.setItem('isOrderSuccess', 'true');
      }
    }
    this.setImpersonation();
    this.oidcSecurityService.checkAuth().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.newgenApiService.getPersonal().subscribe((x) => {
          let user = x.collection[0];
          this.userEmitterService.setProfileObs(user);
          this.isAuthenticated = isAuthenticated;
          if (window.localStorage.getItem('isOrderSuccess') == 'true') {
            this.router.navigate(['/dashboard/order-success']);
          }
        });
      }
    });

    this.oidcSecurityService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const accessToken = this.oidcSecurityService.getToken();
        const userRole = JSON.parse(atob(accessToken.split('.')[1]))?.role;
        if (userRole) {
          const isAdmin = this.userService.isAdminUser(userRole);
          this.dataService.setAdminStatus(isAdmin);
        }
        this.getUserWithScopes();
        // this.renderer.addClass(document.body, 'mobile-dashboard-navigation');
      } else {
        // this.renderer.removeClass(document.body, 'mobile-dashboard-navigation');
      }
    });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((res) => {
        const routePath = res.url.includes('?')
          ? res.url.split('?')[0]
          : res.url;

        const isProductDetailPage =
          routePath.startsWith('/product') ||
          routePath.startsWith(
            `/${this.selectedCountry.toLowerCase()}/product`
          );

        const blogDetailPattern =
          '^/blog/(?!author|category)([a-z0-9]+)|^/ca/blog/(?!author|category)([a-z0-9]+)';
        const blogDetailRegEx = new RegExp(blogDetailPattern);

        const isBlogDetailPage = blogDetailRegEx.test(routePath);

        if (
          isProductDetailPage ||
          isBlogDetailPage ||
          routePath.startsWith('/ingredients') ||
          routePath.startsWith(
            `/${this.selectedCountry.toLowerCase()}/ingredients`
          ) ||
          routePath.startsWith('/promoter') ||
          routePath.startsWith(
            `/${this.selectedCountry.toLowerCase()}/promoter`
          )
        ) {
          this.renderer.removeClass(document.body, 'body-gray');
        } else {
          this.renderer.addClass(document.body, 'body-gray');
        }

        this.isRootRoute =
          routePath === '' ||
          routePath === '/' + this.selectedCountry.toLowerCase();
      });

    this.production = environment.production;
    this.isStaging = environment.isStaging;
    this.clientDomain = environment.clientDomain;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.setSeo();
    if (this.isBrowser) {
      this.setLangCode();
      this.setCountryCode();
      this.setReferrerCode();
      this.setPhraseEditor();
    }

    $(document).ready(() => {
      $('.drawer').drawer({
        iscroll: {
          mouseWheel: true,
          scrollbars: true,
          bounce: false,
        },
      });
    });
  }

  ngOnInit() {
    this.setStaticTranslation();
    this.setTheme();
    this.setSidebarCountries();
    this.setUser();
    // this.setImpersonation();
    this.getSidebarName();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.createProductModals();
    this.setViOffer();
    this.getParams();
    this.clearCart();
    this.setTranslationsList();
    this.getCookieDialogStatus();
  }

  setImpersonation() {
    const LocalImpersonation = localStorage.getItem('ImpersonationUser');
    let impersonationData = LocalImpersonation
      ? JSON.parse(LocalImpersonation)
      : null;
    if (impersonationData !== null) {
      sessionStorage.setItem(
        'ImpersonationUser',
        JSON.stringify(impersonationData)
      );
      this.dataService.setImpersonationStatus(true);
      localStorage.removeItem('ImpersonationUser');
      sessionStorage.removeItem('MVUser');
    } else {
      const sessionImpersonation = sessionStorage.getItem('ImpersonationUser');
      let impersonationData = sessionImpersonation
        ? JSON.parse(sessionImpersonation)
        : null;
      if (impersonationData !== null) {
        const currentTime = Math.floor(new Date().getTime() / 1000);
        if (currentTime >= impersonationData.expiryTime) {
          sessionStorage.removeItem('ImpersonationUser');
          this.dataService.setImpersonationStatus(false);
        } else {
          this.dataService.setImpersonationStatus(true);
        }
      }
    }
  }

  /* Set default language, country, referrer and translation */
  setStaticTranslation() {
    this.apiService
      .getStaticTranslation('en')
      .subscribe((translations: any) => {
        this.translate.setTranslation('en', translations);
      });
  }
  setLangCode() {
    const langCode: any = this.utilityService.getUrlParameter('lang');
    this.langCode = !langCode ? '' : langCode;
  }

  setCountryCode() {
    const routeUrl = this.document.location.pathname.split('/')[1];
    let country = '';

    let isRootForUS = true;

    if (routeUrl.toLowerCase() === 'ca') {
      country = 'CA';
    } else if (routeUrl.toLowerCase() === 'au') {
      country = 'AU';
    } else if (routeUrl.toLowerCase() === 'mo') {
      country = 'MO';
    } else if (routeUrl.toLowerCase() === 'hk') {
      country = 'HK';
    } else if (routeUrl.toLowerCase() === 'sg') {
      country = 'SG';
    } else if (routeUrl.toLowerCase() === 'my') {
      country = 'MY';
    } else if (routeUrl.toLowerCase() === 'mx') {
      country = 'MX';
    } else if (routeUrl.toLowerCase() === 'nz') {
      country = 'NZ';
    } else if (routeUrl.toLowerCase() === 'de') {
      country = 'DE';
    } else if (routeUrl.toLowerCase() === 'gb') {
      country = 'GB';
    } else if (routeUrl.toLowerCase() === 'it') {
      country = 'IT';
    } else if (routeUrl.toLowerCase() === 'es') {
      country = 'ES';
    } else if (routeUrl.toLowerCase() === 'nl') {
      country = 'NL';
    } else if (routeUrl.toLowerCase() === 'at') {
      country = 'AT';
    } else if (routeUrl.toLowerCase() === 'pl') {
      country = 'PL';
    } else if (routeUrl.toLowerCase() === 'ie') {
      country = 'IE';
    } else if (routeUrl.toLowerCase() === 'se') {
      country = 'SE';
    } else if (routeUrl.toLowerCase() === 'hu') {
      country = 'HU';
    } else if (routeUrl.toLowerCase() === 'fr') {
      country = 'FR';
    } else if (routeUrl.toLowerCase() === 'pt') {
      country = 'PT';
    } else if (routeUrl.toLowerCase() === 'fi') {
      country = 'FI';
    } else if (routeUrl.toLowerCase() === 'be') {
      country = 'BE';
    } else if (routeUrl.toLowerCase() === 'ro') {
      country = 'RO';
    } else {
      country = 'US';

      if (routeUrl.toLowerCase() === 'us' || routeUrl.toLowerCase() === '') {
        isRootForUS = true;
      } else {
        isRootForUS = false;
      }
    }
    if (country === 'US') {
      if (isRootForUS) {
        const paramsStr = this.document.location.search;
        const urlParams = new URLSearchParams(paramsStr);

        const code = urlParams.get('code');
        const existingUser = urlParams.get('existing_user');

        if (code === null && existingUser === null) {
          this.setRedictedCountry();
        }
      } else {
        this.dataService.changeSelectedCountry('US');
      }
    } else {
      this.dataService.changeSelectedCountry(country);
    }
  }

  setRedictedCountry() {
    const LocalConfirmedCountry = localStorage.getItem('ConfirmedCountry');
    let hasRedirectedCountry = LocalConfirmedCountry
      ? JSON.parse(LocalConfirmedCountry)
      : null;

    if (hasRedirectedCountry !== null && hasRedirectedCountry !== '') {
      const translateMode: any =
        this.utilityService.getUrlParameter('phrase_context');

      if (translateMode !== false) {
        hasRedirectedCountry = 'US';
      } else {
        this.utilityService.navigateToRoute('/', hasRedirectedCountry);
      }

      this.dataService.changeSelectedCountry(hasRedirectedCountry);
    } else {
      this.apiService.getGeoCountryCode().subscribe(
        (res: any) => {
          if (res) {
            if (
              res.country_code.toLowerCase() === 'ca' ||
              res.country_code.toLowerCase() === 'au' ||
              res.country_code.toLowerCase() === 'mo' ||
              res.country_code.toLowerCase() === 'hk' ||
              res.country_code.toLowerCase() === 'sg' ||
              res.country_code.toLowerCase() === 'my' ||
              res.country_code.toLowerCase() === 'mx' ||
              res.country_code.toLowerCase() === 'nz' ||
              res.country_code.toLowerCase() === 'de' ||
              res.country_code.toLowerCase() === 'gb' ||
              res.country_code.toLowerCase() === 'it' ||
              res.country_code.toLowerCase() === 'es' ||
              res.country_code.toLowerCase() === 'nl' ||
              res.country_code.toLowerCase() === 'at' ||
              res.country_code.toLowerCase() === 'pl' ||
              res.country_code.toLowerCase() === 'ie' ||
              res.country_code.toLowerCase() === 'se' ||
              res.country_code.toLowerCase() === 'hu' ||
              res.country_code.toLowerCase() === 'fr' ||
              res.country_code.toLowerCase() === 'pt' ||
              res.country_code.toLowerCase() === 'fi' ||
              res.country_code.toLowerCase() === 'ro' ||
              res.country_code.toLowerCase() === 'be'
            ) {
              this.utilityService.navigateToRoute('/', res.country_code);

              this.dataService.changeRedirectedCountry(res.country_code);

              this.dataService.changeSelectedCountry(res.country_code);
            } else {
              this.dataService.changeSelectedCountry('US');
            }
          } else {
            this.dataService.changeSelectedCountry('US');
          }
        },
        () => {
          this.dataService.changeSelectedCountry('US');
        }
      );
    }
  }

  setReferrerCode() {
    let sceletonDomain: string = '';
    let domain: string = this.document.location.href;

    if (domain.includes('https')) {
      sceletonDomain = domain.replace('https://', ' ');
    } else if (domain.includes('http')) {
      sceletonDomain = domain.replace('http://', ' ');
    } else {
      sceletonDomain = domain;
    }
    if (sceletonDomain.includes('www')) {
      sceletonDomain = sceletonDomain.replace('www.', ' ');
    }
    sceletonDomain = sceletonDomain.trim();

    let splitedStr: any[];
    let finalSplittedStr: any[];
    if (sceletonDomain.includes('/')) {
      splitedStr = sceletonDomain.split('/');
      finalSplittedStr = splitedStr[0].split('.');
    } else {
      finalSplittedStr = sceletonDomain.split('.');
    }
    if (finalSplittedStr.length === 3) {
      if (!this.isStaging) {
        this.setReferrer(finalSplittedStr[0]);
      }

      this.dataService.setIsSubdomainStatus(true);
    } else {
      this.seoService.updateRobots('index,follow');

      this.dataService.setIsSubdomainStatus(false);
    }
  }

  /* set sidebar countries */
  setSidebarCountries() {
    this.apiService.getCountries().subscribe((countries: any) => {
      if (countries) {
        this.dataService.setCountries(countries);
      }
    });
  }

  /* get current selected country and language */
  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$.subscribe((language: string) => {
      if (this.selectedLanguage !== '' && this.selectedLanguage !== language) {
        this.langCode = language;
      }
      this.selectedLanguage = language;
      this.translate.use(this.selectedLanguage);
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe((country: string) => {
      if (this.selectedCountry !== '' && this.selectedCountry !== country) {
        this.langCode = '';
      }
      this.selectedCountry = country;
      this.getProducts(country, this.langCode);
      this.setLanguagesForCountry(country);

      if (country === 'US' || country === 'CA') {
        this.setBlogs(country);
      } else {
        this.dataService.setBlogsData([]);
      }
    });
  }

  /* set blogs for search */
  setBlogs(country: string) {
    this.blogApiService.getBlogs(country).subscribe((blogs) => {
      if (blogs) {
        this.dataService.setBlogsData(blogs);
      }
    });
  }

  /* get products and languages for current selected country */
  getProducts(country: string, language: string) {
    this.isLoaded = false;

    if (country !== '') {
      this.productsApiService
        .getProductsWithLanguage(country, language)
        .subscribe((data) => {
          this.isCookiePresent = false;

          if (!this.isCodePresent) {
            this.isLoaded = true;
          }

          this.isEuropeanCountry = isEuropeanCountry(country);

          const currentLanguage = this.setLanguage(data.productsData);
          this.setCart(country, currentLanguage);
          this.dataService.setProductsData(data);
          this.dataService.setCategories(data.categories);
          this.dataService.setTags(data.tags);

          this.navigateToPage(data.productsData);
          this.getCookieStatus();
        });
    }
  }

  setLanguagesForCountry(country: string) {
    this.apiService
      .getLanguagesForCountry(country)
      .subscribe((languageData: any) => {
        if (languageData) {
          this.dataService.setLanguagesData(languageData);
        }
      });
  }

  /* set cart from the local storage */
  private setCart(country: string, language: string) {
    const oneTimeCart: Cart[] = this.utilityService.getOneTimeStorage(
      country.toLowerCase(),
      language
    );

    const everyMonthCart: Cart[] = this.utilityService.getEveryMonthStorage(
      country.toLowerCase(),
      language
    );

    this.store.dispatch(setOneTime({ oneTimeCart }));
    this.store.dispatch(setEveryMonth({ everyMonthCart }));

    if (oneTimeCart.length !== 0 || everyMonthCart.length !== 0) {
      this.dataService.changeCartStatus(true);
    } else {
      this.dataService.changeCartStatus(false);
    }
  }

  clearCart() {
    const LocalCartTime = localStorage.getItem('CartTime');
    const cartTime = LocalCartTime ? JSON.parse(LocalCartTime) : null;

    if (cartTime !== null) {
      const currentTime = new Date().getTime();

      const timeDifference = (currentTime - cartTime) / 1000;

      if (timeDifference >= 12 * 60 * 60) {
        localStorage.setItem('OneTime', JSON.stringify([]));
        localStorage.setItem('EveryMonth', JSON.stringify([]));
      }
    }
  }

  private getUserCheckoutCountries(MVUser: any) {
    this.apiService
      .getCheckoutCountries(MVUser?.mvuser_country)
      .subscribe((res) => {
        if (res.isSuccess) {
          MVUser.checkoutCountries = res.collection;

          sessionStorage.setItem('MVUser', JSON.stringify(MVUser));
        }
      });
  }

  /* set current language */
  setLanguage(productsData: any) {
    let currentLanguage = productsData?.default_lang;

    this.defaultLanguage = productsData?.default_lang;

    if (this.langCode === '') {
      this.setTranslations(this.defaultLanguage);
      this.dataService.changeSelectedLanguage(this.defaultLanguage);

      this.document.documentElement.lang =
        this.defaultLanguage + '-' + this.selectedCountry;

      currentLanguage = this.defaultLanguage;
    } else {
      this.setTranslations(this.langCode);
      this.dataService.changeSelectedLanguage(this.langCode);

      this.document.documentElement.lang =
        this.langCode + '-' + this.selectedCountry;

      currentLanguage = this.langCode;
    }

    return currentLanguage;
  }

  /* navigate to tracked page */
  navigateToPage(productsData: any) {
    if (productsData) {
      this.dataService.currentPageSlug$.subscribe(
        (slugData: { url?: string; elementId?: number }) => {
          if (
            !(
              slugData &&
              Object.keys(slugData).length === 0 &&
              slugData.constructor === Object
            )
          ) {
            const pageSlug =
              slugData.url && slugData.elementId
                ? this.utilityService.getPageSlug(
                    productsData,
                    slugData.url,
                    slugData.elementId
                  )
                : '';
            const redirectUrl = '/' + slugData.url + '/' + pageSlug;

            if (pageSlug === '') {
              this.utilityService.navigateToRoute('/');
            } else {
              this.utilityService.navigateToRoute(redirectUrl);
            }
          }
        }
      );
    }
  }

  /* cookies */
  getCookieDialogStatus() {
    this.dataService.currentCookieDialogStatus$.subscribe((status) => {
      this.showCookieDialog = status;

      if (status) {
        if (this.cookieTimerSubscription) {
          this.cookieTimerSubscription.unsubscribe();
        }
        this.cookieTimerSubscription = timer(5000).subscribe(() => {
          this.dataService.setCookieDialogStatus(false);
        });
      }
    });
  }

  getCookieStatus() {
    const isCookiePresent = this.cookieService.check('CookieConsent');

    if (!isCookiePresent && this.isEuropeanCountry) {
      this.isCookiePresent = true;

      this.modalcontainer.clear();
      this.changeDetectionRef.detectChanges();
      this.utilityService.createDynamicComponent(
        this.modalcontainer,
        ModalCookieComponent
      );

      $('#cookieModal').modal({ backdrop: 'static', keyboard: false });
    } else {
      this.setFbChat();
    }
  }

  /* set referrer */
  setReferrer(refCode: string) {
    this.apiService.getReferrer(refCode).subscribe((referrer: any) => {
      if (referrer.length !== 0) {
        this.setGAandPixelCode(referrer.fb_pixel_id);
        this.fbPageID = '' + referrer.fb_page_id;
        this.setFbChat();
        this.dataService.setReferrer(referrer);
        this.referrerVideoId = referrer.video_id ? referrer.video_id : '';
      } else {
        if (!this.isStaging) {
          window.location.href = this.clientDomain + this.router.url;
        }
      }
    });
  }

  /* set fb and google scripts */
  setFbChat() {
    const initParams: InitParams = {
      xfbml: true,
      version: 'v3.2',
    };
    if (this.isBrowser) {
      setTimeout(() => {
        this.fb.init(initParams);
      }, 0);
    }
  }

  setGAandPixelCode(pixelCode: string) {
    let scriptFBScript: HTMLElement = this.renderer.createElement('script');
    let scriptFBNoScript: HTMLElement = this.renderer.createElement('noscript');

    if (pixelCode !== '') {
      scriptFBScript.innerHTML =
        `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '` +
        pixelCode +
        `');
        fbq('track', 'PageView');`;

      scriptFBNoScript.innerHTML =
        `<img height="1" width="1"
        src="https://www.facebook.com/tr?id=` +
        pixelCode +
        `&ev=PageView&noscript=1"/>`;
    }

    this.renderer.appendChild(document.head, scriptFBScript);
    this.renderer.appendChild(document.head, scriptFBNoScript);
  }

  onClickCloseVideo() {
    this.referrerVideoId = '';
  }

  /* get MV user */
  setViOffer() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;

    if (
      VIOffer !== null &&
      VIOffer.offerId !== null &&
      VIOffer.refCode !== null
    ) {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - VIOffer.createdTime) / 1000;

      if (timeDifference <= 24 * 60 * 60) {
        this.apiService.getGngOfferId(VIOffer.offerId).subscribe(() => {
          this.dataService.setViOffer(true);
        });
      } else {
        localStorage.removeItem('VIOffer');
      }
    }

    this.userService.validateVIUserSession();
    /*
    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    if(VIUser !== null) {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - VIUser.createdTime) / 1000;
      if(VIUser.hasOwnProperty('guestPass') && VIUser.guestPass) {
        if (timeDifference >= 24 * 60 * 60) {
          localStorage.removeItem('VIUser');
        }
      }else {
        if(VIUser.hasOwnProperty('viProductId')) {
          if (timeDifference >= 1 * 60 * 60) {
            localStorage.removeItem('VIUser');
            this.dataService.setViTimer('');
          }else {
            this.dataService.setViTimer(VIUser.expiryTime);
          }
        }
      }
    }
    */

    /*if (VIUser !== null && VIUser.hasOwnProperty('viProductId')) {
      this.dataService.setViTimer(VIUser.expiryTime);
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - VIUser.createdTime) / 1000;
      if (timeDifference <= 2 * 60 * 60) {
        this.dataService.setViTimer(VIUser.createdTime);
      }
    }*/
  }

  setUser() {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    if (MVUser !== null) {
      this.dataService.setUserWithScopes(MVUser);

      this.getUserCheckoutCountries(MVUser);
    }
  }

  getUserWithScopes() {
    this.apiService.getUsers(this.selectedCountry).subscribe((userData) => {
      if (
        !(
          userData.user_info &&
          Object.keys(userData.user_info).length === 0 &&
          userData.user_info.constructor === Object
        )
      ) {
        this.redirectToUrl();
        sessionStorage.setItem('MVUser', JSON.stringify(userData.user_info));
        this.dataService.setUserWithScopes(userData.user_info);
        this.getUserCheckoutCountries(userData.user_info);

        this.updateProductsData();
        this.updateTagsAvailability();
        this.updateCategoriesAvailability();
      }
    });
  }

  updateTagsAvailability() {
    this.dataService.currentTags$.pipe(take(1)).subscribe((tags) => {
      this.updateAvailability(tags, false);
    });
  }

  updateCategoriesAvailability() {
    this.dataService.currentCategories$
      .pipe(take(1))
      .subscribe((categories) => this.updateAvailability(categories, true));
  }

  updateProductsData() {
    this.dataService.currentProductsData$
      .pipe(take(1))
      .subscribe((data) => this.dataService.setProductsData(data));
  }

  private updateAvailability(
    tagsOrCategories: ProductTagOrCategory[],
    isCategory: boolean
  ) {
    const updatedTagsOrCategories = tagsOrCategories.map((t) => {
      t.isUserCanAccess = this.userService.isUserCanAccess(
        t.accessLevels,
        t.customUsers
      );
      t.isEveryoneCanAccess = this.userService.isEveryoneCanAccess(
        t.accessLevels
      );
      t.accessLevelTitle = this.userService.accessLevelTitle(t.accessLevels);

      return t;
    });

    isCategory
      ? this.dataService.setCategories(updatedTagsOrCategories)
      : this.dataService.setTags(updatedTagsOrCategories);
  }

  private redirectToUrl() {
    const LocalRedirectUrl = localStorage.getItem('redirectUrl');
    let redirectUrl = LocalRedirectUrl ? JSON.parse(LocalRedirectUrl) : null;

    if (redirectUrl !== null) {
      localStorage.removeItem('redirectUrl');

      window.location.href = redirectUrl;
    }
  }

  getParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      const isExistingUser = params.get('existing_user');
      const offerId = params.get('offerid');
      const contactId = params.get('contactid');
      const offerorName = params.get('name') !== null ? params.get('name') : '';
      const offerorImage =
        params.get('image') !== null ? params.get('image') : '';
      const offerorFirstName =
        params.get('fname') !== null ? params.get('fname') : '';
      const offerorLastName =
        params.get('lname') !== null ? params.get('lname') : '';
      const offerorEmail =
        params.get('email') !== null ? params.get('email') : '';

      const promptLogin =
        params.get('promptLogin') !== null
          ? params.get('promptLogin')
          : 'false';

      if (offerId !== null && refCode !== null) {
        if (contactId !== null) {
          this.apiService
            .getGngProposal(offerId, contactId)
            .subscribe((res: any) => {
              const userId = res.userId;

              this.setGngOfferInfo(
                userId,
                contactId,
                offerId,
                refCode,
                promptLogin,
                offerorName,
                offerorImage,
                offerorFirstName,
                offerorLastName,
                offerorEmail
              );
            });
        } else {
          this.apiService.getGngOfferId(offerId).subscribe((res: any) => {
            const userId = res.userId;

            this.setGngOfferInfo(
              userId,
              contactId,
              offerId,
              refCode,
              promptLogin,
              offerorName,
              offerorImage,
              offerorFirstName,
              offerorLastName,
              offerorEmail
            );
          });
        }

        const removedParamsUrl = this.router.url.substring(
          0,
          this.router.url.indexOf('?')
        );

        this.location.go(removedParamsUrl);
      }

      if (isExistingUser !== null && isExistingUser === 'true') {
        this.userService.login();
      }

      if (refCode !== null && this.isStaging) {
        this.refCode = refCode;
        this.setReferrer(refCode);
      }
    });
  }

  private setGngOfferInfo(
    userId: string,
    contactId: string | null,
    offerId: string,
    refCode: string,
    promptLogin: string | null,
    offerorName: string | null,
    offerorImage: string | null,
    offerorFirstName: string | null,
    offerorLastName: string | null,
    offerorEmail: string | null
  ) {
    this.dataService.setViOffer(true);

    const createdTime = new Date().getTime();

    const VIOffer = {
      userId,
      contactId,
      offerId,
      refCode,
      promptLogin,
      offerorName,
      offerorImage,
      createdTime,
      offerorFirstName,
      offerorLastName,
      offerorEmail,
    };

    localStorage.setItem('VIOffer', JSON.stringify(VIOffer));

    this.modalcontainer.clear();
    this.changeDetectionRef.detectChanges();
    this.utilityService.createDynamicComponent(
      this.modalcontainer,
      ModalViComponent
    );

    $('#shareVIModal').modal();
  }

  /* get sidebar name */
  getSidebarName() {
    this.dataService.currentSidebarName$.subscribe((name) => {
      this.sidebarName = name;

      if (name === '') {
        $('.drawer').drawer('close');
      }
    });
  }

  receiveSidebarName(name: string) {
    this.sidebarName = name;

    if (name === '') {
      $('.drawer').drawer('close');
    }
  }

  /* router navigate */
  onActivate() {
    if (this.isBrowser) {
      $('#exampleModalCenter').modal('hide');
      $('#joinAsPromoterModal').modal('hide');
      $('#pruvitTVModal').modal('hide');
      $('#shareCartModal').modal('hide');
      $('#referrerCode').modal('hide');
      $('#referrerBy').modal('hide');
      $('#independentPruver').modal('hide');

      if ($('.drawer-open').length > 0) {
        $('.drawer').drawer('close');
      }

      window.scroll(0, 0);
    }
  }

  /* create modals */
  createProductModals() {
    this.dataService.currentModalName$.subscribe((res) => {
      this.modalcontainer.clear();
      this.changeDetectionRef.detectChanges();

      if (res.postName === 'pruvit-modal-utilities') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalUtilitiesComponent
        );
      } else if (res.postName === 'purchase-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalPurchaseWarningComponent
        );
      } else if (res.postName === 'cookie-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalCookieComponent
        );
      } else if (res.postName === 'restrict-checkout-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalRestrictCheckoutComponent
        );
      } else if (res.postName === 'restrict-share-cart-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalRestrictShareCartComponent
        );
      } else if (res.postName === 'access-level-modal' && res.payload) {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalAccessLevelComponent,
          res.payload
        );
      } else if (res.postName === 'product-modal' && res.payload) {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalProductsComponent,
          res.payload
        );
      } else if (res.postName === 'referrer-modal' && res.payload) {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalCheckoutComponent,
          res.payload
        );
      } else if (res.postName === 'vi-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalViComponent
        );
      } else if (res.postName === 'impersonation-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalImpersonationComponent
        );
      }
    });
  }

  /* enable phrase and translations */
  setTranslationsList() {
    this.apiService.getPhraseLanguages().subscribe((languages: any[]) => {
      this.translationsList = languages;
    });
  }

  setPhraseEditor() {
    const translateMode: any =
      this.utilityService.getUrlParameter('phrase_context');

    if (translateMode !== false) {
      initializePhraseAppEditor(this.phraseConfig);
    }
  }

  setTranslations(langCode: string) {
    let translationLangCode = '';
    if (langCode === 'zh-hans') translationLangCode = 'zh-Hans';
    else if (langCode === 'zh-hant') translationLangCode = 'zh-Hant';
    else if (langCode === 'pt-pt') translationLangCode = 'pt-PT';
    else if (langCode === 'es') translationLangCode = 'es-MX';
    else if (langCode === 'es-es') translationLangCode = 'es-ES';
    else translationLangCode = langCode;

    if (this.translationsList.length !== 0) {
      this.translationsList.forEach((translation: any) => {
        if (translation.code === translationLangCode) {
          this.apiService
            .getPhraseTranslation(translation.id)
            .subscribe((translations: any) => {
              this.translate.setTranslation(langCode, translations);
            });
        }
      });
    } else {
      this.apiService.getPhraseLanguages().subscribe((languages: any[]) => {
        languages.forEach((translation: any) => {
          if (translation.code === translationLangCode) {
            this.apiService
              .getPhraseTranslation(translation.id)
              .subscribe((translations: any) => {
                this.translate.setTranslation(langCode, translations);
              });
          }
        });
      });
    }
  }

  /* set app theme and seo */
  setTheme() {
    if (this.isBrowser) {
      if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.renderer.addClass(document.body, 'dark-theme');
          this.renderer.removeClass(document.body, 'body-gray');
        } else {
          this.renderer.removeClass(document.body, 'dark-theme');
        }
      }
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          const newColorScheme = e.matches ? 'dark' : 'light';

          if (newColorScheme === 'dark') {
            this.renderer.addClass(document.body, 'dark-theme');
            this.renderer.removeClass(document.body, 'body-gray');
          } else {
            this.renderer.removeClass(document.body, 'dark-theme');
          }
        });
    }
  }

  setSeo() {
    this.seoService.updateTitle('');
    this.seoService.updateDescription('');
    this.seoService.updateDocumentLanguageAndCountry();
    this.seoService.updateRobotsForCountry();
    this.seoService.updateMeta(
      'keywords',
      'pruvit, pruvit ketones, prüvit, nat ketones, pruvit login, ketones drink, pruvit keto, prüvit, pruvitnow, pruvit canada, pruvit australia, ketones pruvit, keto nat, keto kreme, nat ketones drink, keto os, pruvit 10 day challenge, drink ketones challenge, pruvit.com, keto reboot, pruvit singapore, shopketo, shopketo australia, shopketo canada, shopketo singapore, shop keto, shopketo au, shopketo ca, shopketo sg, shopketo.com, shop keto.com, shop keto pruvit, shop ketones'
    );
  }

  /* trigger app-wide events */
  @HostListener('document:keydown', ['$event'])
  onKeySlashHandler(event: any) {
    if (event.code === 'Slash') {
      const isViModalShown = $('#shareVIModal').hasClass('show');
      const isAnyInputFocused = $('input').length
        ? $('input').is(':focus')
        : false;
      const qlEditorFocused =
        document.activeElement?.classList.contains('ql-editor') === true
          ? true
          : false;

      if (!isViModalShown && !isAnyInputFocused && !qlEditorFocused) {
        this.renderer.addClass(document.body, 'search-focus');
        this.dataService.changeSearchFocusStatus(true);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    const searchId = (event.srcElement as HTMLElement).id;

    if (searchId !== 'navbarSearchFocused') {
      this.renderer.removeClass(document.body, 'search-focus');
      this.dataService.changeSearchFocusStatus(false);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }
}
