import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { FoodDelivery } from 'src/app/foods/models/food-delivery.model';
import { Food } from 'src/app/foods/models/food.model';
import { SetCheckoutFoodsAction } from 'src/app/foods/store/foods-list.actions';
import { ShareCart } from 'src/app/shared/models';
import { CartTotal } from 'src/app/shared/models/cart-total.model';
import { Cart } from 'src/app/shared/models/cart.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppCartTotalService } from 'src/app/shared/services/app-cart-total.service';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { getMaxRegularDiscount } from 'src/app/shared/utils/discount';
import { DeleteAllPromotersOneTime, DeleteEveryMonth, DeleteOneTime, UpdateEveryMonth, UpdateOneTime } from 'src/app/sidebar/store/cart.actions';
import { AppState } from 'src/app/store/app.reducer';
import { ProductSettings } from '../../models/product-settings.model';
import { ProductVariation, ProductVariationBase } from '../../models/product-variation.model';
import { Product } from '../../models/product.model';
declare var $: any;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, AfterViewInit, OnDestroy {

  discountHeight = 0;
  isCountryAvailable = true;
  oneTimeCart: Cart[] = [];
  everyMonthCart: Cart[] = [];
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  products: Product[] = [];
  sharedMatchProduct: Product[] = [];
  currencySymbol = '$';
  shippingPolicyLink = '';
  sharedCartProductIds: number[] = [];
  sharedProductInfo: ShareCart[] = [];
  sharedBy = '';
  referrer: any = {};
  user: any;

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
  foodDelivery = {} as FoodDelivery;
  shippingDate = '';
  shippingOrder = '';
  foodsCart: Food[] = [];
  foodOfferCart: any[] = [];
  isEditSelections = false;

  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService,
    private translate: TranslateService,
    private appCheckoutService: AppCheckoutService,
    private cartTotalService: AppCartTotalService,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private store: Store<AppState>,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getSharedCartInfo()
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getProducts();
    this.getCurrentCart();
    this.getReferrer();
    this.getCheckoutStatus();
    this.getUser();
  }

  ngAfterViewInit() {
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

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
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

  getReferrer() {
    this.subscriptions.push(
      this.dataService.currentReferrerData$.subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      })
    );
  }

  onClickReferrerName() {
    this.dataService.changePostName({
      postName: 'referrer-modal',
      payload: { key: 'modals', value: [{ modalName: 'independentPruver' }] },
    });
  }

  getUser() {
    this.subscriptions.push(
      this.dataService.currentUserWithScopes$.subscribe((user) => {
        this.user = user;
      })
    );
  }

  // get shared product info from param
  private getSharedCartInfo() {
    this.route.queryParams.subscribe(param=> {
      const {products} = param;
      const splitedProd = products ? products.split(',') : []
      splitedProd.forEach((prod: string, index: number) => {
        let item = prod.split(':')
        let key = parseInt(item[0]);
        let obj: ShareCart = {productId: key, sku: item[1], quantity: parseInt(item[2])}
        if(!this.sharedCartProductIds.includes(key)) {
          this.sharedCartProductIds.push(key)
        }
        this.sharedProductInfo.push(obj)
      });
      // console.log(param, products, this.sharedCartProductIds, this.sharedProductInfo)
    })
    let params = this.route.snapshot.queryParams
    const {products, ...restParams} = params
    this.router.navigate([], {relativeTo: this.route, queryParams: restParams})
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

        this.appCheckoutService.setModals();
        this.dataService.setIsCheckoutStatus(false);
      }
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

      this.everyMonthCart = res.everyMonth;

      this.setEveryMonthCartTotalDiscount();
      this.setEveryMonthPrice();
      this.removeInitialFromSmartshipTiers();

      this.setOneTimeCartTotalDiscount();
      this.setOneTimePriceAndStatus();
      this.removeInitialFromOneTimeTiers();

      this.setCartTotalOfferPreviouslyShownStatus();

      this.removeCartTotalOfferIfNotMet();

      if (
        this.oneTimeCart.length === 0 &&
        this.everyMonthCart.length === 0 &&
        (this.foodsCart.length === 0 ||
          (this.foodsCart.length !== 0 && this.isEditSelections))
      ) {
        this.dataService.changeCartStatus(false);
      } else {
        this.dataService.changeCartStatus(true);
      }

      /*setTimeout(() => {
        $('.drawer').drawer('softRefresh');
      }, 0);*/
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
        this.sharedMatchProduct = this.accessableMatchedProducts(this.sharedCartProductIds);
        this.getCurrencySymbol();
        this.getShippingPolicy();
        if(this.sharedMatchProduct.length) {
          localStorage.removeItem('OneTime');
          localStorage.removeItem('EveryMonth');
          this.sharedProductInfo.forEach(prod => {
            this.setSharedProductToCart(prod.productId, prod.sku, prod.quantity)
          });
        }
      })
    );
  }

  // get matched share products
  private accessableMatchedProducts(prodIds: number[]): Product[] {
    const matchProducts = this.products.filter((prod: any)=> {
      return prodIds.includes(prod.id) && this.userService.checkUserAccess(prod.accessLevels, prod.customUsers)
    })
    return matchProducts
  }

  // set available share products to cart
  private setSharedProductToCart(id: number, sku: string, quantity: number) {
    this.sharedMatchProduct.forEach(product => {
      if(product.id === id) {
        product.variations.forEach(eachVar => {
          if(eachVar.sku === sku) {
            const cartData = this.generateCartObj(eachVar, product, quantity)
            this.utilityService.setCarts(
              [cartData],
              this.selectedCountry,
              this.selectedLanguage
            );
          }
        });
      }
    });
  }

  // generate Cart object of share product
  private generateCartObj(productVar: ProductVariation, product: Product, quantity: number): Cart {
    const cartObj: any = {}
    cartObj.country = this.selectedCountry.toLowerCase()
    cartObj.language = this.selectedLanguage
    cartObj.orderType = productVar.orderType
    cartObj.isCurrent = true
    cartObj.isPromoter = false
    cartObj.hasUserRestriction = this.userService.isProductForUSersOnly(product.accessLevels)
    cartObj.cart = {
      productID: product.id,
      productName: product.title,
      productImageUrl: product.thumbUrl,
      servingsName: productVar.attribute1 ? this.getAttributeName(productVar.attribute1, product) : '',
      caffeineState: productVar.attribute2 ? this.getAttributeName(productVar.attribute2, product) : '',
      totalQuantity: productVar.maxQuantity,
      quantity: quantity,
      price: productVar.priceObj,
      discountPrice: productVar.discountPrice,
      discountPercent: productVar.discountPercent,
      productSku: productVar.skuObj,
      smartshipDiscountPrice: productVar.smartshipDiscountPrice,
      smartshipDiscountPercent: productVar.smartshipDiscountPercent,
      isUserCanAccess: this.userService.checkUserAccess(
                        productVar.accessLevels,
                        productVar.customUsers
                      ),
      discountType: this.offerService.getOfferTypeForProduct(
                        this.offers,
                        productVar.skuObj,
                        productVar.orderType
                      ),
      offerDiscountPrice: 0,
      isSmartshipDiscountOn: productVar.smartshipDiscountPrice !== 0
    }
    cartObj.finalPrice = 0
    return cartObj as Cart
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

      const cartTotalDiscountOneTime: any[] = cartTotalDiscount?.onetime;

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
        });
      }
    }
  }

  setOneTimePriceAndStatus() {
    let tempSumPrice = 0;
    let tempDiscountSumPrice = 0;

    this.oneTimeCart = this.oneTimeCart.map((oneTimeItem) => {
      const tempOneTimeItem = Object.assign({}, oneTimeItem);

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

      tempDiscountSumPrice +=
        tempOneTimeItem.cart.quantity * tempOneTimeItem.finalPrice;
      tempSumPrice +=
        tempOneTimeItem.cart.quantity * tempOneTimeItem.cart.price.oneTime;

      return tempOneTimeItem;
    });

    this.oneTimeCartTotalSumPrice = tempSumPrice;
    this.oneTimeCartTotalDiscountSumPrice = tempDiscountSumPrice;
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

      const cartTotalDiscountSmartship: any[] = cartTotalDiscount?.smartship;

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

    const oneTimeCartOfferItem = oneTimeCart.find(
      (oneTime: any) =>
        this.selectedCountry.toLowerCase() === oneTime.country &&
        oneTime.cart.discountType === 'CART_TOTAL'
    );

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
      this.onClickCartRemove(cart, item);
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

        this.store.dispatch(DeleteAllPromotersOneTime());
      } else {
        this.store.dispatch(DeleteOneTime({ oneTimeCart: item }));
      }

      localStorage.setItem('OneTime', JSON.stringify(newOneTimeCart));

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

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    }

    this.isCartTotalOfferShown = false;
    this.isCartTotalOfferPreviouslyShown = false;

    if (
      this.oneTimeCart.length === 0 &&
      this.everyMonthCart.length === 0 &&
      (this.foodsCart.length === 0 ||
        (this.foodsCart.length !== 0 && this.isEditSelections))
    ) {
      this.dataService.changeCartStatus(false);
    } else {
      this.dataService.changeCartStatus(true);
    }
  }

  onClickCloseCart() {
    $('.drawer').drawer('close');
  }

  onClickFoodCheckout() {
    const LocalMVUser = localStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const validUserSession = this.userService.checkValidUser();

    const isCheckoutAvailable = MVUser?.checkoutCountries.find(
      (countryObj: any) => countryObj.code === this.selectedCountry
    );

    if (validUserSession && !isCheckoutAvailable) {
      this.dataService.changePostName({ postName: 'restrict-checkout-modal' });
      $('#RestrictCheckoutModal').modal('show');
    } else {
      this.appCheckoutService.checkoutFood();
    }
  }

  /*onClickCheckout() {
    this.dataService.setIsCheckoutFromFoodStatus(false);
    if (this.oneTimeCart.length === 0) {
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
        const LocalVIUser = localStorage.getItem('VIUser');
        const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

        if (VIUser !== null) {
          if (VIUser.hasOwnProperty('viProductId') && VIUser.viProductId !== '') {
            // const currentTime = new Date().getTime();
            // const timeDifference = (currentTime - VIUser.createdTime) / 1000;

            // if (timeDifference > 2 * 60 * 60) {
            //   localStorage.removeItem('VIUser');
            // } else {
            //   this.appCheckoutService.setSupplementsCheckoutUrl(
            //     VIUser.referrer,
            //     VIUser.promptLogin,
            //     VIUser.viCode,
            //     VIUser.viProductId,
            //     VIUser.firstName,
            //     VIUser.lastName,
            //     VIUser.email
            //   );
            // }
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
  }*/

  onClickCheckout() {
    this.dataService.setIsCheckoutFromFoodStatus(false);

    if (this.oneTimeCart.length === 0) {
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
          if (VIUser.hasOwnProperty('viProductId') && VIUser.viProductId !== '') {
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

  onClickShareMyCart() {
    this.utilityService.setTinyUrl();
    if (this.referrer.hasOwnProperty('code') && this.referrer.code !== '') {
      const isLocked = this.utilityService.cartHasLockedProduct();
      if(isLocked) {
        this.dataService.changePostName({
          postName: 'restrict-share-cart-modal',
        });
        $('#restrictShareCartModal').modal('show');
      }else {
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

  onClickDeliveryRemove() {
    this.foodOfferCart = [];
    this.foodsCart = [];
    this.store.dispatch(new SetCheckoutFoodsAction([]));

    localStorage.removeItem('FoodDeliveryType');
    localStorage.removeItem('CheckoutFoods');
    localStorage.removeItem('FoodDelivery');
    localStorage.removeItem('CheckoutFoodOffers');

    if (
      this.oneTimeCart.length === 0 &&
      this.everyMonthCart.length === 0 &&
      (this.foodsCart.length === 0 ||
        (this.foodsCart.length !== 0 && this.isEditSelections))
    ) {
      this.dataService.changeCartStatus(false);
    } else {
      this.dataService.changeCartStatus(true);
    }
  }

  viewFoodSelections() {
    this.dataService.changeSidebarName('food-summary');
  }

  isBothPricesSame(everyMonthItem: Cart) {
    const discountPrice = +everyMonthItem.finalPrice;
    const originalPrice =
      everyMonthItem.cart.quantity * everyMonthItem.cart.price.oneTime;

    return discountPrice === originalPrice;
  }

  onClickFoodOfferRemove() {
    this.foodOfferCart = [];

    localStorage.removeItem('CheckoutFoodOffers');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }

}
