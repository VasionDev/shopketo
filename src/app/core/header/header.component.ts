import { Router } from '@angular/router';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Renderer2,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { isEuropeanCountry } from 'src/app/shared/utils/country-list';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<string>();
  @ViewChild('discountBanner') discountBanner!: ElementRef;
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
  clientDomainURL = '';
  returningUrl = '';
  isUserLoggedIn = false;
  impersonationPresent: boolean = false;
  userAvatar = '';
  isInputFocused = false;
  isSearchShowable = true;
  isMobileSearch = false;
  offers: Offer[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private renderer: Renderer2,
    private router: Router,
    private userService: AppUserService,
    private offerService: AppOfferService
  ) {
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
  }

  getImpersonationStatus() {
    this.dataService.impersonationStatus$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((x: boolean)=> {
      this.impersonationPresent = x
    })
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
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isUserLoggedIn = true;

        const userInfo = JSON.parse(user.mvuser_info);
        const imageUrl = userInfo?.collection[0]?.imageUrl;

        this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
      } else {
        this.isUserLoggedIn = false;
      }
    });
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
      this.categories = categories.filter(
        (c) =>
          c.slug !== 'food' &&
          !c.accessLevels.isCustom.on &&
          c.products.length !== 0
      );
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

      this.defaultLanguage = data.productsData.default_lang;

      this.productsData = data.productsData;

      this.offers = data.offers;

      this.setDiscountBannerHeight();
    });
  }

  private setDiscountBannerHeight() {
    setTimeout(() => {
      if (this.discountBanner) {
        this.discountBannerHeight =
          this.discountBanner.nativeElement.offsetHeight;
        this.dataService.changeDiscountHeight(this.discountBannerHeight);
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
  }

  onClickLogo() {
    this.utilityService.navigateToRoute('/');
  }

  onHoverNavbarShow() {
    this.renderer.addClass(document.body, 'navbar-show');
  }

  onHoverNavbarHide() {
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickResearchPage() {
    const routeURL = '/research';

    this.utilityService.navigateToRoute(routeURL);

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickBlogPage() {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog']);
    } else {
      this.router.navigate([this.selectedCountry.toLowerCase() + '/' + 'blog']);
    }

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  onClickSmartshipSavePage() {
    const routeURL = '/smartship/about';
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

  enableOtherMenuItem() {
    if (
      this.selectedCountry === 'US' ||
      this.selectedCountry === 'CA' ||
      this.selectedCountry === 'AU' ||
      this.selectedCountry === 'NZ' ||
      this.selectedCountry === 'HK' ||
      this.selectedCountry === 'MO' ||
      this.selectedCountry === 'MY' ||
      this.selectedCountry === 'SG'
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
    if (isEuropeanCountry(this.selectedCountry)) {
      this.userService.login();
    } else {
      this.redirectToPruvitCloud();
    }
  }

  onClickAvatar() {
    this.messageEvent.emit('dashboard');
  }

  redirectToPruvitCloud() {
    window.location.href = this.userRedirectURL;
  }

  onLogout() {
    this.userService.logOut();
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
