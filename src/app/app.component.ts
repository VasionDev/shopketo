import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  PlatformRef,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CookieService } from 'ngx-cookie-service';
import { FacebookService, InitParams } from 'ngx-facebook';
import { initializePhraseAppEditor } from 'ngx-translate-phraseapp';
import { forkJoin, of, ReplaySubject, Subscription, timer } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { BlogApiService } from './blogs/services/blog-api.service';
import { WebsiteService } from './customer-dashboard/websites/service/websites-service';
import { ModalAccessLevelComponent } from './products/modals/modal-access-level/modal-access-level.component';
import { ModalProductsComponent } from './products/modals/modal-products/modal-products.component';
import { ProductTagOrCategory } from './products/models/product-tag-or-category.model';
import { ProductsApiService } from './products/services/products-api.service';
import { PHRASE_CONFIG_TOKEN, PhraseConfig } from './shared/config/phrase-config';
import { ModalBundleBuilderComponent } from './shared/modals/modal-bundle-builder/modal-bundle-builder.component';
import { ModalCheckoutComponent } from './shared/modals/modal-checkout/modal-checkout.component';
import { ModalCookieComponent } from './shared/modals/modal-cookie/modal-cookie.component';
import { ModalImpersonationComponent } from './shared/modals/modal-impersonation/modal-impersonation.component';
import { ModalLoginConfirmationComponent } from './shared/modals/modal-login-confirmation/modal-login-confirmation.component';
import { ModalPurchaseWarningComponent } from './shared/modals/modal-purchase-warning/modal-purchase-warning.component';
import { ModalRestrictCheckoutComponent } from './shared/modals/modal-restrict-checkout/modal-restrict-checkout.component';
import { ModalRestrictShareCartComponent } from './shared/modals/modal-restrict-share-cart/modal-restrict-share-cart.component';
import { ModalUtilitiesComponent } from './shared/modals/modal-utilities/modal-utilities.component';
import { ModalViComponent } from './shared/modals/modal-vi/modal-vi.component';
import { ModalWaitlistComponent } from './shared/modals/modal-waitlist/modal-waitlist.component';
import { Cart } from './shared/models/cart.model';
import { AppApiService } from './shared/services/app-api.service';
import { AppDataService } from './shared/services/app-data.service';
import { AppSeoService } from './shared/services/app-seo.service';
import { AppUserService } from './shared/services/app-user.service';
import { AppUtilityService } from './shared/services/app-utility.service';
import { BonusService } from './shared/services/bonus.service';
import { isEuropeanCountry } from './shared/utils/country-list';
import { setEveryMonth, setOneTime } from './sidebar/store/cart.actions';
import { AppState } from './store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('modalcontainer', { read: ViewContainerRef })
  modalcontainer!: ViewContainerRef;
  tenant = '';
  sidebarName = '';
  selectedLanguage = '';
  selectedCountry = '';
  isLoaded = false;
  langCode = '';
  fbPageID = '';
  production: boolean;
  isStaging: boolean;
  isLocalhost: boolean;
  clientDomain = '';
  defaultLanguage = '';
  refCode = '';
  translationsList: any[] = [];
  referrer: any = {};
  referrerVideoId = '';
  isCodePresent = false;
  isCookiePresent = false;
  isRootRoute = false;
  routePath = '';
  isBrowser: boolean;
  isAuthenticated: boolean = false;
  isEuropeanCountry = false;
  showCookieDialog = false;
  cookieTimerSubscription!: Subscription;
  favIcon: any;
  canShowFooter: boolean = false;
  shouldCheckGnGOffer: boolean = true;
  //isGNGOfferExist: boolean = false;
  clickedOnRefBtn: boolean = false;
  isOfferLoaded: boolean = false;
  dashboardLoader: boolean = false;
  isCartGNGOffer: boolean = false;
  viProductId: string = '';
  activeCountryList: any[] = [];
  userCountry: string = '';

  constructor(
    public oidcSecurityService: OidcSecurityService,
    public bonusService: BonusService,
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
    private websiteSvc: WebsiteService,
    @Inject(PHRASE_CONFIG_TOKEN) private phraseConfig: PhraseConfig,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: PlatformRef
  ) {
    this.tenant = environment.tenant;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (this.document.location.pathname.split('/').includes('me')) {
          this.canShowFooter = false;
        } else {
          this.canShowFooter = true;
        }
      }
    });

    this.favIcon = document.querySelector('#appFavicon');
    if (window.localStorage.getItem('redirect')) {
      if (window.localStorage.getItem('redirect')!.indexOf('order-success') > -1 && window.localStorage.getItem('redirect')!.indexOf('?code=') > -1) {
        window.localStorage.setItem('isOrderSuccess', 'true');
      }
    }
    this.setSidebarCountries();
    this.setImpersonation();
    this.oidcSecurityService.checkAuth().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.newgenApiService.getPersonal().subscribe((x) => {
          let user = x.collection[0];
          this.userCountry = user?.country;
          this.userEmitterService.setProfileObs(user);
          this.isAuthenticated = isAuthenticated;
          if (window.localStorage.getItem('isOrderSuccess') == 'true') {
            if (this.tenant === 'pruvit')
              this.router.navigate(['/cloud/dashboard']);
            else this.router.navigate(['/dashboard/order-success']);
          }
        });
      }
    });

    // if (this.tenant === 'ladyboss') {
    //   this.seoService.updateMeta('theme-color', '#f0006f');
    // }

    /*this.oidcSecurityService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.oidcSecurityService.userData$.subscribe(data=> {
          console.log('oid', data)
        })
        const accessToken = this.oidcSecurityService.getToken();
        const userRole = JSON.parse(atob(accessToken.split('.')[1]))?.role;
        if (userRole) {
          const isAdmin = this.userService.isAdminUser(userRole);
          this.dataService.setAdminStatus(isAdmin);
        }
        this.getUserWithScopes();
      }
    });*/

    this.oidcSecurityService.isAuthenticated$
      .pipe(
        switchMap((isAuthenticated) => {
          if (isAuthenticated) {
            return this.oidcSecurityService.userData$;
          }
          return of(null);
        })
      )
      .subscribe((userData) => {
        if (userData) {
          this.dashboardLoader = true;
          if (this.tenant === 'ladyboss') {
            //sessionStorage.setItem('MVUser', JSON.stringify(userData));
            this.dataService.setUserProfile(userData);
          }
          const accessToken = this.oidcSecurityService.getToken();
          const userRole = JSON.parse(atob(accessToken.split('.')[1]))?.role;
          if (userRole) {
            const isAdmin = this.userService.isAdminUser(userRole);
            this.dataService.setAdminStatus(isAdmin);
          }
          this.getUserWithScopes();
        }
      });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((res) => {
        const routePath = res.url.includes('?') ? res.url.split('?')[0] : res.url;
        this.routePath = routePath;
        if (routePath === '/me') this.clickedOnRefBtn = true;
        const isProductDetailPage = routePath.startsWith('/product') || routePath.startsWith(`/${this.selectedCountry.toLowerCase()}/product`);
        const blogDetailPattern = '^/blog/(?!author|category)([a-z0-9]+)|^/ca/blog/(?!author|category)([a-z0-9]+)';
        const blogDetailRegEx = new RegExp(blogDetailPattern);
        const isBlogDetailPage = blogDetailRegEx.test(routePath);

        if (
          (this.tenant === 'ladyboss' && !routePath.startsWith('/dashboard')) ||
          isProductDetailPage ||
          isBlogDetailPage ||
          routePath.startsWith('/ingredients') ||
          routePath.startsWith(`/${this.selectedCountry.toLowerCase()}/ingredients`) ||
          routePath.startsWith('/promoter') ||
          routePath.startsWith(`/${this.selectedCountry.toLowerCase()}/promoter`)
        ) {
          this.renderer.removeClass(document.body, 'body-gray');
        } else {
          this.renderer.addClass(document.body, 'body-gray');
        }

        this.isRootRoute = routePath === '' || routePath === '/' + this.selectedCountry.toLowerCase();
        setTimeout(() => {
          window.scroll(0, 0);
        }, 100);
      });

    this.production = environment.production;
    this.isStaging = environment.isStaging;
    this.isLocalhost = this.document.location.href.includes('localhost');
    this.clientDomain = environment.clientDomain;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.setSeo();

    if(this.tenant === 'pruvit') {
      $(document).ready(() => {
        $('.drawer').drawer({
          iscroll: {
            mouseWheel: false,
            scrollbars: false,
            bounce: false,
            disableTouch: true,
            disablePointer: true,
            disableMouse: true,
          },
        });
      });
    } else {
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

  }

  ngOnInit() {
    console.log('APP has been initialized');
    this.appHeight();
    this.setStaticTranslation();
    if (this.tenant === 'pruvit') this.setTheme();
    // this.setSidebarCountries();
    this.setUser();
    // this.setImpersonation();
    this.getSidebarName();

    this.getSelectedLanguage();
    this.getSelectedCountry();
    
    this.clearCart();
    this.setTranslationsList();
    this.getCookieDialogStatus();

    this.createProductModals();
    this.getParams();

    const urlParams = new URLSearchParams(this.document.location.search);
    if (this.isStaging && this.tenant === 'pruvit' && urlParams.get('ref') === null) this.setViOffer();

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
    this.dataService.changeRedirectedCountry('');
    /*const urlParams = new URLSearchParams(this.document.location.search);
    const searchObj = Object.fromEntries(urlParams);
    const paramsObj = searchObj.hasOwnProperty('offerid') ? searchObj : {};*/
    const paramsObj = {};

    const localMVUser = sessionStorage.getItem('MVUser');
    const MVUser = localMVUser ? JSON.parse(localMVUser) : null;
    const routeUrl = this.document.location.pathname.split('/')[1];
    let country = '';

    if (routeUrl.toLowerCase() === 'ca' && this.isActiveCountry('ca')) {
      country = 'CA';
    } else if (routeUrl.toLowerCase() === 'au' && this.isActiveCountry('au')) {
      country = 'AU';
    } else if (routeUrl.toLowerCase() === 'mo' && this.isActiveCountry('mo')) {
      country = 'MO';
    } else if (routeUrl.toLowerCase() === 'hk' && this.isActiveCountry('hk')) {
      country = 'HK';
    } else if (routeUrl.toLowerCase() === 'sg' && this.isActiveCountry('sg')) {
      country = 'SG';
    } else if (routeUrl.toLowerCase() === 'my' && this.isActiveCountry('my')) {
      country = 'MY';
    } else if (routeUrl.toLowerCase() === 'tw' && this.isActiveCountry('tw')) {
      country = 'TW';
    } else if (routeUrl.toLowerCase() === 'jp' && this.isActiveCountry('jp')) {
      country = 'JP';
    } else if (routeUrl.toLowerCase() === 'mx' && this.isActiveCountry('mx')) {
      country = 'MX';
    } else if (routeUrl.toLowerCase() === 'nz' && this.isActiveCountry('nz')) {
      country = 'NZ';
    } else if (routeUrl.toLowerCase() === 'de' && this.isActiveCountry('de')) {
      country = 'DE';
    } else if (routeUrl.toLowerCase() === 'gb' && this.isActiveCountry('gb')) {
      country = 'GB';
    } else if (routeUrl.toLowerCase() === 'it' && this.isActiveCountry('it')) {
      country = 'IT';
    } else if (routeUrl.toLowerCase() === 'es' && this.isActiveCountry('es')) {
      country = 'ES';
    } else if (routeUrl.toLowerCase() === 'nl' && this.isActiveCountry('nl')) {
      country = 'NL';
    } else if (routeUrl.toLowerCase() === 'at' && this.isActiveCountry('at')) {
      country = 'AT';
    } else if (routeUrl.toLowerCase() === 'pl' && this.isActiveCountry('pl')) {
      country = 'PL';
    } else if (routeUrl.toLowerCase() === 'ie' && this.isActiveCountry('ie')) {
      country = 'IE';
    } else if (routeUrl.toLowerCase() === 'se' && this.isActiveCountry('se')) {
      country = 'SE';
    } else if (routeUrl.toLowerCase() === 'hu' && this.isActiveCountry('hu')) {
      country = 'HU';
    } else if (routeUrl.toLowerCase() === 'fr' && this.isActiveCountry('fr')) {
      country = 'FR';
    } else if (routeUrl.toLowerCase() === 'pt' && this.isActiveCountry('pt')) {
      country = 'PT';
    } else if (routeUrl.toLowerCase() === 'fi' && this.isActiveCountry('fi')) {
      country = 'FI';
    } else if (routeUrl.toLowerCase() === 'be' && this.isActiveCountry('be')) {
      country = 'BE';
    } else if (routeUrl.toLowerCase() === 'ro' && this.isActiveCountry('ro')) {
      country = 'RO';
    } else if (routeUrl.toLowerCase() === 'bg' && this.isActiveCountry('bg')) {
      country = 'BG';
    } else if (routeUrl.toLowerCase() === 'hr' && this.isActiveCountry('hr')) {
      country = 'HR';
    } else if (routeUrl.toLowerCase() === 'cy' && this.isActiveCountry('cy')) {
      country = 'CY';
    } else if (routeUrl.toLowerCase() === 'ch' && this.isActiveCountry('ch')) {
      country = 'CH';
    } else if (routeUrl.toLowerCase() === 'cz' && this.isActiveCountry('cz')) {
      country = 'CZ';
    } else if (routeUrl.toLowerCase() === 'dk' && this.isActiveCountry('dk')) {
      country = 'DK';
    } else if (routeUrl.toLowerCase() === 'ee' && this.isActiveCountry('ee')) {
      country = 'EE';
    } else if (routeUrl.toLowerCase() === 'gr' && this.isActiveCountry('gr')) {
      country = 'GR';
    } else if (routeUrl.toLowerCase() === 'lv' && this.isActiveCountry('lv')) {
      country = 'LV';
    } else if (routeUrl.toLowerCase() === 'lt' && this.isActiveCountry('lt')) {
      country = 'LT';
    } else if (routeUrl.toLowerCase() === 'lu' && this.isActiveCountry('lu')) {
      country = 'LU';
    } else if (routeUrl.toLowerCase() === 'mt' && this.isActiveCountry('mt')) {
      country = 'MT';
    } else if (routeUrl.toLowerCase() === 'sk' && this.isActiveCountry('sk')) {
      country = 'SK';
    } else if (routeUrl.toLowerCase() === 'si' && this.isActiveCountry('si')) {
      country = 'SI';
    }  else {
      country = 'US';
    }
    if(this.tenant === 'pruvit') {
      if(MVUser) {
        const localSelection = null;
        const userCountry: string = (localSelection ? localSelection : MVUser.mvuser_country).toUpperCase();
  
        let navigateURL = this.getRelativeUrl().replace(/^\/+/g, '');
        if(!navigateURL.includes('cloud') && !navigateURL.includes('implicit')) {
          if(
            (
              // navigateURL === 'smartship' ||
              navigateURL === 'research' ||
              navigateURL === 'learn' ||
              navigateURL === 'team' ||
              navigateURL === 'about' ||
              // navigateURL === 'vip' ||
              (navigateURL === 'promoter' && (country === 'GB' || country === 'CH'))
            ) && isEuropeanCountry(country)
          ) {
            this.utilityService.navigateToRoute('/', country, paramsObj);
          } else {
            this.utilityService.navigateToRoute(`/${navigateURL}`, country, paramsObj);
          }
          this.setRedirectedCountry(country);
        } else {
          this.dataService.changeSelectedCountry(userCountry);
        }
      } else {
        //const paramsStr = this.document.location.search;
        const pathName = this.document.location.pathname;
        //const urlParams = new URLSearchParams(paramsStr);
        //const code = urlParams.get('code');
        //const existingUser = urlParams.get('existing_user');
        if (!pathName.includes('cloud') && !pathName.includes('implicit')) {
          this.setRedirectedCountry(country);
        } else {
          this.dataService.changeSelectedCountry(country);
        }
      }
    } else {
      this.dataService.changeSelectedCountry('US');
    }
  }

  private getRelativeUrl() {
    const splitedUrl = this.document.location.pathname.split('/');
    let relativeURL = '';
    if(splitedUrl[1] && splitedUrl[1].length === 2) {
      if(this.isActiveCountry(splitedUrl[1])) {
        relativeURL = '/' + splitedUrl.filter(el => el !== '' && el !== splitedUrl[1]).join('/');
      }else {
        relativeURL = '/' + splitedUrl.filter(el => el !== '').join('/');
      }
    }else {
      relativeURL = this.document.location.pathname;
    }
    return relativeURL;
  }

  setRedirectedCountry(visitedCountry: string) {

    /*const urlParams = new URLSearchParams(this.document.location.search);
    const searchObj = Object.fromEntries(urlParams);
    const paramsObj = searchObj.hasOwnProperty('offerid') ? searchObj : {};*/
    const paramsObj = {};

    /*const LocalConfirmedCountry = localStorage.getItem('ConfirmedCountry');
    let hasRedirectedCountry = LocalConfirmedCountry
      ? JSON.parse(LocalConfirmedCountry)
      : null;*/
    let hasRedirectedCountry = null;

    if (hasRedirectedCountry !== null && hasRedirectedCountry !== '') {
      const translateMode: any =
        this.utilityService.getUrlParameter('phrase_context');

      if (translateMode !== false) {
        hasRedirectedCountry = 'US';
      } else {
        let navigateURL = this.getRelativeUrl().replace(/^\/+/g, '');
        if(
          (
            // navigateURL === 'smartship' ||
            navigateURL === 'research' ||
            navigateURL === 'learn' ||
            navigateURL === 'team' ||
            navigateURL === 'about' ||
            // navigateURL === 'vip' ||
            (navigateURL === 'promoter' && (hasRedirectedCountry === 'GB' || hasRedirectedCountry === 'CH'))
          ) && isEuropeanCountry(hasRedirectedCountry)
        ) {
          this.utilityService.navigateToRoute('/', hasRedirectedCountry, paramsObj);
        } else {
          this.utilityService.navigateToRoute(`/${navigateURL}`, hasRedirectedCountry, paramsObj);
        }
      }
      this.dataService.changeSelectedCountry(hasRedirectedCountry);
    } else {
      if (this.tenant === 'pruvit') {
        this.apiService.getGeoCountryCode().subscribe(
          (res: any) => {
            if (res) {
              if (
                this.isActiveCountry(res.country_code.toLowerCase()) &&
                (res.country_code.toLowerCase() === 'ca' ||
                res.country_code.toLowerCase() === 'au' ||
                res.country_code.toLowerCase() === 'mo' ||
                res.country_code.toLowerCase() === 'hk' ||
                res.country_code.toLowerCase() === 'sg' ||
                res.country_code.toLowerCase() === 'my' ||
                res.country_code.toLowerCase() === 'tw' ||
                res.country_code.toLowerCase() === 'jp' ||
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
                res.country_code.toLowerCase() === 'be' ||
                res.country_code.toLowerCase() === 'bg' ||
                res.country_code.toLowerCase() === 'hr' ||
                res.country_code.toLowerCase() === 'ch' ||
                res.country_code.toLowerCase() === 'cy' ||
                res.country_code.toLowerCase() === 'cz' ||
                res.country_code.toLowerCase() === 'dk' ||
                res.country_code.toLowerCase() === 'ee' ||
                res.country_code.toLowerCase() === 'gr' ||
                res.country_code.toLowerCase() === 'lv' ||
                res.country_code.toLowerCase() === 'lt' ||
                res.country_code.toLowerCase() === 'lu' ||
                res.country_code.toLowerCase() === 'mt' ||
                res.country_code.toLowerCase() === 'sk' ||
                res.country_code.toLowerCase() === 'si'
                )
              ) {
                if(visitedCountry !== res.country_code) {
                  this.dataService.changeRedirectedCountry(res.country_code);
                }
                if(this.selectedCountry !== visitedCountry) this.dataService.changeSelectedCountry(visitedCountry);
              } else {
                if(this.selectedCountry !== visitedCountry) this.dataService.changeSelectedCountry(visitedCountry);
              }
            } else {
              this.dataService.changeSelectedCountry(visitedCountry);
            }
          },
          () => {
            this.dataService.changeSelectedCountry(visitedCountry);
          }
        );
      } else {
        this.dataService.changeSelectedCountry('US');
      }
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
      //if (!this.isStaging) {
        //this.shouldCheckGnGOffer = this.isGNGOfferExist ? false : true;
        const localVIOffer = localStorage.getItem('VIOffer');
        const VIOffer = localVIOffer ? JSON.parse(localVIOffer) : null;
        const rawRefCode = finalSplittedStr[0].split('-')[0];
        if (VIOffer && VIOffer.refCode !== rawRefCode) {
          localStorage.removeItem('VIOffer');
          localStorage.removeItem('VIUser');
          localStorage.removeItem('showGngModal');
        } else if (VIOffer && VIOffer.refCode === rawRefCode) {
          this.shouldCheckGnGOffer = false;
          this.setViOffer();
        }
        this.setReferrer(finalSplittedStr[0]);
      //}

      this.dataService.setIsSubdomainStatus(true);
    } else {
      if(!this.isStaging) this.setViOffer();
      this.seoService.updateRobots('index,follow');
      this.dataService.setIsSubdomainStatus(false);
    }
  }

  /* set sidebar countries */
  setSidebarCountries() {
    this.apiService.getCountries().subscribe((countries: any) => {
      if (countries) {
        const activeCountries: any[] = countries.filter(
          (country: any) => country.active === '1'
        );
        this.activeCountryList = activeCountries;
        this.dataService.setCountries(countries);
        if (this.isBrowser) {
          this.setLangCode();
          if(this.tenant === 'ladyboss' || !(this.routePath.startsWith('/cloud') || this.routePath.startsWith('/implicit') || this.isAuthenticated)) { 
            this.setCountryCode();
          }
          this.setReferrerCode();
          this.setPhraseEditor();
        } else {
          this.isLoaded = true;
        }
      }
    });
  }

  isActiveCountry(countryCode: string) {
    const country = this.activeCountryList.find((list: any) => list.country_code.toLowerCase() === countryCode.toLowerCase());
    return country ? true : false;
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
      
      if (country) {
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
        .subscribe(
          (data) => {
            this.isCookiePresent = false;
            
            if (!this.isCodePresent) {
              this.isLoaded = true;
            }

            //this.getParams();

            this.isEuropeanCountry = isEuropeanCountry(country);

            if(this.isRootRoute) this.getUserCustomizeData();

            const currentLanguage = this.setLanguage(data.productsData);
            this.setCart(country, currentLanguage);
            this.dataService.setProductsData(data);
            this.dataService.setPromoterMembership(data.promoterMembership);
            this.dataService.setCategories(data.categories);
            this.updateChildCategories(data.categories);
            this.dataService.setTags(data.tags);

            this.navigateToPage(data.productsData);
            this.getCookieStatus();
            if(this.tenant === 'pruvit') this.onUserCheckoutOPC2();
          },
          (err) => {
            this.isLoaded = true;
            console.log(err);
          }
        );
    }
  }

  getUserCustomizeData() {
    if (this.referrer?.userId) {
      this.websiteSvc
        .getCustomizeData(this.referrer?.userId)
        .subscribe((res) => {
          //if (typeof res.success && res.success === true) {
            this.websiteSvc.setUserCustomizeData(res);
          //}
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
      //this.setFbChat();
    }
  }

  /* set referrer */
  setReferrer(refCode: string) {
    this.apiService
      .getReferrer(refCode)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer.length !== 0) {
          if(referrer?.redirect) {
            window.location.href = this.document.location.href.replace(referrer.replace, referrer.code);
          } else {
            this.referrer = referrer;
            if(this.tenant === 'pruvit') { 
              this.setGAandPixelCode(referrer.fb_pixel_id);
              if (referrer?.productId) this.checkGnGOffer(referrer);
            }
            this.fbPageID = '' + referrer.fb_page_id;
            if(this.fbPageID != '') this.setFbChat();
            this.dataService.setReferrer(referrer);
            this.referrerVideoId = referrer.video_id ? referrer.video_id : '';
          }
        } else {
          if (!this.isLocalhost) {
            window.location.href = this.clientDomain + this.router.url;
          } else {
            this.router.navigate([], {
              relativeTo: this.route
            });
          }
        }
      });
  }

  checkGnGOffer(referrer: any, checkGnGOffer?: boolean) {
    const isValidUser = this.userService.validateVIUserSession();
    this.shouldCheckGnGOffer = checkGnGOffer === true ? true : this.shouldCheckGnGOffer;
    if (!this.isCartGNGOffer && (!referrer?.productId || isValidUser || !this.shouldCheckGnGOffer)) return;
    const productId = this.isCartGNGOffer && this.viProductId ? this.viProductId : referrer.productId;
    this.apiService
      .getOffer(referrer.userId, productId)
      .subscribe((res: any) => {
        if (Object.keys(res).length) {
          this.setGngOfferInfo(
            res.title,
            referrer.userId,
            null,
            '',
            referrer.code,
            'false',
            referrer.name,
            referrer?.imageUrl,
            null,
            null,
            null,
            null,
            false,
            referrer?.productId,
            res.bonusValue,
            res.minOrderValue
          );
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

  setViOffer() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;
    if (
      VIOffer &&
      VIOffer.refCode !== null &&
      VIOffer.userId !== '' &&
      VIOffer.productId !== ''
    ) {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - VIOffer.createdTime) / 1000;

      if (timeDifference <= 24 * 60 * 60) {
        this.apiService
          .getOffer(VIOffer.userId, VIOffer.productId)
          .subscribe((res) => {
            if (Object.keys(res).length) {
              this.dataService.setViOffer(true);
            }
          });
      } else {
        localStorage.removeItem('VIOffer');
        localStorage.removeItem('showGngModal');
      }
    }

    this.userService.validateVIUserSession();
  }

  setUser() {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    if (MVUser !== null) {
      this.dataService.setUserWithScopes(MVUser);
      // if(this.tenant === 'pruvit') this.getUserVipLoyaltyStatus(MVUser);
      this.getUserCheckoutCountries(MVUser);
    }
  }

  /*getUserVipLoyaltyStatus(MVUser: any) {
    this.bonusService
      .getUserVipProgress(MVUser.mvuser_id, this.selectedLanguage)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        if (res.hasOwnProperty('isSuccess') && res.isSuccess) {
          const vipLoyaltyStatus = res.result.currentStatus;
          MVUser.vip_loyalty_status = vipLoyaltyStatus;
          if (vipLoyaltyStatus === 'vipPlus') {
            MVUser.mvuser_scopes = [...MVUser.mvuser_scopes, vipLoyaltyStatus];
          }
          sessionStorage.setItem('MVUser', JSON.stringify(MVUser));
        }
      });
  }*/

  setCountryForLoggedInUser(user: any) {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    const isDashboard = this.router.url.includes('cloud');
    if (
      this.tenant === 'pruvit' &&
      (!MVUser || user.mvuser_id !== MVUser.mvuser_id || isDashboard)
    ) {
      const userCountry = user.mvuser_country ? user.mvuser_country : 'US';
      this.dataService.changeSelectedCountry(userCountry);
      this.selectedCountry = userCountry;
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
        this.redirectToUrl(userData.user_info);
        /*if(this.tenant === 'pruvit') {
          this.setCountryForLoggedInUser(userData.user_info);
        }*/
        sessionStorage.setItem('MVUser', JSON.stringify(userData.user_info));
        this.dataService.setUserWithScopes(userData.user_info);
        if(this.tenant === 'pruvit') {
          this.setCountryCode();
        }
        // if(this.tenant === 'pruvit') this.getUserVipLoyaltyStatus(userData.user_info);
        this.getUserCheckoutCountries(userData.user_info);
        this.updateProductsData();
        this.updateTagsAvailability();
        this.updateCategoriesAvailability();
      }
      this.dashboardLoader = false;
    });
  }

  onUserCheckoutOPC2(){
    const LocalMVUser = sessionStorage.getItem('MVUser');
    const LocalRedirectUrl = localStorage.getItem('redirectUrl');
    const MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    const redirectUrl = LocalRedirectUrl ? JSON.parse(LocalRedirectUrl) : null;
    const isCheckoutLogin = localStorage.getItem('isCheckoutLogin') === 'true';
    if(isCheckoutLogin && MVUser && redirectUrl === null) {
      this.dataService.changePostName({ 
        postName: 'confirmation-checkout-login-modal' ,
        payload: { key: 'user', value: MVUser },
      });
      $('#ConfirmationCheckoutLoginModal').modal('show');
      localStorage.removeItem('isCheckoutLogin');
    }
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

    if (isCategory) {
      this.dataService.setCategories(updatedTagsOrCategories);
      this.updateChildCategories(updatedTagsOrCategories);
    } else {
      this.dataService.setTags(updatedTagsOrCategories);
    }
  }

  private updateChildCategories(categories: ProductTagOrCategory[]) {
    const childCats: ProductTagOrCategory[] = [];
    categories.forEach((cat) => {
      if (cat.childs.length) {
        childCats.push(...cat.childs);
      }
    });
    this.dataService.setChildCategories(childCats);
  }

  private redirectToUrl(user: any) {
    const userCountry = user.mvuser_country ? user.mvuser_country.toLowerCase() : 'us';
    const LocalRedirectUrl = localStorage.getItem('redirectUrl');
    const redirectUrl = LocalRedirectUrl ? JSON.parse(LocalRedirectUrl) : null;
    let modifiedUrl = '';
    if (redirectUrl !== null) {
      const filteredUrl = redirectUrl.replace(/^\/|\/$/g, '');
      const urlSplitedArray = filteredUrl.split('/');
      if(urlSplitedArray.length > 0 && urlSplitedArray[0].length === 2) {
        const hasActiveCountry = this.activeCountryList.find(country=> country.country_code.toLowerCase() === urlSplitedArray[0].toLowerCase());
        if(hasActiveCountry) {
          if(userCountry !== 'us') {
            modifiedUrl = urlSplitedArray.length > 1 ? `/${userCountry}/${urlSplitedArray.slice(1).join('/')}` : `/${userCountry}`;
          }else {
            modifiedUrl = urlSplitedArray.length > 1 ? '/' + urlSplitedArray.slice(1).join('/') : '/';
          }
        }else {
          if(userCountry !== 'us') {
            modifiedUrl = filteredUrl !== '' ? `/${userCountry}/${filteredUrl}` : `/${userCountry}`;
          }else {
            modifiedUrl = filteredUrl !== '' ? '/' + filteredUrl : '/';
          }
        }
      }else {
        if(userCountry !== 'us') {
          modifiedUrl = filteredUrl !== '' ? `/${userCountry}/${filteredUrl}` : `/${userCountry}`;
        }else {
          modifiedUrl = filteredUrl !== '' ? '/' + filteredUrl : '/';
        }
      }

      localStorage.removeItem('redirectUrl');
      window.location.href = modifiedUrl;
    }
  }

  getParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref') || params.get('referrerCode');
      const offererCode = params.get('offererCode');
      const isExistingUser = params.get('existing_user');
      const offerId = params.get('offerid');
      const userId = params.get('userId') || '';
      const productId = params.get('productId') || '';
      const viProductId = params.get('viProductId') || '';
      const contactId = params.get('contactid') || params.get('contactId');
      const offerorName = params.get('name') !== null ? params.get('name') : '';
      const offerorImage =
        params.get('image') !== null ? params.get('image') : '';
      const userImage =
        params.get('userImage') !== null ? params.get('userImage') : '';
      const offerorFirstName =
        params.get('fname') !== null ? params.get('fname') : '';
      const offerorLastName =
        params.get('lname') !== null ? params.get('lname') : '';
      const offerorEmail =
        params.get('email') !== null ? params.get('email') : '';

      if(this.document.location.pathname.split('/').includes('cart') && offererCode && viProductId) { 
        this.isCartGNGOffer = true;
        this.viProductId = viProductId;
      }

      const promptLogin = params.get('promptLogin') !== null ? params.get('promptLogin') : 'false';
      const isFormDisable = offerId && offerId !== '' && contactId && contactId !== '' && promptLogin === 'true' ? true : false;

      if (offerId !== null && userId != '' && productId != '' && refCode !== null && this.tenant === 'pruvit') {
        localStorage.removeItem('VIOffer');
        localStorage.removeItem('VIUser');
        localStorage.removeItem('showGngModal');
        if (contactId !== null) {
          const proposalReq = this.apiService.getGngProposal(offerId, contactId);
          const offerReq = this.apiService.getOffer(userId, productId);
          forkJoin([proposalReq, offerReq])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((x) => {
              if (Object.keys(x[0]).length) {
                this.setGngOfferInfo(
                  x[1]?.title,
                  userId,
                  contactId,
                  offerId,
                  refCode,
                  promptLogin,
                  offerorName,
                  offerorImage,
                  userImage,
                  offerorFirstName,
                  offerorLastName,
                  offerorEmail,
                  isFormDisable,
                  productId,
                  x[1]?.bonusValue,
                  x[1]?.minOrderValue
                );
              }
              this.isOfferLoaded = true;
            });
        } else {
          this.apiService
            .getOffer(userId, productId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
              if (Object.keys(res).length) {
                this.setGngOfferInfo(
                  res.title,
                  userId,
                  contactId,
                  offerId,
                  refCode,
                  promptLogin,
                  offerorName,
                  offerorImage,
                  userImage,
                  offerorFirstName,
                  offerorLastName,
                  offerorEmail,
                  isFormDisable,
                  productId,
                  res.bonusValue,
                  res.minOrderValue
                );
              }
              this.isOfferLoaded = true;
            });
        }

        const removedParamsUrl = this.router.url.substring(0, this.router.url.indexOf('?'));
        this.location.go(removedParamsUrl);
      }

      if (isExistingUser !== null && isExistingUser === 'true') {
        this.userService.login();
      }
      //&& this.isStaging
      if ((refCode !== null) || (refCode !== null && !this.isStaging && this.tenant === 'ladyboss')) {
        this.refCode = refCode;
        if (Object.keys(this.referrer).length === 0) {
          //this.isGNGOfferExist = offerId ? true : false;
          const localVIUser = localStorage.getItem('VIUser');
          const VIUser = localVIUser ? JSON.parse(localVIUser) : null;
          if (VIUser && VIUser.referrer !== refCode) {
            localStorage.removeItem('VIOffer');
            localStorage.removeItem('VIUser');
            localStorage.removeItem('showGngModal');
          }
          //if(this.isStaging) this.shouldCheckGnGOffer = !this.isGNGOfferExist;
          //if(this.isLocalhost) this.shouldCheckGnGOffer = offerId ? false : true;
          if(offerId) this.shouldCheckGnGOffer = false;
          this.setReferrer(refCode);
        }
      }
    });
  }

  private setGngOfferInfo(
    offerName: string,
    userId: string,
    contactId: string | null,
    offerId: string,
    refCode: string,
    promptLogin: string | null,
    offerorName: string | null,
    offerorImage: string | null,
    userImage: string | null,
    offerorFirstName: string | null,
    offerorLastName: string | null,
    offerorEmail: string | null,
    isFormDisable: boolean,
    productId?: string | null,
    bonusValue?: string,
    minOrderValue?: string
  ) {
    const createdTime = new Date().getTime();
    const VIOffer = {
      offerName,
      userId,
      contactId,
      offerId,
      refCode,
      promptLogin,
      offerorName,
      offerorImage,
      userImage,
      createdTime,
      offerorFirstName,
      offerorLastName,
      offerorEmail,
      isFormDisable,
      productId,
      bonusValue,
      minOrderValue,
    };
   
    if(this.isCartGNGOffer) { 
      localStorage.setItem('VIOffer', JSON.stringify(VIOffer));
    } else {
      localStorage.setItem('VIOffer', JSON.stringify(VIOffer));
      this.dataService.setViOffer(true);

      if (this.tenant === 'ladyboss') {
      } else {
        if ($('#referrerCode').hasClass('show')) {
          $('#referrerCode').modal('hide');
        }
        const showGngModal = localStorage.getItem('showGngModal') || 'true';
       
        if($('#cookieModal').length && showGngModal === 'true') {
          $('body').on('hidden.bs.modal', '#cookieModal', () => {
            if ($('.modal-backdrop').length) $('.modal-backdrop').remove();
            this.modalcontainer.clear();
            this.changeDetectionRef.detectChanges();
            this.utilityService.createDynamicComponent(this.modalcontainer, ModalViComponent, { key: 'formDisable', value: isFormDisable });
            $('#shareVIModal').modal();
          });
        } else if(showGngModal === 'true') {
          this.modalcontainer.clear();
          this.changeDetectionRef.detectChanges();
          this.utilityService.createDynamicComponent(this.modalcontainer, ModalViComponent, { key: 'formDisable', value: isFormDisable });
          $('#shareVIModal').modal();
        }
        
      }
    }
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

      setTimeout(() => {
        window.scroll(0, 0);
      }, 100);
    }
  }

  /* create modals */
  createProductModals() {
    this.dataService.currentModalName$.subscribe((res) => {
      if(this.modalcontainer) this.modalcontainer.clear();
      this.changeDetectionRef.detectChanges();

      if (res.postName === 'pruvit-modal-utilities') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalUtilitiesComponent,
          res.payload ? res.payload : { key: 'isBundleBuilderCheckout', value: false }
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
      } else if (res.postName === 'confirmation-checkout-login-modal' && res.payload) {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalLoginConfirmationComponent,
          res.payload
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
        if (res.payload) {
          this.utilityService.createDynamicComponent(
            this.modalcontainer,
            ModalViComponent,
            res.payload
          );
        } else {
          this.utilityService.createDynamicComponent(
            this.modalcontainer,
            ModalViComponent
          );
        }
      } else if (res.postName === 'impersonation-modal') {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalImpersonationComponent
        );
      } else if (res.postName === 'bundle-builder-modal' && res.payload) {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalBundleBuilderComponent,
          res.payload
        );
      } else if (res.postName === 'waitlist-modal' && res.payload) {
        this.utilityService.createDynamicComponent(
          this.modalcontainer,
          ModalWaitlistComponent,
          res.payload
        );
      }
    });
  }

  /* enable phrase and translations */
  setTranslationsList() {
    this.apiService
      .getLocalPhraseLanguages()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((languages: any[]) => {
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
      const fallbackLocal = this.translationsList.find(list=> list.code && list.code === 'en');
      const fallbackId = fallbackLocal && fallbackLocal.id ? fallbackLocal.id : '';
      this.translationsList.forEach((translation: any) => {
        if (translation.code === translationLangCode) {
          this.apiService
            .getLocalPhraseTranslation(translation.code, fallbackId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((translations: any) => {
              this.translate.setTranslation(langCode, translations);
            });
        }
      });
    } else {
      this.apiService.getLocalPhraseLanguages().subscribe((languages: any[]) => {
        languages.forEach((translation: any) => {
          if (translation.code === translationLangCode) {
            this.apiService
              .getLocalPhraseTranslation(translation.code)
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
          this.seoService.updateMeta('theme-color', '#1c1c1e');
          this.renderer.addClass(document.body, 'dark-theme');
          this.renderer.removeClass(document.body, 'body-gray');
        } else {
          this.seoService.updateMeta('theme-color', '#ffffff');
          this.renderer.removeClass(document.body, 'dark-theme');
        }
      }
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          const newColorScheme = e.matches ? 'dark' : 'light';

          if (newColorScheme === 'dark') {
            this.seoService.updateMeta('theme-color', '#1c1c1e');
            this.renderer.addClass(document.body, 'dark-theme');
            this.renderer.removeClass(document.body, 'body-gray');
          } else {
            this.seoService.updateMeta('theme-color', '#ffffff');
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

  onClickReferrerImage() {
    this.clickedOnRefBtn = !this.clickedOnRefBtn;
    const path = this.isLocalhost ? '/me?ref=' + this.referrer.code : '/me';
    this.router.navigateByUrl(path);
  }

  @HostListener('window:resize', ['$event'])
  appHeight() {
    const doc = document.documentElement
    const scrHeight = window.innerHeight;
    const scrWidth = window.innerWidth;
    if (scrWidth <= 767) {
      this.dataService.setMobileView(true);
    } else {
      this.dataService.setMobileView(false);
    }
    doc.style.setProperty('--vh', (window.innerHeight*.01) + 'px');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
