import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { ProductVariationBase } from 'src/app/products/models/product-variation.model';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { Cart } from 'src/app/shared/models/cart.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppCartTotalService } from 'src/app/shared/services/app-cart-total.service';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { getMaxRegularDiscount } from 'src/app/shared/utils/discount';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { CartTotal } from '../../../shared/models/cart-total.model';
import {
  DeleteAllPromotersOneTime,
  DeleteEveryMonth,
  DeleteOneTime,
  UpdateEveryMonth,
  UpdateOneTime,
  setEveryMonth,
} from '../../store/cart.actions';
import { AppTagManagerService } from 'src/app/shared/services/app-tag-manager.service';
import { Product } from 'src/app/products/models/product.model';
declare var $: any;

@Component({
  selector: 'app-checkout-cart',
  templateUrl: './checkout-cart.component.html',
  styleUrls: ['./checkout-cart.component.css'],
})
export class CheckoutCartComponent implements OnInit, AfterViewInit, OnDestroy {
  oneTimeCart: Cart[] = [];
  everyMonthCart: Cart[] = [];
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  products: Product[] = [];
  currencySymbol = '$';
  shippingPolicyLink = '';
  referrer: any = {};
  user: any;
  tenant!: string;
  productSettings = {} as ProductSettings;
  subscriptions: SubscriptionLike[] = [];
  defaultLanguage = '';
  isCartTotalOfferShown = false;
  isCartTotalOfferPreviouslyShown = false;
  oneTimeCartTotalSumPrice = 0;
  oneTimeCartTotalDiscountSumPrice = 0;

