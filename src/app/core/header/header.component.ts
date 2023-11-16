import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { isEuropeanCountry } from 'src/app/shared/utils/country-list';
import { environment } from '../../../environments/environment';
declare var $: any;
declare var fbChatHideNShowJS: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isRussellBrunson: boolean = false;
  @Input() referrer: any = {};
  @Output() messageEvent = new EventEmitter<string>();
  @ViewChild('discountBanner') discountBanner!: ElementRef;
  tenant = '';
  isStaging!: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  cartStatus = false;
  userRedirectURL = '';
  defaultLanguage = '';
  isFromOfferFlow = false;
  productsData: any = {};
  categories: ProductTagOrCategory[] = [];
  discountBannerHeight = 0;
  discountBannerHeightForNav = 0;
  clientDomainURL = '';
  returningUrl = '';
  isUserLoggedIn = false;
  impersonationPresent: boolean = false;
  userAvatar = '';
  isInputFocused = false;
  isSearchShowable = true;
  isMobileSearch = false;
  offers: Offer[] = [];
  routePath!: string;
  isLadybossDashboard: boolean = false;
  isLoaded: boolean = false;
  navClassForOtherLang = '';
  userFirstName: string = 'Account';

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private apiService: AppApiService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    this.userRedirectURL = environment.userURL;
    this.returningUrl = environment.returningDomain;
    this.clientDomainURL = environment.clientDomain;

    this.isMobileSearch =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        navigator.userAgent
      );
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCartStatus();
    this.getOfferFlowStatus();
    this.getUserAvatar();
    this.getImpersonationStatus();
    this.getRedirectURL();
    this.getCategories();
    
    fbChatHideNShowJS();
    setTimeout(() => this.setVInfo(), 2000);
    //this.setDiscountBannerHeight();
    
    if (this.tenant === 'ladyboss') {
      this.setDiscountBannerHeight();
      this.checkRoutePaths();
    }
  }

  checkRoutePaths() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((res) => {
        const routePath = res.url.includes('?')
          ? res.url.split('?')[0]
          : res.url;
        this.routePath = routePath;
        if (routePath.startsWith('/product') || routePath === '/phoenix' || routePath === '/dashboard') {
          this.setDiscountBannerHeight();
        }

        if (routePath.startsWith('/challenge') && !this.isStaging) {
          this.loadVWOScript();
        }

        if (routePath.startsWith('/5daycakechallenge') && !this.isStaging) {
          this.load5daycakechallengeVWOScript();
        }

        if (routePath && routePath.startsWith('/dashboard')) {
          this.isLadybossDashboard = true;
        } else {
          this.isLadybossDashboard = false;
        }
      });
  }

  private loadVWOScript() {
    const s = this.doc.createElement('script');
    s.type = 'text/javascript';
    s.id = 'vwoCode';
    s.innerHTML = `
    window._vwo_code=window._vwo_code || (function() {
    var account_id=611747,
    version=1.4,
    settings_tolerance=2000,
    library_tolerance=2500,
    use_existing_jquery=false,
    is_spa=1,
    hide_element='body',
    /* DO NOT EDIT BELOW THIS LINE */
    f=false,d=document,vwoCodeEl=document.querySelector('#vwoCode'),code={use_existing_jquery:function(){return use_existing_jquery},library_tolerance:function(){return library_tolerance},finish:function(){if(!f){f=true;var e=d.getElementById('_vis_opt_path_hides');if(e)e.parentNode.removeChild(e)}},finished:function(){return f},load:function(e){var t=d.createElement('script');t.fetchPriority='high';t.src=e;t.type='text/javascript';t.innerText;t.onerror=function(){_vwo_code.finish()};d.getElementsByTagName('head')[0].appendChild(t)},getVersion:function(){return version},getMatchedCookies:function(e){var t=[];if(document.cookie){t=document.cookie.match(e)||[]}return t},getCombinationCookie:function(){var e=code.getMatchedCookies(/(?:^|;)\s?(_vis_opt_exp_\d+_combi=[^;$]*)/gi);e=e.map(function(e){try{var t=decodeURIComponent(e);if(!/_vis_opt_exp_\d+_combi=(?:\d+,?)+\s*$/.test(t)){return''}return t}catch(e){return''}});var i=[];e.forEach(function(e){var t=e.match(/([\d,]+)/g);t&&i.push(t.join('-'))});return i.join('|')},init:function(){window.settings_timer=setTimeout(function(){_vwo_code.finish()},settings_tolerance);var e=d.createElement('style'),t=hide_element?hide_element+'{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}':'',i=d.getElementsByTagName('head')[0];e.setAttribute('id','_vis_opt_path_hides');vwoCodeEl&&e.setAttribute('nonce',vwoCodeEl.nonce);e.setAttribute('type','text/css');if(e.styleSheet)e.styleSheet.cssText=t;else e.appendChild(d.createTextNode(t));i.appendChild(e);var n=this.getCombinationCookie();this.load('https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(d.URL)+'&f='+ +is_spa+'&vn='+version+(n?'&c='+n:''));return settings_timer}};window._vwo_settings_timer = code.init();return code;}());`;
    const head = this.doc.getElementsByTagName('head')[0];
    head.appendChild(s);
  }

  private load5daycakechallengeVWOScript() {
    const s = this.doc.createElement('script');
    s.type = 'text/javascript';
    s.id = 'vwoCode';
    s.innerHTML = `
    window._vwo_code=window._vwo_code || (function() {
    var account_id=717286,
    version = 1.5,
    settings_tolerance=5000,
    library_tolerance=5000,
    use_existing_jquery=false,
    is_spa=1,
    hide_element='body',
    hide_element_style = 'opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important',
    /* DO NOT EDIT BELOW THIS LINE */
    f=false,d=document,vwoCodeEl=d.querySelector('#vwoCode'),code={use_existing_jquery:function(){return use_existing_jquery},library_tolerance:function(){return library_tolerance},hide_element_style:function(){return'{'+hide_element_style+'}'},finish:function(){if(!f){f=true;var e=d.getElementById('_vis_opt_path_hides');if(e)e.parentNode.removeChild(e)}},finished:function(){return f},load:function(e){var t=d.createElement('script');t.fetchPriority='high';t.src=e;t.type='text/javascript';t.onerror=function(){_vwo_code.finish()};d.getElementsByTagName('head')[0].appendChild(t)},getVersion:function(){return version},getMatchedCookies:function(e){var t=[];if(document.cookie){t=document.cookie.match(e)||[]}return t},getCombinationCookie:function(){var e=code.getMatchedCookies(/(?:^|;)\s?(_vis_opt_exp_\d+_combi=[^;$]*)/gi);e=e.map(function(e){try{var t=decodeURIComponent(e);if(!/_vis_opt_exp_\d+_combi=(?:\d+,?)+\s*$/.test(t)){return''}return t}catch(e){return''}});var i=[];e.forEach(function(e){var t=e.match(/([\d,]+)/g);t&&i.push(t.join('-'))});return i.join('|')},init:function(){if(d.URL.indexOf('__vwo_disable__')>-1)return;window.settings_timer=setTimeout(function(){_vwo_code.finish()},settings_tolerance);var e=d.createElement('style'),t=hide_element?hide_element+'{'+hide_element_style+'}':'',i=d.getElementsByTagName('head')[0];e.setAttribute('id','_vis_opt_path_hides');vwoCodeEl&&e.setAttribute('nonce',vwoCodeEl.nonce);e.setAttribute('type','text/css');if(e.styleSheet)e.styleSheet.cssText=t;else e.appendChild(d.createTextNode(t));i.appendChild(e);var n=this.getCombinationCookie();this.load('https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(d.URL)+'&f='+ +is_spa+'&vn='+version+(n?'&c='+n:''));return settings_timer}};window._vwo_settings_timer = code.init();return code;}());`;
    const head = this.doc.getElementsByTagName('head')[0];
    head.appendChild(s);
  }

  getImpersonationStatus() {
    this.dataService.impersonationStatus$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.impersonationPresent = x;
      });
  }

  getRedirectURL() {
    this.dataService.currentRedirectURL$.subscribe((url: string) => {
      if (url === '/search' || url === '/search/') {
        this.isSearchShowable = false;
      } else {
        this.isSearchShowable = true;
      }
    });
  }

  getUserAvatar() {
    if (this.tenant === 'ladyboss' && 0) {
      this.dataService.currentUserProfile$.subscribe((user) => {
        if (user !== null) {
          const imageUrl = user?.picture;
          this.isUserLoggedIn = true;
          this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
        } else {
          this.isUserLoggedIn = false;
        }
      });
    } else {
      this.dataService.currentUserWithScopes$.subscribe((user) => {
        if (user !== null) {
          this.isUserLoggedIn = true;
          const userInfo = JSON.parse(user.mvuser_info);
          const imageUrl = userInfo?.collection[0]?.imageUrl;
          this.userFirstName = userInfo?.collection[0]?.firstName;
          this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
        } else {
          this.isUserLoggedIn = false;
        }
      });
    }
  }

  getOfferFlowStatus() {
    this.dataService.currentOfferFlowStatus$.subscribe((status: boolean) => {
      this.isFromOfferFlow = status;
    });
  }

  getCartStatus() {
    this.dataService.currentCartStatus$.subscribe((status) => {
      if (status === null) {
        this.cartStatus = this.getLocalStorageCartStatus();
      } else {
        this.cartStatus = status;
      }
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$.subscribe((language: string) => {
      this.navClassForOtherLang = (language === 'de' || language === 'es') && !this.isUserLoggedIn ? 'other-lang-nav-items' : '';
      this.selectedLanguage = language;
      this.translate.use(this.selectedLanguage);

      this.getProducts();
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  private getLocalStorageCartStatus() {
    let cartStatus: boolean;
    const LocalOneTime = localStorage.getItem('OneTime');
    let cartOneTime: any[] = LocalOneTime ? JSON.parse(LocalOneTime) : null;

    const LocalEveryMonth = localStorage.getItem('EveryMonth');
    let cartEveryMonth: any[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : null;

    let oneTimeSelectedLanguage = [];
    let everyMonthSelectedLanguage = [];

    if (cartOneTime === null) {
      cartOneTime = [];
    }

    if (cartEveryMonth === null) {
      cartEveryMonth = [];
    }

    const tempOneTimeCart: any[] = [];
    cartOneTime.forEach((oneTime) => {
      if (
        (oneTime.country === this.selectedCountry.toLowerCase() &&
          oneTime.language === this.selectedLanguage &&
          oneTime.orderType === 'ordertype_1') ||
        (oneTime.country === this.selectedCountry.toLowerCase() &&
          oneTime.language === this.selectedLanguage &&
          oneTime.orderType === 'ordertype_3')
      ) {
        tempOneTimeCart.push(oneTime);
      }
    });
    oneTimeSelectedLanguage = tempOneTimeCart;

    const tempEveryMonthCart: any[] = [];
    cartEveryMonth.forEach((everyMonth) => {
      if (
        (everyMonth.country === this.selectedCountry.toLowerCase() &&
          everyMonth.language === this.selectedLanguage &&
          everyMonth.orderType === 'ordertype_2') ||
        (everyMonth.country === this.selectedCountry.toLowerCase() &&
          everyMonth.language === this.selectedLanguage &&
          everyMonth.orderType === 'ordertype_3')
      ) {
        tempEveryMonthCart.push(everyMonth);
      }
    });
    everyMonthSelectedLanguage = tempEveryMonthCart;

    if (
      oneTimeSelectedLanguage.length === 0 &&
      everyMonthSelectedLanguage.length === 0
    ) {
      cartStatus = false;
    } else {
      cartStatus = true;
    }
    return cartStatus;
  }

  getCategories() {
    this.dataService.currentCategories$.subscribe((categories) => {
      this.categories = categories
        .filter(
          (c) =>
            c.slug !== 'food' &&
            !c.accessLevels.isCustom.on &&
            c.products.length !== 0
        )
        .sort((a, b) => a.order - b.order);
    });
  }

  getProducts() {
    this.dataService.currentProductsData$.subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }
      this.isLoaded = true;
      this.defaultLanguage = data.productsData.default_lang;

      this.productsData = data.productsData;

      this.offers = data.offers;

      this.setDiscountBannerHeight();
    });
  }

  private setDiscountBannerHeight() {
    setTimeout(() => {
      this.isLoaded = true;
      if (this.discountBanner) {
        let offerSliderHeight = 0;
        if(this.tenant === 'pruvit') {
          offerSliderHeight = $('.offer-slider').length ? $('.offer-slider').outerHeight(): 0;
        } else {
          //offerSliderHeight = $('.sk-header__offer').length ? $('.sk-header__offer').outerHeight(): 0;
        }
        
        const referrerTopBannerHeight = $('.referrer-top-banner').length ? $('.referrer-top-banner').outerHeight() : 0;
        const confirmCountryHeight = $('.confirm-location-wrap').length ? $('.confirm-location-wrap').outerHeight() : 0;
        this.discountBannerHeight = this.discountBanner.nativeElement.offsetHeight - ((offerSliderHeight ? offerSliderHeight : 32) + referrerTopBannerHeight + confirmCountryHeight);
        
        this.discountBannerHeightForNav = this.discountBanner.nativeElement.offsetHeight;
        this.dataService.changeDiscountHeight(this.discountBannerHeight);
        if ($('.offer-slider').length && this.tenant === 'pruvit') {
          const navHeight = $('.sk-header').outerHeight();
          $('.offer-slider').css('margin-top', navHeight + 'px');
        }
      }
    }, 0);
  }

  changeBannerHeight(status: boolean) {
    if (status) {
      this.setDiscountBannerHeight();
    }
  }

  onClickCart() {
    if (this.isFromOfferFlow) {
      const cartOneTime = this.utilityService.getOneTimeStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const cartEveryMonth = this.utilityService.getEveryMonthStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const availableOffers = this.offerService.getAvailableOffers(
        this.offers,
        [],
        cartOneTime,
        cartEveryMonth
      );

      this.dataService.setOfferFlowStatus(false);

      if (availableOffers.length > 0) {
        this.dataService.setOfferArray(availableOffers, 0);

        this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });

        setTimeout(() => {
          $('#special-offer').modal('show');
        }, 0);
      } else {
        this.messageEvent.emit('checkout-cart');

        setTimeout(() => {
          $('.drawer').drawer('open');
        }, 0);
      }
    } else {
      this.messageEvent.emit('checkout-cart');

      setTimeout(() => {
        $('.drawer').drawer('open');
      }, 0);
    }
  }

  onClickCountry() {
    this.messageEvent.emit('country-bar');
    $('.drawer').drawer('open');
  }

  // onClickAccountMenu() {
  //   this.messageEvent.emit('account-menu');
  //   setTimeout(() => {
  //     $('.drawer').drawer('open');
  //   }, 0);
  // }

  onClickLogo() {
    this.utilityService.navigateToRoute('/');
  }

  onHoverNavbarShow() {
    this.renderer.addClass(document.body, 'navbar-show');
  }

  onHoverNavbarHide() {
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClicMobileNavItem() {
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickResearchPage() {
    const routeURL = '/research';

    this.utilityService.navigateToRoute(routeURL);

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickLearnPage() {
    const routeURL = '/learn';

    this.utilityService.navigateToRoute(routeURL);

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickAboutPage() {
    const routeURL = '/about';
    this.utilityService.navigateToRoute(routeURL);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickTeamPage() {
    const routeURL = '/team';
    this.utilityService.navigateToRoute(routeURL);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickBlogPage() {
    /*if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog']);
    } else {
      this.router.navigate([this.selectedCountry.toLowerCase() + '/' + 'blog']);
    }*/

    const routeURL = '/blog';
    this.utilityService.navigateToRoute(routeURL);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickSmartshipSavePage() {
    const routeURL = '/smartship/about';
    this.utilityService.navigateToRoute(routeURL);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickVipClub() {
    const routeURL = '/vip';
    this.utilityService.navigateToRoute(routeURL);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickPromoterPage() {
    const routeURL = '/promoter';
    this.utilityService.navigateToRoute(routeURL);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickShopAllPage() {
    let shopAllSlug = '';

    this.categories.forEach((category) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;

    const routeURL = '/category/' + shopAllSlug;

    this.utilityService.navigateToRoute(routeURL);

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  enableLearnMenuItem() {
    if (this.selectedCountry === 'US' || this.selectedCountry === 'CA') {
      return true;
    } else {
      return false;
    }
  }

  enableOtherMenuItem(menuItem?: string) {
    if (
      this.selectedCountry === 'US' ||
      this.selectedCountry === 'CA' ||
      this.selectedCountry === 'AU' ||
      this.selectedCountry === 'NZ' ||
      this.selectedCountry === 'HK' ||
      this.selectedCountry === 'MO' ||
      this.selectedCountry === 'MY' ||
      this.selectedCountry === 'SG' ||
      this.selectedCountry === 'TW' || 
      this.selectedCountry === 'JP' ||
      (
        menuItem === 'shop' && 
        this.isUserLoggedIn && 
        isEuropeanCountry(this.selectedCountry)
      ) || 
      (
        menuItem === 'promoter' && 
        this.isUserLoggedIn && 
        isEuropeanCountry(this.selectedCountry) && 
        (this.selectedCountry !== 'GB' && this.selectedCountry !== 'CH')
      ) ||
      (
        menuItem === 'vip' && 
        this.isUserLoggedIn && 
        isEuropeanCountry(this.selectedCountry)
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  onClickMobileSearch() {
    this.isMobileSearch = true;

    this.renderer.addClass(document.body, 'search-focus');
    this.dataService.changeSearchFocusStatus(true);
  }

  setInputFocusStatus(status: boolean) {
    this.isInputFocused = status;
  }

  onlogin() {
    const viParams = this.getVIParams();
    if (isEuropeanCountry(this.selectedCountry)) {
      this.userService.login(viParams);
    } else {
      if (this.tenant === 'pruvit') {
        window.location.href = environment.clientDomain + '/cloud/dashboard/'+viParams;
        //this.router.navigateByUrl('/cloud/dashboard');
      }
      else if (this.isStaging && this.tenant === 'ladyboss')
        this.router.navigateByUrl('/dashboard');
      else this.redirectToPruvitCloud();
    }
  }

  getVIParams() {
    const VIUser = this.userService.validateVIUserSession();
    if (VIUser !== null) {
      if (
        VIUser.hasOwnProperty('viProductId') &&
        VIUser.viProductId !== ''
      ) {
        const viParams = '?userId='+this.referrer.userId+'&firstName='+VIUser.firstName+'&lastName='+VIUser.lastName+'&email='+VIUser.email+'&offererCode='+VIUser.referrer+'&viProductId='+VIUser.viProductId +'&viCode='+VIUser.viCode+'&offerExpiryTime='+VIUser.expiryTime;
        return viParams;
      }
    }
    return '';
  }

  private setVInfo() {
    let params = this.route.snapshot.queryParams;
    const {contactId, offerId, userId, firstName, lastName, email, offererCode, viProductId, viCode, offerExpiryTime, ...restParams } = params;
    //console.log(contactId, offerId, userId, firstName, lastName, email, offererCode, viProductId, viCode, offerExpiryTime);

    if(userId && firstName && lastName && email && offererCode && viProductId && viCode && offerExpiryTime) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: restParams,
      });
      const offerReq = this.apiService.getOffer(userId, viProductId);
      const referrerReq = this.apiService.getReferrer(offererCode);
      const productId = viProductId;
      forkJoin([offerReq, referrerReq]).pipe(takeUntil(this.destroyed$)).subscribe(
        (x: any) => {
          console.log(x);
          const offer = x[0];
          const referrer = x[1];
          if (Object.keys(offer).length) {
            const createdTime = new Date().getTime();
            const { title, bonusValue, minOrderValue } = offer;
            const offerorName = referrer.name;
            const offerorImage = referrer.imageUrl;
            const promptLogin = 'true';
            const VIOffer = {
              title,
              userId,
              contactId,
              offerId,
              offererCode,
              offerorName,
              offerorImage,
              promptLogin,
              createdTime,
              firstName,
              lastName,
              email,
              productId,
              bonusValue,
              minOrderValue
            };
            localStorage.setItem('VIOffer', JSON.stringify(VIOffer));
            localStorage.setItem('showGngModal', 'false');
            this.userService.setVIUser(
              offererCode,
              'true',
              viCode,
              false,
              viProductId,
              firstName,
              lastName,
              email,
              offerExpiryTime,
              '',
              ''
            );
            this.dataService.setViTimer(offerExpiryTime);
            this.userService.login();
          }
        }
      );
    }
  }

  onClickAvatar() {
    this.dataService.changeSidebarName('account');
    $('.drawer').drawer('open');
  }

  redirectToPruvitCloud() {
    window.location.href = this.userRedirectURL;
  }

  onLogout() {
    this.userService.logOut();
  }

  onClickReferrerName() {
    const path = this.isStaging ? '/me?ref=' + this.referrer.code : '/me';
    this.router.navigateByUrl(path);
  }

  @HostListener('window:resize', ['$event'])
  onScreenSize() {
    this.setDiscountBannerHeight();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
