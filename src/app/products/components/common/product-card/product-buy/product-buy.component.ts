import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ReplaySubject, SubscriptionLike } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductVariation } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { Cart } from 'src/app/shared/models/cart.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppTagManagerService } from 'src/app/shared/services/app-tag-manager.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-product-buy',
  templateUrl: './product-buy.component.html',
  styleUrls: ['./product-buy.component.css'],
})
export class ProductBuyComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant: string = '';
  referrer: any = {};
  user: any;
  @Input() product = {} as Product;
  @Input() isPromoter = false;
  selectedLanguage = '';
  selectedCountry = '';
  offers: Offer[] = [];
  oneTimeCart: Cart[] = [];
  everyMonthCart: Cart[] = [];
  productSettings = {} as ProductSettings;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private promoterService: PromoterService,
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private store: Store<AppState>,
    private tagManager: AppTagManagerService
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getUser();
    this.getProducts();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getReferrer();
    this.getCartsForCartTotal();
  }

  getUser() {
    this.subscriptions.push(
      this.dataService.currentUserWithScopes$.subscribe((user) => {
        if (user !== null) {
          this.user = user;
        }
      })
    );
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      });
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
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
        this.offers = data.offers;
        this.productSettings = data.productSettings;
      })
    );
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

  onClickPromoter(product: Product) {
    const oneTimeVariations = this.promoterService.getVariations(
      product.variations
    );

    if (oneTimeVariations.length === 1) {
      const isInvalidSupplement =
        this.utilityService.isIncompatibleCheckout(false);

      if (isInvalidSupplement && this.tenant !== 'ladyboss') {
        this.dataService.changePostName({
          postName: 'purchase-modal',
        });

        $('#PurchaseWarningModal').modal('show');
      } else {
        this.promoterService.onPromoterAddToCart(
          this.selectedCountry,
          this.selectedLanguage,
          product,
          oneTimeVariations[0],
          this.productSettings
        );

        this.dataService.setOfferFlowStatus(true);
        if (this.tenant === 'ladyboss') {
          if (
            product.showRelatedProducts &&
            product.relatedProducts.length > 0
          ) {
            this.dataService.changeSidebarName('add-to-cart');
          } else {
            this.dataService.changeSidebarName('checkout-cart');
          }
          $('.drawer').drawer('open');
        } else {
          const routeURL = '/smartship';
          this.utilityService.navigateToRoute(routeURL);
        }
      }
    } else {
      const routeURL = '/promoter/' + product.name;

      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onWaitlistAdd() {
    if (this.referrer.hasOwnProperty('code') && this.referrer.code !== '') {
      this.dataService.changePostName({
        postName: 'waitlist-modal',
        payload: { key: 'product', value: this.product },
      });
      $('#waitlistModal').modal('show');
    } else {
      const referrerLoginModal = [];
      referrerLoginModal.push({
        modalName: 'referrerCode',
        product: this.product,
      });

      this.dataService.changeCartOrCheckoutModal('waitList');
      this.dataService.changePostName({
        postName: 'referrer-modal',
        payload: { key: 'modals', value: referrerLoginModal },
      });
    }
  }

  /* cart total discount */
  getCartsForCartTotal() {
    this.subscriptions.push(
      this.store.select('cartList').subscribe((res) => {
        this.oneTimeCart = res.oneTime;
        this.everyMonthCart = res.everyMonth;
      })
    );
  }

  isSingleVariation(product: Product) {
    const { ordertype_1, ordertype_3 } =
      this.promoterService.getOnetimeAndEveryMonthVariations(
        product.variations
      );
    if (ordertype_1.length === 1 && !ordertype_3.length) {
      return true;
    } else {
      return false;
    }
  }

  /*onClickAddToCart(product: Product) {
    const {ordertype_1, ordertype_3} = this.promoterService.getOnetimeAndEveryMonthVariations(product.variations);
    const cartData = this.generateCartObj(ordertype_1[0], product, 1);
    this.utilityService.setCarts(
      [cartData],
      this.selectedCountry,
      this.selectedLanguage
    );

    if (
      this.product.showRelatedProducts &&
      this.product.relatedProducts.length > 0
    ) {
      this.dataService.changeSidebarName('add-to-cart');
    } else {
      this.dataService.changeSidebarName('checkout-cart');
    }

    $('.drawer').drawer('open');
  }*/

  onClickAddToCart(product: Product) {
    const isInvalidSupplement =
      this.utilityService.isIncompatibleCheckout(false);

    const { ordertype_1, ordertype_3 } =
      this.promoterService.getOnetimeAndEveryMonthVariations(
        product.variations
      );
    const productVariation = ordertype_1[0];
    const cartDataWithLanguages: Cart[] = this.generateCartWithLanguages(
      productVariation,
      product
    );

    if (isInvalidSupplement && this.tenant !== 'ladyboss') {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      localStorage.setItem('DirectCheckout', JSON.stringify(false));
      this.dataService.setIsFromSmartshipStatus(false);

      const isProductHasSmartshipDiscount: boolean =
        productVariation.smartshipDiscountPrice !== 0 ? true : false;

      if (
        this.product.isForPromoter &&
        this.productSettings.isPromoterEnabled &&
        this.productSettings.promoterSku
      ) {
        cartDataWithLanguages.forEach((cartData) => {
          cartData.isPromoter = true;
        });
        if (this.tenant === 'ladyboss' && product.promoterSku !== '') {
          const promoterFee: Cart =
            this.promoterService.getPromoterFeeCartLadyboss(
              this.selectedCountry,
              this.selectedLanguage,
              this.productSettings,
              product.promoterSku
            );
          cartDataWithLanguages.push(promoterFee);
        }
        if (this.tenant !== 'ladyboss') {
          const promoterFee: Cart = this.promoterService.getPromoterFeeCart(
            this.selectedCountry,
            this.selectedLanguage,
            this.productSettings
          );
          cartDataWithLanguages.push(promoterFee);
        }
      }

      const isUserCanAccess = this.userService.checkUserAccess(
        productVariation.accessLevels,
        productVariation.customUsers
      );

      const isSmartshipUserCanAccess =
        this.userService.checkSmartshipUserAccess(
          isProductHasSmartshipDiscount
        );

      if (
        this.tenant !== 'ladyboss' &&
        (this.product.isForPromoter || isProductHasSmartshipDiscount) &&
        !(
          this.everyMonthCart.length > 0 ||
          (this.user !== null && this.user?.food_autoship) ||
          (this.user !== null && this.user?.keto_autoship) ||
          isSmartshipUserCanAccess
        ) &&
        productVariation.orderType === 'ordertype_1' &&
        isUserCanAccess
      ) {
        this.dataService.setPromoterCartData(cartDataWithLanguages);
        this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });

        setTimeout(() => {
          $('#joinAsPromoterModal').modal('show');
        }, 0);
      } else {
        this.utilityService.setCarts(
          cartDataWithLanguages,
          this.selectedCountry,
          this.selectedLanguage
        );

        if (
          this.product.showRelatedProducts &&
          this.product.relatedProducts.length > 0
        ) {
          this.dataService.changeSidebarName('add-to-cart');
        } else {
          this.dataService.changeSidebarName('checkout-cart');
        }

        const cartOneTime = this.utilityService.getCartIfAdded(
          cartDataWithLanguages
        ).oneTime;
        const cartEveryMonth = this.utilityService.getCartIfAdded(
          cartDataWithLanguages
        ).everyMonth;

        const availableOffers = this.offerService.getAvailableOffers(
          this.offers,
          cartDataWithLanguages,
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
      }
    }
  }

  /* --------- add to cart section ------------- */
  private generateCartWithLanguages(
    productVar: ProductVariation,
    product: Product
  ) {
    const cartDataWithLanguages: Cart[] = [];

    const isUserCanAccess = this.userService.checkUserAccess(
      productVar.accessLevels,
      productVar.customUsers
    );

    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: productVar.orderType,
      isCurrent: true,
      isPromoter: false,
      hasUserRestriction: this.userService.isProductForUSersOnly(
        this.product.accessLevels
      ),
      cart: {
        productID: this.product.id,
        productName: this.product.title,
        productImageUrl: productVar.variationImage ? productVar.variationImage : this.product.thumbUrl,
        servingsName: productVar.attribute1
          ? this.getAttributeName(productVar.attribute1, product)
          : '',
        caffeineState: productVar.attribute2
          ? this.getAttributeName(productVar.attribute2, product)
          : '',
        totalQuantity: productVar.maxQuantity,
        quantity: 1,
        price: productVar.priceObj,
        discountPrice: productVar.discountPrice,
        productSku: productVar.skuObj,
        discountPercent: productVar.discountPercent,
        smartshipDiscountPrice: productVar.smartshipDiscountPrice,
        smartshipDiscountPercent: productVar.smartshipDiscountPercent,
        isUserCanAccess: isUserCanAccess,
        discountType: this.offerService.getOfferTypeForProduct(
          this.offers,
          productVar.skuObj,
          productVar.orderType
        ),
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: productVar.smartshipDiscountPrice !== 0,
      },
      finalPrice: 0,
    });

    return cartDataWithLanguages;
  }

  // get attr name for a product
  private getAttributeName(attr: string, product: Product) {
    let servingName = '';
    product.servings.forEach((serving) => {
      serving.servingAttributes.forEach((attribute) => {
        if (attribute.key === attr) {
          servingName = attribute.name;
        }
      });
    });
    return servingName;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
