import { Location } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { ProductSettings } from '../../models/product-settings.model';
import { Product } from '../../models/product.model';
import { PromoterService } from '../../services/promoter.service';
import { ProductCardComponent } from '../common/product-card/product-card.component';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-promoter',
  templateUrl: './promoter.component.html',
  styleUrls: ['./promoter.component.css'],
})
export class PromoterComponent implements OnInit, OnDestroy {
  @ViewChildren('child') childComponents!: QueryList<ProductCardComponent>;
  tenant: string = '';
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  refCode = '';
  productsData: any = {};
  promoterProducts: Product[] = [];
  offers: Offer[] = [];
  limitedPromoterStartingPrice = 0;
  limitedPromoterProducts: Product[] = [];
  productSettings = {} as ProductSettings;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private userService: AppUserService,
    private dataService: AppDataService,
    private translate: TranslateService,
    public utilityService: AppUtilityService,
    private router: Router,
    private promoterService: PromoterService,
    private offerService: AppOfferService,
    private appUtilityService: AppUtilityService,
    private store: Store<AppState>,
    private seoService: AppSeoService,
    private meta: Meta
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    //if (this.tenant === 'ladyboss') this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.checkUserAccess();
    this.getCarts();
    this.getUser();
    this.setSeo();
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = height;
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
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  checkUserAccess() {
    const viCode = this.activatedRoute.snapshot.queryParamMap.get('vicode');
    const viProductId =
      this.activatedRoute.snapshot.queryParamMap.get('viProductId');
    const referrer = this.activatedRoute.snapshot.queryParamMap.get('ref');
    const promptLogin =
      this.activatedRoute.snapshot.queryParamMap.get('promptLogin');
    const isWindowReferrer = document.referrer.includes('experienceketo.com');

    const removedParamsUrl = this.router.url.substring(
      0,
      this.router.url.indexOf('?')
    );
    if (
      viCode !== null &&
      viProductId !== null &&
      viCode !== '' &&
      referrer !== null &&
      promptLogin !== null &&
      isWindowReferrer
    ) {
      this.userService.setVIUser(
        referrer,
        promptLogin,
        viCode,
        false,
        viProductId
      );
      this.dataService.setViTimer('');
    }
    if (viCode !== null) {
      this.location.go(removedParamsUrl);
    }
  }

  getCarts() {
    this.subscriptions.push(
      this.store.select('cartList').subscribe(() => {
        this.setUserAccess();
      })
    );
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.setUserAccess();
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

        this.productSettings = data.productSettings;
        this.defaultLanguage = data.productsData.default_lang;
        this.productsData = data.productsData;
        this.offers = data.offers;

        const products = data.products.filter(
          (p) =>
            !p.accessLevels.isCustom.on &&
            (p.categories.length > 0 || p.tags.length > 0)
        );

        this.getPromoters(products);
        this.getLimitedPromoters(products);
        this.getLimitedPromoterStartingPrice();
        $(document).ready(() => {
          tooltipJS();
        });
      })
    );
  }

  getPromoterBenefits(bannerDescription: string) {
    return bannerDescription.includes('<br>')
      ? bannerDescription.split('<br>')
      : bannerDescription.split(',');
  }

  getPromoters(products: Product[]) {
    this.promoterProducts = this.promoterService.getPromoters(products, false);
  }

  getLimitedPromoters(products: Product[]) {
    this.limitedPromoterProducts = this.promoterService.getPromoters(
      products,
      true
    );
  }

  isPromoterMini(promoter: Product) {
    if (promoter) {
      if (promoter.title.includes('mini') || promoter.name.includes('mini')) {
        return true;
      }
    }
    return false;
  }

  getLimitedPromoterStartingPrice() {
    let minPrice = Number.MAX_SAFE_INTEGER;

    this.limitedPromoterProducts.forEach((promoter) => {
      const price = this.getPromoterStartingPrice(promoter);

      minPrice = Math.min(minPrice, price);
    });

    this.limitedPromoterStartingPrice =
      minPrice !== Number.MAX_SAFE_INTEGER ? minPrice : 0;
  }

  getPromoterStartingPrice(promoter: Product) {
    if (promoter) {
      return promoter.finalPrice !== 0
        ? promoter.finalPrice
        : promoter.originalPrice;
    } else {
      return 0;
    }
  }

  getPromoterFee() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;

      return +productsSettings.new_promoter_price;
    } else {
      return 0;
    }
  }

  onClickPromoterDetailPage(product: Product) {
    const routeURL = product.promoterBtnUrl;
    this.utilityService.navigateToRoute(routeURL);
  }

  onClickPromoter(product: Product) {
    const oneTimeVariations = this.promoterService.getVariations(
      product.variations
    );

    if (oneTimeVariations.length === 1) {
      const isInvalidSupplement =
        this.appUtilityService.isIncompatibleCheckout(false);

      if (isInvalidSupplement && this.tenant !== 'ladyboss') {
        this.dataService.changePostName({ postName: 'purchase-modal' });
        $('#PurchaseWarningModal').modal('show');
      } else {
        this.promoterService.onPromoterAddToCart(
          this.selectedCountry,
          this.selectedLanguage,
          product,
          oneTimeVariations[0],
          this.productSettings
        );

        if (this.tenant === 'ladyboss') {
          if (
            product.showRelatedProducts &&
            product.relatedProducts.length > 0
          ) {
            this.dataService.changeSidebarName('add-to-cart');
          } else {
            this.dataService.changeSidebarName('checkout-cart');
          }

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
          if (availableOffers.length > 0) {
            this.dataService.setOfferArray(availableOffers, 0);

            this.dataService.changePostName({
              postName: 'pruvit-modal-utilities',
            });

            setTimeout(() => {
              $('#special-offer').modal('show');
            }, 0);
          } else {
            $('.drawer').drawer('open');
          }
        } else {
          this.dataService.setOfferFlowStatus(true);
          const routeURL = '/smartship';
          this.utilityService.navigateToRoute(routeURL);
        }
      }
    } else {
      const routeURL =
        this.tenant === 'ladyboss'
          ? '/champion/' + product.name
          : '/promoter/' + product.name;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onClickPromoterFee() {
    const isInvalidSupplement =
      this.appUtilityService.isIncompatibleCheckout(false);

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      this.promoterService.onPromoterAddToCart(
        this.selectedCountry,
        this.selectedLanguage,
        null,
        [],
        this.productSettings
      );

      $('.drawer').drawer('open');
    }
  }

  getTooltipPlacement() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      return 'bottom';
    } else {
      return 'right';
    }
  }

  get limitedPromoterMarkets() {
    if (
      this.selectedCountry === 'US' ||
      this.selectedCountry === 'CA' ||
      this.selectedCountry === 'AU' ||
      this.selectedCountry === 'NZ'
    ) {
      return true;
    } else {
      return false;
    }
  }

  get isAsianMarkets() {
    if (
      this.selectedCountry === 'HK' ||
      this.selectedCountry === 'MO' ||
      this.selectedCountry === 'MY' ||
      this.selectedCountry === 'SG' ||
      this.selectedCountry === 'TW' ||
      this.selectedCountry === 'JP'
    ) {
      return true;
    } else {
      return false;
    }
  }

  private setUserAccess() {
    if (this.childComponents) {
      this.childComponents.toArray().forEach((c) => c.manageUserAccess());
    }
  }

  setSeo() {
    this.seoService.updateTitle('Promoter');
    this.meta.updateTag( { property: 'og:title', content: 'Promoter' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