  cartTotalOneTime: CartTotal[] = [];
  cartTotalEveryMonth: CartTotal[] = [];
  offers: Offer[] = [];
  categories: ProductTagOrCategory[] = [];

  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService,
    public productUtilityService: ProductsUtilityService,
    private translate: TranslateService,
    private appCheckoutService: AppCheckoutService,
    private cartTotalService: AppCartTotalService,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private router: Router,
    private store: Store<AppState>,
    private tagManager: AppTagManagerService
  ) {
    this.tenant = environment.tenant;
    this.getUser();
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCategories();
    this.getProducts();
    this.getCurrentCart();
    this.getReferrer();
    this.getCheckoutStatus();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  getCheckoutStatus() {
    this.dataService.currentIsCheckout$.subscribe((isCheckout) => {
      if (isCheckout) {
        this.setOneTimeCartTotalDiscount();
        this.setOneTimePriceAndStatus();
        this.removeInitialFromOneTimeTiers();

        this.setEveryMonthCartTotalDiscount();
        this.setEveryMonthPrice();
        this.removeInitialFromSmartshipTiers();

        this.removeCartTotalOfferIfNotMet();
        this.removeSkuBasedOfferIfNotMet();
        if(this.user) {
          if(this.user) {
            let refCode = 
              this.user ? this.user.mvuser_refCode : this.referrer.hasOwnProperty('code') ? this.referrer.code : '';
            this.appCheckoutService.setSupplementsCheckoutUrl(refCode, 'true', '');
          }
        }else {
          this.appCheckoutService.setModals();
        }
        this.dataService.setIsCheckoutStatus(false);
      }
    });
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

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);
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

  getUser() {
    this.subscriptions.push(
      this.dataService.currentUserWithScopes$.subscribe((user) => {
        this.user = user;
      })
    );
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

  getCurrentCart() {
    this.store.select('cartList').subscribe((res) => {
      const promoterFeeItem = res.oneTime.filter(
        (p) => p.cart.productID === -1
      );
      const notPromoterFeeItems = res.oneTime.filter(
        (np) => np.cart.productID !== -1
      );

      this.oneTimeCart = [...promoterFeeItem, ...notPromoterFeeItems];

      this.everyMonthCart = res.everyMonth.filter(
        (p) => p.country.toLowerCase() === this.selectedCountry.toLowerCase()
      );

      this.setEveryMonthCartTotalDiscount();
      this.setEveryMonthPrice();
      this.removeInitialFromSmartshipTiers();

      this.setOneTimeCartTotalDiscount();
      this.setOneTimePriceAndStatus();
      this.removeInitialFromOneTimeTiers();

      this.setCartTotalOfferPreviouslyShownStatus();

      this.removeCartTotalOfferIfNotMet();
      this.removeSkuBasedOfferIfNotMet();

      if (this.oneTimeCart.length === 0 && this.everyMonthCart.length === 0) {
        this.dataService.changeCartStatus(false);
      } else {
        this.dataService.changeCartStatus(true);
      }

      setTimeout(() => {
        $('.drawer').drawer('softRefresh');
      }, 0);
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

        this.productSettings = data.productSettings;
        this.productsData = data.productsData;
        this.products = data.products;
        this.offers = data.offers;
        this.getCurrencySymbol();
        this.getShippingPolicy();
      })
    );
  }

  setCartTotalOfferPreviouslyShownStatus() {
    let isCartTotalOfferFound = false;

    this.offers.forEach((offer) => {
      if (offer.type === 'CART_TOTAL') {
        let cartTotalPrice = this.getCartTotalPrice(offer);

        if (
          cartTotalPrice >= offer.priceOver &&
          cartTotalPrice <= offer.priceUnder
        ) {
          isCartTotalOfferFound = true;
        }
      }
    });

    this.isCartTotalOfferPreviouslyShown = isCartTotalOfferFound;
  }

  setOneTimeCartTotalDiscount() {
    if (this.productsData) {
      const cartTotalDiscount = this.productsData.cart_total_discount;
      if(!cartTotalDiscount.hasOwnProperty('onetime')){
        return;
      }

      const cartTotalDiscountOneTime: any[] = cartTotalDiscount.onetime.map((discount: any) => {
        const accessLevels = this.productUtilityService.getAccessLevels(
          discount.hasOwnProperty('availability_for') ? discount.availability_for : ''
        );
        const customUsers = discount.hasOwnProperty('custom_users_list')
        ? discount.custom_users_list?.map((user: string) => +user[0])
        : [];
        return {...discount, accessLevels, customUsers};
      });

      const maxRegularDiscount =
        this.oneTimeCart.length === 1
          ? getMaxRegularDiscount(
              this.oneTimeCart[0].cart.discountPrice,
              this.oneTimeCart[0].cart.smartshipDiscountPrice
            )
          : 0;

      const cartOneTimeSkuForLength1 =
        this.oneTimeCart.length === 1
          ? this.oneTimeCart[0].cart.productSku.oneTime
          : '';

      const cartOneTimePriceForLength1 =
        this.oneTimeCart.length === 1
          ? this.oneTimeCart[0].cart.price.oneTime
          : 0;

      if (cartTotalDiscountOneTime) {
        cartTotalDiscountOneTime.forEach((discount: any, index: number) => {
          const isUserCanAccess = this.userService.checkUserAccess(
            discount.accessLevels,
            discount.customUsers
          );
          if(isUserCanAccess) {
            this.cartTotalOneTime[index] =
              this.cartTotalService.getCartTotalObject(
                true,
                discount,
                this.oneTimeCart,
                this.everyMonthCart,
                this.productSettings,
                cartOneTimeSkuForLength1,
                cartOneTimePriceForLength1,
                maxRegularDiscount
              );
          }
        });
      }
    }
  }

  setOneTimePriceAndStatus() {
    let tempSumPrice = 0;
    let tempDiscountSumPrice = 0;

    this.oneTimeCart = this.oneTimeCart.map((oneTimeItem) => {
      const tempOneTimeItem = Object.assign({}, oneTimeItem);

      /*let price = 0;
      if (
        this.isEverymonthExist &&
        this.productSettings.smartshipDiscountOnTodays &&
        oneTimeItem.cart.price.everyMonth > 0 && 
        oneTimeItem.cart.productID > 0
      ) {
        price = oneTimeItem.cart.price.everyMonth;
      } else {
        price = oneTimeItem.cart.price.oneTime;
      }*/
      let price = oneTimeItem.cart.price.oneTime;
      let status = false;

      const regularDiscountedPrice = this.utilityService.getBestRegularDiscount(
        oneTimeItem.cart.discountPrice,
        oneTimeItem.cart.smartshipDiscountPrice,
        this.everyMonthCart,
        oneTimeItem.cart.isSmartshipDiscountOn
      );

      for (let index = 0; index < this.cartTotalOneTime.length; index++) {
        const productPrice =
          this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
            regularDiscountedPrice,
            oneTimeItem.cart.price.oneTime,
            oneTimeItem.cart.productSku.oneTime,
            this.cartTotalOneTime[index],
            this.everyMonthCart
          ).price;
        const productStatus =
          this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
            regularDiscountedPrice,
            oneTimeItem.cart.price.oneTime,
            oneTimeItem.cart.productSku.oneTime,
            this.cartTotalOneTime[index],
            this.everyMonthCart
          ).status;

        if (productStatus && productPrice < price) {
          price = productPrice;
          status = productStatus;
        }
      }

      if (!status) {
        price = regularDiscountedPrice !== 0 ? regularDiscountedPrice : price;
        status = regularDiscountedPrice !== 0 ? true : false;
      }

      let finalPriceAndStatus = {} as { price: number; status: boolean };

      if (
        oneTimeItem.cart.discountType === 'SKU_PURCHASE' ||
        oneTimeItem.cart.discountType === 'CART_TOTAL'
      ) {
        finalPriceAndStatus = this.getOfferPriceAndStatus(
          price,
          oneTimeItem.cart.productSku.oneTime,
          oneTimeItem.cart.productID,
          status,
          oneTimeItem.cart.price.oneTime,
          oneTimeItem.cart.discountType,
          oneTimeItem.orderType
        );
      } else {
        finalPriceAndStatus = {
          price: price,
          status: status,
        };
      }

      if (oneTimeItem.cart.isUserCanAccess) {
        tempOneTimeItem.finalPrice = finalPriceAndStatus.price;
        tempOneTimeItem.isDiscountable = finalPriceAndStatus.status;
      } else {
        tempOneTimeItem.finalPrice = oneTimeItem.cart.price.oneTime;
        tempOneTimeItem.isDiscountable = false;
      }

      let activeSmartshipExist: boolean = false;
      if (this.user) {
        activeSmartshipExist = this.user?.mvuser_scopes.includes('smartship');
      }

      if (
        ( 
          tempOneTimeItem.cart.productSku.oneTime !== 'PRU-700-005' && 
          tempOneTimeItem.cart.productSku.oneTime !== 'PRU-700-006' &&
          tempOneTimeItem.cart.productSku.oneTime !== 'PRU-KOOZIE-001-ONCE'
        ) && 
        this.tenant === 'pruvit' &&
        (this.isEverymonthExist || activeSmartshipExist) &&
        this.productSettings.smartshipDiscountOnTodays &&
        oneTimeItem.cart.productID > 0
      ) {
        let isVipPlusExist: boolean = false;
        if (this.user) {
          isVipPlusExist = this.user?.mvuser_scopes.includes('vipPlus');
        }
        const viDiscount = isVipPlusExist ? 25 : 15;
        const vipDiscountPrice = this.staticSmartshipDiscount(oneTimeItem.cart.price.oneTime, viDiscount);
        if(vipDiscountPrice < tempOneTimeItem.finalPrice) {
          tempOneTimeItem.finalPrice = vipDiscountPrice;
          tempOneTimeItem.isDiscountable = true;
        }
      }

      if(
        this.tenant === 'ladyboss' &&
        this.isEverymonthExist &&
        this.productSettings.smartshipDiscountOnTodays &&
        oneTimeItem.cart.productID > 0
      ){
        if(oneTimeItem.cart.price.everyMonth > 0 && oneTimeItem.cart.price.everyMonth <= tempOneTimeItem.finalPrice) {
          tempOneTimeItem.finalPrice = oneTimeItem.cart.price.everyMonth;
          tempOneTimeItem.isDiscountable = true;
        }
      }

      tempDiscountSumPrice +=
        tempOneTimeItem.cart.quantity * tempOneTimeItem.finalPrice;
      tempSumPrice +=
        tempOneTimeItem.cart.quantity * tempOneTimeItem.cart.price.oneTime;

      return tempOneTimeItem;
    });

    this.oneTimeCartTotalSumPrice = tempSumPrice;
    this.oneTimeCartTotalDiscountSumPrice = tempDiscountSumPrice;
  }

  private staticSmartshipDiscount(regularPrice: number, discountPercent: number) {
    if(regularPrice > 0) {
      const discountAmount = +((regularPrice * discountPercent) / 100).toFixed(2);
      return regularPrice - discountAmount;
    }
    return 0;
  }

  removeInitialFromOneTimeTiers() {
    this.cartTotalOneTime =
      this.cartTotalService.removeDisqualifiedFromCartTotalOneTime(
        this.cartTotalOneTime,
        false
      );
  }

  setEveryMonthCartTotalDiscount() {
    if (this.productsData) {
      const cartTotalDiscount = this.productsData.cart_total_discount;
      if(!cartTotalDiscount.hasOwnProperty('smartship')){
        return;
      }

      const cartTotalDiscountSmartship: any[] = cartTotalDiscount.smartship.map((discount: any) => {
        const accessLevels = this.productUtilityService.getAccessLevels(
          discount.hasOwnProperty('availability_for') ? discount.availability_for : ''
        );
        const customUsers = discount.hasOwnProperty('custom_users_list')
        ? discount.custom_users_list?.map((user: string) => +user[0])
        : [];
        return {...discount, accessLevels, customUsers};
      });

      const maxRegularDiscount =
        this.everyMonthCart.length === 1
          ? getMaxRegularDiscount(
              this.everyMonthCart[0].cart.discountPrice,
              this.everyMonthCart[0].cart.smartshipDiscountPrice
            )
          : 0;

      const cartEveryMonthSkuForLength1 =
        this.everyMonthCart.length === 1
          ? this.everyMonthCart[0].cart.productSku.oneTime
          : '';

      const cartEveryMonthPriceForLength1 =
        this.everyMonthCart.length === 1
          ? this.everyMonthCart[0].cart.price.oneTime
          : 0;

      if (cartTotalDiscountSmartship) {
        cartTotalDiscountSmartship.forEach((discount: any, index: number) => {
          const isUserCanAccess = this.userService.checkUserAccess(
            discount.accessLevels,
            discount.customUsers
          );
          if(isUserCanAccess) {
            this.cartTotalEveryMonth[index] =
              this.cartTotalService.getCartTotalObject(
                false,
                discount,
                this.oneTimeCart,
                this.everyMonthCart,
                this.productSettings,
                cartEveryMonthSkuForLength1,
                cartEveryMonthPriceForLength1,
                maxRegularDiscount
              );
          }
        });
      }
    }
  }

  setEveryMonthPrice() {
    this.everyMonthCart = this.everyMonthCart.map((everyMonthItem) => {
      const tempEveryMonth = Object.assign({}, everyMonthItem);

      let productPrice = everyMonthItem.cart.price.everyMonth;

      for (let index = 0; index < this.cartTotalEveryMonth.length; index++) {
        const price = this.getEveryMonthNonOfferPrice(
          everyMonthItem.cart.price.oneTime,
          everyMonthItem.cart.price.everyMonth,
          everyMonthItem.cart.productSku.everyMonth,
          index
        );

        if (price < productPrice) {
          productPrice = price;
        }
      }

      if (
        everyMonthItem.cart.discountType === 'SKU_PURCHASE' ||
        everyMonthItem.cart.discountType === 'CART_TOTAL'
      ) {
        let offerDiscount = 0;
        let currentOffer = {} as Offer;

        let isOfferFound = false;

        this.offers.forEach((offer) => {
          if (
            offer.product.id === everyMonthItem.cart.productID &&
            offer.type === everyMonthItem.cart.discountType
          ) {
            currentOffer = offer;
          }
        });

        if (
          !(
            currentOffer &&
            Object.keys(currentOffer).length === 0 &&
            currentOffer.constructor === Object
          )
        ) {
          const everyMonthSkuFound = currentOffer.discount.everyMonth.find(
            (item) => item.sku === everyMonthItem.cart.productSku.everyMonth
          );

          if (everyMonthSkuFound) {
            offerDiscount = everyMonthSkuFound.amount;
          }

          if (everyMonthItem.cart.discountType === 'CART_TOTAL') {
            isOfferFound = this.isCartTotalOffer(currentOffer);
          }

          if (everyMonthItem.cart.discountType === 'SKU_PURCHASE') {
            isOfferFound = this.offerService.isSkuBaseOfferFound(
              currentOffer,
              this.oneTimeCart,
              this.everyMonthCart,
              'ordertype_2'
            );
          }

          if (isOfferFound) {
            productPrice = productPrice - offerDiscount;
          }
        }
      }
      if (everyMonthItem.cart.isUserCanAccess) {
        tempEveryMonth.finalPrice = everyMonthItem.cart.quantity * productPrice;
      } else {
        tempEveryMonth.finalPrice =
          everyMonthItem.cart.quantity * everyMonthItem.cart.price.everyMonth;
      }

      return tempEveryMonth;
    });
  }

  removeInitialFromSmartshipTiers() {
    this.cartTotalEveryMonth =
      this.cartTotalService.removeDisqualifiedFromEveryMonth(
        this.cartTotalEveryMonth
      );
  }

  getShippingPolicy() {
    if (this.productsData) {
      const generalSettings = this.productsData.general_settings;

      this.shippingPolicyLink = generalSettings.shipping_policy;
    }
  }

  removeCartTotalOfferIfNotMet() {
    const oneTimeCart = this.getLocalStorageCart().oneTime;
    const oneTimeCartOfferItem = this.getOfferItemFromCart(oneTimeCart, 'CART_TOTAL');

    if (oneTimeCartOfferItem) {
      this.offers.forEach((offer) => {
        if (
          offer.type === 'CART_TOTAL' &&
          offer.product.id === oneTimeCartOfferItem.cart.productID
        ) {
          let cartTotalPrice = this.getCartTotalPrice(offer);

          if (cartTotalPrice < offer.priceOver) {
            this.removeCartItem('OneTimeCart', oneTimeCartOfferItem);
          }
        }
      });
    }
  }

  removeSkuBasedOfferIfNotMet() {
    const {oneTime, everyMonth} = this.getLocalStorageCart();
    const oneTimeSkuBasedOfferItem = this.getOfferItemFromCart(oneTime, 'SKU_PURCHASE');
    const everyMonthSkuBasedOfferItem = this.getOfferItemFromCart(everyMonth, 'SKU_PURCHASE');

    if (oneTimeSkuBasedOfferItem) {
      this.offers.forEach((offer) => {
        if (
          offer.type === 'SKU_PURCHASE' &&
          offer.product.id === oneTimeSkuBasedOfferItem.cart.productID
        ) {
          
          const isSkuFound = this.isOfferQualifiedSkusExist(oneTime, everyMonth, offer);
          if (!isSkuFound) {
            this.removeCartItem('OneTimeCart', oneTimeSkuBasedOfferItem);
          }
        }
      });
    }

    if (everyMonthSkuBasedOfferItem) {
      this.offers.forEach((offer) => {
        if (
          offer.type === 'SKU_PURCHASE' &&
          offer.product.id === everyMonthSkuBasedOfferItem.cart.productID
        ) {
          
          const isSkuFound = this.isOfferQualifiedSkusExist(oneTime, everyMonth, offer);
          if (!isSkuFound) {
            this.removeCartItem('EveryMonthCart', everyMonthSkuBasedOfferItem);
          }
        }
      });
    }
  }

  private isOfferQualifiedSkusExist(cartOneTime: Cart[], cartEveryMonth: Cart[], offer: Offer) {
    let skuBasedOfferFound = false;
    cartOneTime.forEach((cartOneTime) => {
      offer.qualifiedSkus.oneTime.forEach((qualifiedOneTime) => {
        if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
          skuBasedOfferFound = true;
        }
      });
    });

    cartEveryMonth.forEach((cartEveryMonth) => {
      offer.qualifiedSkus.everyMonth.forEach((qualifiedSmartship) => {
        if (
          cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
        ) {
          skuBasedOfferFound = true;
        }
      });
    });
    return skuBasedOfferFound;
  }

  private getOfferItemFromCart(list: Cart[], offerType: Offer["type"]) {
    const offerItem = list.find(
      (item: any) =>
        this.selectedCountry.toLowerCase() === item.country &&
        item.cart.discountType === offerType &&
        item.cart.isOfferProduct
    );
    return offerItem;
  }

  getCurrencySymbol() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';
    }
  }

  getLocalStorageCart() {
    const LocalOneTime = localStorage.getItem('OneTime');
    let cartOneTime: any[] = LocalOneTime ? JSON.parse(LocalOneTime) : null;

    const LocalEveryMonth = localStorage.getItem('EveryMonth');
    let cartEveryMonth: any[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : null;

    if (cartOneTime === null) {
      cartOneTime = [];
    }

    if (cartEveryMonth === null) {
      cartEveryMonth = [];
    }
    return { oneTime: cartOneTime, everyMonth: cartEveryMonth };
  }

  private getOfferPriceAndStatus(
    calculatedPrice: number,
    oneTimeSku: string,
    offerProductId: number,
    status: boolean,
    oneTimePrice: number,
    offerType: string,
    orderType: ProductVariationBase['orderType']
  ) {
    let productPrice: number;
    let productStatus: boolean;

    let offerDiscount = 0;
    let currentOffer = {} as Offer;

    let isOfferFound = false;

    this.offers.forEach((offer) => {
      if (offer.product.id === offerProductId && offer.type === offerType) {
        currentOffer = offer;
      }
    });

    if (
      !(
        currentOffer &&
        Object.keys(currentOffer).length === 0 &&
        currentOffer.constructor === Object
      )
    ) {
      const oneTimeSkuFound = currentOffer.discount.oneTime.find(
        (oneTimeItem) => oneTimeItem.sku === oneTimeSku
      );

      if (oneTimeSkuFound) {
        offerDiscount = oneTimeSkuFound.amount;
      }

      if (offerType === 'CART_TOTAL') {
        isOfferFound = this.isCartTotalOffer(currentOffer);
      }

      if (offerType === 'SKU_PURCHASE') {
        isOfferFound = this.offerService.isSkuBaseOfferFound(
          currentOffer,
          this.oneTimeCart,
          this.everyMonthCart,
          orderType
        );
      }
    }

    if (isOfferFound && offerDiscount !== 0) {
      if (!currentOffer.includeRegularDiscount) {
        productPrice = oneTimePrice - offerDiscount;
        productStatus = true;
      } else {
        productPrice = calculatedPrice - offerDiscount;
        productStatus = true;
      }
    } else {
      productPrice = calculatedPrice;
      productStatus = status;
    }

    if (productPrice < oneTimePrice) {
      productStatus = true;
    } else {
      productStatus = false;
    }

    return {
      price: productPrice,
      status: productStatus,
    };
  }

  private isCartTotalOffer(offer: Offer) {
    let cartTotalOffer = false;

    let cartTotalPrice = this.getCartTotalPrice(offer);

    if (cartTotalPrice >= offer.priceOver) {
      cartTotalOffer = true;
    } else {
      cartTotalOffer = false;
    }

    return cartTotalOffer;
  }

  getOfferSkuFoundStatus(offer: Offer) {
    const offeredSkus: string[] = [];
    let offeredSkuFound = false;

    offer.product.variations.forEach((variation) => {
      offeredSkus.push(variation.sku);
    });

    this.oneTimeCart.forEach((cartOneTime) => {
      offeredSkus.forEach((sku) => {
        if (cartOneTime.cart.productSku.oneTime === sku) {
          offeredSkuFound = true;
        }
      });
    });

    this.everyMonthCart.forEach((cartEveryMonth) => {
      offeredSkus.forEach((sku) => {
        if (cartEveryMonth.cart.productSku.everyMonth === sku) {
          offeredSkuFound = true;
        }
      });
    });

    return offeredSkuFound;
  }

  getCartTotalPrice(offer: Offer) {
    let cartTotalPrice = 0;

    const cartTotalOfferSkus: string[] = [];

    this.offers.forEach((offer) => {
      if (offer.type === 'CART_TOTAL') {
        offer.discount.oneTime.forEach((oneTimeOffer) => {
          cartTotalOfferSkus.push(oneTimeOffer.sku);
        });
      }
    });

    this.offers.forEach((offer) => {
      if (offer.type === 'CART_TOTAL') {
        offer.discount.everyMonth.forEach((smartshipOffer) => {
          cartTotalOfferSkus.push(smartshipOffer.sku);
        });
      }
    });

    if (offer.includeRegularDiscount) {
      this.oneTimeCart.forEach((element) => {
        if (!cartTotalOfferSkus.includes(element.cart.productSku.oneTime)) {
          let price = element.cart.price.oneTime;
          let status = false;

          const regularDiscountedPrice =
            this.utilityService.getBestRegularDiscount(
              element.cart.discountPrice,
              element.cart.smartshipDiscountPrice,
              this.everyMonthCart,
              element.cart.isSmartshipDiscountOn
            );

          for (let index = 0; index < this.cartTotalOneTime.length; index++) {
            const productPrice =
              this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
                regularDiscountedPrice,
                element.cart.price.oneTime,
                element.cart.productSku.oneTime,
                this.cartTotalOneTime[index],
                this.everyMonthCart
              ).price;
            const productStatus =
              this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
                regularDiscountedPrice,
                element.cart.price.oneTime,
                element.cart.productSku.oneTime,
                this.cartTotalOneTime[index],
                this.everyMonthCart
              ).status;

            if (productStatus) {
              price = productPrice;
              status = productStatus;
            }
          }

          if (!status) {
            price =
              regularDiscountedPrice !== 0 ? regularDiscountedPrice : price;
          }

          cartTotalPrice += element.cart.quantity * price;
        }
      });
    } else {
      this.oneTimeCart.forEach((element) => {
        if (!cartTotalOfferSkus.includes(element.cart.productSku.oneTime)) {
          cartTotalPrice += element.cart.price.oneTime * element.cart.quantity;
        }
      });
    }

    return cartTotalPrice;
  }

  getEveryMonthNonOfferPrice(
    OneTimePrice: number,
    everyMonthPrice: number,
    sku: string,
    cartTotalIndex: number
  ) {
    let productPrice = 0;

    let cartTotalEveryMonthDiscountedPrice =
      this.getCartTotalEveryMonthDiscountedPrice(
        sku,
        OneTimePrice,
        cartTotalIndex
      );

    if (
      this.cartTotalEveryMonth[cartTotalIndex].isEnabled &&
      this.cartTotalEveryMonth[cartTotalIndex].requiredPriceOrItems <= 0 &&
      cartTotalEveryMonthDiscountedPrice !== 0
    ) {
      productPrice =
        cartTotalEveryMonthDiscountedPrice >= everyMonthPrice
          ? everyMonthPrice
          : cartTotalEveryMonthDiscountedPrice;
    } else {
      productPrice = everyMonthPrice;
    }
    return productPrice;
  }

  getCartTotalEveryMonthDiscountedPrice(
    everyMonthSku: string,
    oneTimePrice: number,
    cartTotalIndex: number
  ) {
    let discountedPrice = 0;

    if (this.cartTotalEveryMonth.length > 0) {
      this.cartTotalEveryMonth[cartTotalIndex]?.discountedSkus.forEach(
        (skuObj) => {
          if (skuObj.sku === everyMonthSku) {
            discountedPrice =
              oneTimePrice - (skuObj.percent / 100) * oneTimePrice;
          }
        }
      );
    }

    return discountedPrice;
  }

  onClickCartPlus(cart: 'OneTimeCart' | 'EveryMonthCart', item: Cart) {
    if (cart === 'OneTimeCart') {
      const oneTimeCart = this.getLocalStorageCart().oneTime;

      oneTimeCart.forEach((oneTime) => {
        if (
          this.selectedCountry.toLowerCase() === oneTime.country &&
          item.cart.productSku.oneTime === oneTime.cart.productSku.oneTime
        ) {
          if (oneTime.cart.quantity < oneTime.cart.totalQuantity) {
            oneTime.cart.quantity = oneTime.cart.quantity + 1;
          }
        }
      });

      const tempOneTimeItem = Object.assign({}, item);
      const tempCart = Object.assign({}, tempOneTimeItem.cart);

      if (tempCart.quantity < tempCart.totalQuantity) {
        tempCart.quantity = tempCart.quantity + 1;
      }

      tempOneTimeItem.cart = tempCart;

      localStorage.setItem('OneTime', JSON.stringify(oneTimeCart));
      this.store.dispatch(UpdateOneTime({ oneTimeCart: tempOneTimeItem }));

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    } else {
      const everyMonthCart = this.getLocalStorageCart().everyMonth;

      everyMonthCart.forEach((everyMonth) => {
        if (
          this.selectedCountry.toLowerCase() === everyMonth.country &&
          item.cart.productSku.everyMonth ===
            everyMonth.cart.productSku.everyMonth
        ) {
          if (everyMonth.cart.quantity < everyMonth.cart.totalQuantity) {
            everyMonth.cart.quantity = everyMonth.cart.quantity + 1;
          }
        }
      });

      const tempEveryMonthItem = Object.assign({}, item);
      const tempCart = Object.assign({}, tempEveryMonthItem.cart);

      if (tempCart.quantity < tempCart.totalQuantity) {
        tempCart.quantity = tempCart.quantity + 1;
      }

      tempEveryMonthItem.cart = tempCart;

      localStorage.setItem('EveryMonth', JSON.stringify(everyMonthCart));
      this.store.dispatch(
        UpdateEveryMonth({ everyMonthCart: tempEveryMonthItem })
      );

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    }

    this.isCartTotalOfferShown = false;
    this.isCartTotalOfferPreviouslyShown = false;
  }

  onClickCartMinus(cart: 'OneTimeCart' | 'EveryMonthCart', item: Cart) {
    if (item.cart.quantity === 1) {
      if(confirm("Are you sure you want to remove this item?")) {
        this.onClickCartRemove(cart, item);
      }
    } else {
      if (cart === 'OneTimeCart') {
        const oneTimeCart = this.getLocalStorageCart().oneTime;

        oneTimeCart.forEach((oneTime) => {
          if (
            this.selectedCountry.toLowerCase() === oneTime.country &&
            item.cart.productSku.oneTime === oneTime.cart.productSku.oneTime
          ) {
            if (oneTime.cart.quantity > 1) {
              oneTime.cart.quantity = oneTime.cart.quantity - 1;
            }
          }
        });

        const tempOneTimeItem = Object.assign({}, item);
        const tempCart = Object.assign({}, tempOneTimeItem.cart);

        if (tempCart.quantity > 1) {
          tempCart.quantity = tempCart.quantity - 1;
        }

        tempOneTimeItem.cart = tempCart;

        localStorage.setItem('OneTime', JSON.stringify(oneTimeCart));
        this.store.dispatch(UpdateOneTime({ oneTimeCart: tempOneTimeItem }));

        const currentTime = new Date().getTime();
        localStorage.setItem('CartTime', JSON.stringify(currentTime));
      } else {
        const everyMonthCart = this.getLocalStorageCart().everyMonth;

        everyMonthCart.forEach((everyMonth) => {
          if (
            this.selectedCountry.toLowerCase() === everyMonth.country &&
            item.cart.productSku.everyMonth ===
              everyMonth.cart.productSku.everyMonth
          ) {
            if (everyMonth.cart.quantity > 1) {
              everyMonth.cart.quantity = everyMonth.cart.quantity - 1;
            }
          }
        });

        const tempEveryMonthItem = Object.assign({}, item);
        const tempCart = Object.assign({}, tempEveryMonthItem.cart);

        if (tempCart.quantity > 1) {
          tempCart.quantity = tempCart.quantity - 1;
        }

        tempEveryMonthItem.cart = tempCart;

        localStorage.setItem('EveryMonth', JSON.stringify(everyMonthCart));
        this.store.dispatch(
          UpdateEveryMonth({ everyMonthCart: tempEveryMonthItem })
        );

        const currentTime = new Date().getTime();
        localStorage.setItem('CartTime', JSON.stringify(currentTime));
      }

      this.isCartTotalOfferShown = false;
      this.isCartTotalOfferPreviouslyShown = false;
    }
  }

  onClickCartRemove(cart: 'OneTimeCart' | 'EveryMonthCart', item: Cart) {
    this.removeCartItem(cart, item);
  }

  removeCartItem(cart: 'OneTimeCart' | 'EveryMonthCart', item: Cart) {
    if (cart === 'OneTimeCart') {
      const oneTimeCart = this.getLocalStorageCart().oneTime;

      let newOneTimeCart = oneTimeCart.filter(
        (oneTime) =>
          !(
            this.selectedCountry.toLowerCase() === oneTime.country &&
            item.cart.productSku.oneTime === oneTime.cart.productSku.oneTime
          )
      );

      if (item.isPromoter && item.cart.productID === -1) {
        newOneTimeCart = newOneTimeCart.filter((item) => !item.isPromoter);
        localStorage.setItem('OneTime', JSON.stringify(newOneTimeCart));
        this.store.dispatch(DeleteAllPromotersOneTime());
      } else {
        localStorage.setItem('OneTime', JSON.stringify(newOneTimeCart));
        this.store.dispatch(DeleteOneTime({ oneTimeCart: item }));
      }
      this.setCartAccessability();
      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    } else {
      const everyMonthCart = this.getLocalStorageCart().everyMonth;

      const newEveryMonthCart = everyMonthCart.filter(
        (everyMonth) =>
          !(
            this.selectedCountry.toLowerCase() === everyMonth.country &&
            item.cart.productSku.everyMonth ===
              everyMonth.cart.productSku.everyMonth
          )
      );

      localStorage.setItem('EveryMonth', JSON.stringify(newEveryMonthCart));
      this.store.dispatch(DeleteEveryMonth({ everyMonthCart: item }));
      this.setCartAccessability();
      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    }

    this.isCartTotalOfferShown = false;
    this.isCartTotalOfferPreviouslyShown = false;

    if (this.oneTimeCart.length === 0 && this.everyMonthCart.length === 0) {
      this.dataService.changeCartStatus(false);
    } else {
      this.dataService.changeCartStatus(true);
    }
  }

  setCartAccessability() {
    const oneTimeCart = this.getLocalStorageCart().oneTime;
    const everyMonthCart = this.getLocalStorageCart().everyMonth;

    const newOneTimeCart = oneTimeCart.filter(oneTime => {
      const isCountryVarified = this.selectedCountry.toLowerCase() === oneTime.country;
      const prod = this.products.find(p=> p.id === oneTime.cart.productID);
      if(isCountryVarified && prod) {
        const isAccess = this.userService.checkUserAccess(prod.accessLevels, prod.customUsers);
        if(!isAccess) {
          this.store.dispatch(DeleteOneTime({ oneTimeCart: oneTime }));
        }
        return isAccess;
      }
      return isCountryVarified;
    });

    const newEveryMonthCart = everyMonthCart.filter(everyMonth => {
      const isCountryVarified = this.selectedCountry.toLowerCase() === everyMonth.country;
      const prod = this.products.find(p=> p.id === everyMonth.cart.productID);
      if(isCountryVarified && prod) {
        const isAccess = this.userService.checkUserAccess(prod.accessLevels, prod.customUsers);
        if(!isAccess) {
          this.store.dispatch(DeleteOneTime({ oneTimeCart: everyMonth }));
        }
        return isAccess;
      }
      return isCountryVarified;
    });

    localStorage.setItem('OneTime', JSON.stringify(newOneTimeCart));
    localStorage.setItem('EveryMonth', JSON.stringify(newEveryMonthCart));
  }

  onClickCloseCart() {
    $('.drawer').drawer('close');
  }

  onClickCheckout() {
    let canCheckout: boolean = true;
    if (this.tenant === 'pruvit') {
      canCheckout = this.appCheckoutService.canCheckoutFromCurrentCountry();
    }
    if (!canCheckout) {
      this.dataService.changePostName({ postName: 'restrict-checkout-modal' });
      $('#RestrictCheckoutModal').modal('show');
    } else {
      if(this.tenant === 'pruvit') {
        this.tagManager.onCheckoutEvent(this.products, this.oneTimeCart, this.everyMonthCart, this.oneTimeCartTotalDiscountSumPrice, this.productSettings);
      }
      let contact = null;
      if (
        this.tenant === 'ladyboss' &&
        (this.router.url.startsWith('/challenge/') || this.router.url.startsWith('/5daycakechallenge/'))
      ) {
        const localContact = sessionStorage.getItem('Contact');
        contact = localContact ? JSON.parse(localContact) : null;
      }

      this.dataService.setIsCheckoutFromFoodStatus(false);
      let showSmartshipWarningModal = false;
      if (this.oneTimeCart.length === 1) {
        this.oneTimeCart.forEach((cartItem) => {
          if (
            cartItem.cart.productSku.oneTime.startsWith('PROMOTER-ENROLL') ||
            cartItem.cart.productSku.oneTime.startsWith('CHAMPION-ENROLL')
          )
            showSmartshipWarningModal = true;
        });
      } else if (this.oneTimeCart.length === 0) {
        showSmartshipWarningModal = true;
      }

      if (showSmartshipWarningModal) {
        this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
        $('#smartshipWarningModal').modal('show');
      } else {
        let isCartTotalOfferSkuFound = false;
        const offerArray: Offer[] = [];

        this.offers.forEach((offer) => {
          const isUserCanAccess = this.userService.checkUserAccess(
            offer.accessLevels,
            offer.customUsers
          );

          if (offer.type === 'CART_TOTAL') {
            let isCartTotalOfferFound = false;
            let cartTotalPrice = this.getCartTotalPrice(offer);
            if (
              cartTotalPrice >= offer.priceOver &&
              cartTotalPrice <= offer.priceUnder
            ) {
              isCartTotalOfferFound = true;
            }
            if (isCartTotalOfferFound && isUserCanAccess) {
              offerArray.push(offer);
              isCartTotalOfferSkuFound = this.getOfferSkuFoundStatus(offer);
            }
          }
        });

        if (
          offerArray.length > 0 &&
          !isCartTotalOfferSkuFound &&
          !this.isCartTotalOfferShown &&
          !this.isCartTotalOfferPreviouslyShown
        ) {
          localStorage.setItem('DirectCheckout', JSON.stringify(true));

          this.isCartTotalOfferShown = true;
          this.dataService.setOfferArray(offerArray, 0);

          this.dataService.changePostName({
            postName: 'pruvit-modal-utilities',
          });

          setTimeout(() => {
            $('#special-offer').modal('show');
          }, 0);
        } else {
          const VIUser = this.userService.validateVIUserSession();
          if (VIUser !== null) {
            if (
              VIUser.hasOwnProperty('viProductId') &&
              VIUser.viProductId !== ''
            ) {
              this.appCheckoutService.setSupplementsCheckoutUrl(
                VIUser.referrer,
                VIUser.promptLogin,
                VIUser.viCode,
                VIUser.viProductId,
                VIUser.firstName,
                VIUser.lastName,
                VIUser.email
              );
            } else {
              this.appCheckoutService.setSupplementsCheckoutUrl(
                VIUser.referrer,
                VIUser.promptLogin,
                VIUser.viCode
              );
            }
          } else if (contact !== null) {
            let refCode = this.user
              ? this.user.mvuser_refCode
              : this.referrer.hasOwnProperty('code')
              ? this.referrer.code
              : contact.referrer;
            this.appCheckoutService.setSupplementsCheckoutUrl(
              refCode,
              'false',
              '',
              '',
              contact.firstName,
              contact.lastName,
              contact.email,
              '',
              '',
              contact.phone
            );
          } else {
            if (!this.user) {
              this.appCheckoutService.setModals();
            } else {
              let refCode = this.user
                ? this.user.mvuser_refCode
                : this.referrer.hasOwnProperty('code')
                ? this.referrer.code
                : '';

              this.appCheckoutService.setSupplementsCheckoutUrl(
                refCode,
                'true',
                ''
              );
            }
          }
        }
      }
    }
  }
  onClickShareMyCart() {
    this.utilityService.setTinyUrl();
    if ((this.referrer.hasOwnProperty('code') && this.referrer.code !== '') || 
      (this.user && this.user.mvuser_refCode !== '')) {
      const isLocked = this.utilityService.cartHasLockedProduct();
      if (isLocked) {
        this.dataService.changePostName({
          postName: 'restrict-share-cart-modal',
        });
        $('#restrictShareCartModal').modal('show');
      } else {
        this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
        $('#shareCartModal').modal('show');
      }
    } else {
      const referrerLoginModal = [];
      referrerLoginModal.push({
        modalName: 'referrerCode',
      });

      this.dataService.changeCartOrCheckoutModal('shareCart');
      this.dataService.changePostName({
        postName: 'referrer-modal',
        payload: { key: 'modals', value: referrerLoginModal },
      });
    }
  }

  onClickShopNow() {
    $('.drawer').drawer('close');

    this.utilityService.navigateToRoute('/smartship');
  }

  isBothPricesSame(everyMonthItem: Cart) {
    const discountPrice = +everyMonthItem.finalPrice;
    const originalPrice =
      everyMonthItem.cart.quantity * everyMonthItem.cart.price.oneTime;

    return discountPrice === originalPrice;
  }

  addSmartshipVariation(item: Cart) {
    if (this.hasSmartshipVariation(item)) {
      this.removeCartItem('EveryMonthCart', item);
    } else {
      const everyMonthCart = this.getLocalStorageCart().everyMonth;
      const cartObj: any = Object.assign({}, item);
      const tempCart = Object.assign({}, cartObj.cart);
      tempCart.quantity = 1;
      cartObj.cart = tempCart;
      cartObj.orderType = 'ordertype_2';
      everyMonthCart.push(cartObj);
      localStorage.setItem('EveryMonth', JSON.stringify(everyMonthCart));
      this.store.dispatch(setEveryMonth({ everyMonthCart: everyMonthCart }));
      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    }
  }

  hasSmartshipVariation(item: Cart) {
    const everyMonthCart = this.getLocalStorageCart().everyMonth;
    const findEveryMonthCart = everyMonthCart.find(
      (everyMonth) =>
        this.selectedCountry.toLowerCase() === everyMonth.country &&
        item.cart.productSku.everyMonth ===
          everyMonth.cart.productSku.everyMonth
    );
    return findEveryMonthCart ? true : false;
  }

  get isEverymonthExist() {
    const everyMonthCart = [...this.everyMonthCart];
    return everyMonthCart.length ? true : false;
  }

  getAttributeList(item: Cart) {
    let servingName: string[] = [];
    if (item.cart.caffeineState !== '') {
      servingName.push(item.cart.caffeineState);
    }
    if (item.cart.servingsName !== '') {
      servingName.push(item.cart.servingsName);
    }
    return servingName.join(', ');
  }

  scrollIntoView(id: string) {
    const scrollToElement = document.getElementById(id);
    if(scrollToElement) {
      scrollToElement.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
    }else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get isVipLoyaltyExist() {
    /*return this.user && 
      (
        this.user.hasOwnProperty('vip_loyalty_status') && 
        this.user.vip_loyalty_status !== ''
      ) ? true : false*/
      return this.user && (this.user?.mvuser_scopes.includes('vip') || this.user?.mvuser_scopes.includes('vipPlus')) ? true : false;
  }

  onClickShopAll() {
    $('.drawer').drawer('close');
    /*let shopAllSlug = 'shop-all';
    if(this.selectedLanguage != '' && this.selectedLanguage.toLowerCase() != 'en') {
      shopAllSlug = shopAllSlug + '-' + this.selectedLanguage.toLowerCase();
    }
    this.utilityService.navigateToRoute('/category/' + shopAllSlug);*/
    let shopAllSlug = '';
    this.categories.forEach((category) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;
    const routeURL = '/category/' + shopAllSlug;
    this.utilityService.navigateToRoute(routeURL);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
