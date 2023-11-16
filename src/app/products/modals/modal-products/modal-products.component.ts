import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import {
  ProductServing,
  ProductServingAttribute,
} from 'src/app/products/models/product-serving.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductVariation, ProductVariationBase } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { CartTotal } from 'src/app/shared/models/cart-total.model';
import { Cart } from 'src/app/shared/models/cart.model';
import { AppCartTotalService } from 'src/app/shared/services/app-cart-total.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppTagManagerService } from 'src/app/shared/services/app-tag-manager.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { getMaxRegularDiscount } from 'src/app/shared/utils/discount';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { Offer } from '../../../shared/models/offer.model';
import { PromoterService } from '../../services/promoter.service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-modal-products',
  templateUrl: './modal-products.component.html',
  styleUrls: ['./modal-products.component.css'],
})
export class ModalProductsComponent implements OnInit, OnDestroy {
  @Input() postName!: string;
  language = '';
  country = '';
  user: any;
  tenant!: string;
  products = [] as Product[];
  product = {} as Product;
  servings: ProductServing[] = [];
  orderTypes: ProductVariationBase['orderType'][] = [];

  selectedAttribute1 = {} as ProductServingAttribute;
  selectedAttribute2 = {} as ProductServingAttribute;
  selectedOrdertype = '' as ProductVariationBase['orderType'];
  productVariation = {} as ProductVariation;
  productQuantity = 1;

  isSmartshipPage = false;
  isTodaysOrderChecked = false;

  productsData: any = {};
  productSettings = {} as ProductSettings;
  oneTimeCart: Cart[] = [];
  everyMonthCart: Cart[] = [];
  cartTotalOneTime: CartTotal[] = [];
  lowestCartTotalOneTime: CartTotal | null = null;

  offers: Offer[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService,
    private translate: TranslateService,
    private cartTotalService: AppCartTotalService,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private promoterService: PromoterService,
    private store: Store<AppState>,
    private tagManager: AppTagManagerService
  ) {
    this.tenant = environment.tenant;
    this.getUser();
  }

  ngOnInit(): void {
    this.checkIsSmartshipPageStatus();
    this.getCountry();
    this.getLanguage();
    this.getProducts();
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  /* --------- product section ------------- */
  getLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.language = language;
        }
      )
    );
  }

  getCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.country = country;
      })
    );
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

  checkIsSmartshipPageStatus() {
    this.subscriptions.push(
      this.dataService.currentIsFromSmartship$.subscribe((status: boolean) => {
        this.isSmartshipPage = status;
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

        this.productsData = data.productsData;
        this.products = data.products;
        this.productSettings = data.productSettings;
        this.offers = data.offers;

        this.getProduct();
      })
    );
  }

  getProduct() {
    this.products.forEach((product) => {
      if (product.name === this.postName) {
        this.product = product;
        this.orderTypes = [];
        this.servings = [];
        this.selectedAttribute1 = {} as ProductServingAttribute;
        this.selectedAttribute2 = {} as ProductServingAttribute;
        this.selectedOrdertype = '' as ProductVariationBase['orderType'];
        this.productQuantity = 1;
        this.productVariation = {} as ProductVariation;

        this.isTodaysOrderChecked = false;
        this.cartTotalOneTime = [];
        this.oneTimeCart = [];
        this.everyMonthCart = [];
        this.subscriptions = [];

        this.getServings();
        this.makeAttribute1OutOfStock();
        this.selectAttribute1();

        this.makeAttribute2OutOfStockOrAvailable();
        this.selectAttribute2();

        this.getOrderTypes();
        this.getUpdatedOrderTypes();
        this.selectOrderType();

        this.getProductVariation();
        this.getProductPrices();

        this.loadTooltip();

        this.getCartsForCartTotal();
      }
    });
  }

  /* cart total discount */
  getCartsForCartTotal() {
    this.subscriptions.push(
      this.store.select('cartList').subscribe((res) => {
        this.oneTimeCart = res.oneTime;
        this.everyMonthCart = res.everyMonth;

        this.getCartTotalBanners();
        this.removeDisqualifiedFromCartTotal();

        this.getProductPrices();
      })
    );
  }

  getCartTotalBanners() {
    this.cartTotalOneTime = [];

    if (this.productsData) {
      const cartTotalDiscount = this.productsData.cart_total_discount;

      const cartTotalDiscountOneTime: any[] = cartTotalDiscount?.onetime;

      const maxRegularDiscount = getMaxRegularDiscount(
        this.productVariation.discountPrice,
        this.productVariation.smartshipDiscountPrice
      );
      let lowestPrice = Number.MAX_SAFE_INTEGER;

      if (cartTotalDiscountOneTime) {
        cartTotalDiscountOneTime.forEach((discount: any, index: number) => {
          const cartTObj = this.cartTotalService.getCartTotalObject(
            true,
            discount,
            this.oneTimeCart,
            this.everyMonthCart,
            this.productSettings,
            this.productVariation.hasOwnProperty('skuObj')
              ? this.productVariation.skuObj.oneTime
              : '',
            this.productVariation.hasOwnProperty('priceObj')
              ? this.productVariation.priceObj.oneTime
              : 0,
            maxRegularDiscount
          );
          if (cartTObj.priceAfterDiscount < lowestPrice) {
            lowestPrice = cartTObj.priceAfterDiscount;
            let onetimeObj = { ...cartTObj };
            this.lowestCartTotalOneTime =
              this.cartTotalService.updateShowItemStatusForCartTotal(
                onetimeObj,
                maxRegularDiscount
              );
          }
          this.cartTotalOneTime[index] = cartTObj;
        });
      }
    }
  }

  removeDisqualifiedFromCartTotal() {
    this.cartTotalOneTime =
      this.cartTotalService.removeDisqualifiedFromCartTotalOneTime(
        this.cartTotalOneTime,
        true
      );
  }

  /* ------------- Servings section -------------- */
  getServings() {
    this.servings = this.product.servings.map(
      (serving: ProductServing, index: number) => {
        const availabelAttributes = serving.servingAttributes.filter((item) =>
          this.isAttributesAvailable(this.product, item.key, index)
        );
        serving.servingAttributes = availabelAttributes;

        return serving;
      }
    );
  }

  private isAttributesAvailable(
    product: Product,
    attributeKey: string,
    index: number
  ): boolean {
    let isAvailabelAttribute = false;

    if (index === 0) {
      product.availableAttribute1s.find((item) => {
        if (item === attributeKey) {
          isAvailabelAttribute = true;
        }
      });
    } else {
      product.availableAttribute2s.find((item) => {
        if (item === attributeKey) {
          isAvailabelAttribute = true;
        }
      });
    }

    return isAvailabelAttribute;
  }

  selectAttribute1() {
    if (this.product.defaultAttribute1 !== '') {
      this.servings[0].servingAttributes.forEach((attribute) => {
        if (
          !attribute.isOutOfStock &&
          this.product.defaultAttribute1 === attribute.key
        ) {
          this.selectedAttribute1 = attribute;
        }
      });
    } else {
      const notOutOfStockAttribute1 = this.servings[0].servingAttributes.find(
        (attribute) => !attribute.isOutOfStock
      );

      if (notOutOfStockAttribute1) {
        this.selectedAttribute1 = notOutOfStockAttribute1;
      }
    }
  }

  makeAttribute1OutOfStock() {
    if(this.servings.length > 1) {
      this.servings = this.servings.map(
        (serving: ProductServing, index: number) => {
          serving.servingAttributes.map((item) => {
            if (index === 0) {
              item.isOutOfStock = this.checkAllAttr1OutOfStock(item.key);
            }
            return item;
          });

          return serving;
        }
      );
    }
  }

  private checkAllAttr1OutOfStock(attributeItem1: string) {
    const isAllNotOutOfStock = this.product.variations.every((variation) => {
      if (this.isSmartshipPage) {
        return (
          variation.attribute1 === attributeItem1 &&
          variation.orderType === 'ordertype_2' &&
          variation.isOutOfStock
        );
      } else {
        return (
          variation.attribute1 === attributeItem1 &&
          (variation.orderType === 'ordertype_1' ||
            variation.orderType === 'ordertype_3') &&
          variation.isOutOfStock
        );
      }
    });
    return isAllNotOutOfStock;
  }

  makeAttribute2OutOfStockOrAvailable() {
    this.servings = this.servings.map(
      (serving: ProductServing, index: number) => {
        serving.servingAttributes.map((item) => {
          if (index === 1) {
            item.isOutOfStock = this.checkAttr2OutOfStockForSelection(item.key);
            item.isAvailable = this.checkAttr2AvailableForSelection(item.key);
          }
          return item;
        });

        return serving;
      }
    );
  }

  private checkAttr2OutOfStockForSelection(attributeItem2: string) {
    let isAttr2OutOfStock = false;

    this.product.variations.forEach((variation) => {
      if (this.isSmartshipPage) {
        if (
          variation.attribute1 === this.selectedAttribute1.key &&
          variation.attribute2 === attributeItem2 &&
          variation.orderType === 'ordertype_2' &&
          variation.isOutOfStock
        ) {
          isAttr2OutOfStock = true;
        }
      } else {
        if (
          variation.attribute1 === this.selectedAttribute1.key &&
          variation.attribute2 === attributeItem2 &&
          variation.orderType === 'ordertype_1' &&
          variation.isOutOfStock
        ) {
          isAttr2OutOfStock = true;
        }
      }
    });
    return isAttr2OutOfStock;
  }

  private checkAttr2AvailableForSelection(attributeItem2: string) {
    let isAttr2Available = false;

    this.product.variations.forEach((variation) => {
      if (
        variation.attribute1 === this.selectedAttribute1.key &&
        variation.attribute2 === attributeItem2 &&
        variation.orderType === 'ordertype_1'
      ) {
        isAttr2Available = true;
      }
    });
    return isAttr2Available;
  }

  selectAttribute2() {
    if (this.servings.length > 1) {
      if (this.product.defaultAttribute2 !== '') {
        this.servings[1].servingAttributes.forEach((attribute) => {
          if (
            !this.checkAttr2OutOfStockForSelection(attribute.key) &&
            this.checkAttr2AvailableForSelection(attribute.key)
          ) {
            if (attribute.key === this.product.defaultAttribute2) {
              this.selectedAttribute2 = attribute;
            }
          }
        });
      } else {
        const notOutOfStockAttribute2 = this.servings[1].servingAttributes.find(
          (attribute) =>
            !this.checkAttr2OutOfStockForSelection(attribute.key) &&
            this.checkAttr2AvailableForSelection(attribute.key)
        );

        if (notOutOfStockAttribute2) {
          this.selectedAttribute2 = notOutOfStockAttribute2;
        }
      }
    }
  }

  onServingsSelect(attribute: ProductServingAttribute, servingIndex: number) {
    if (servingIndex === 0) {
      this.selectedAttribute1 = attribute;
    }
    if (servingIndex === 1) {
      this.selectedAttribute2 = attribute;
    }

    this.makeAttribute2OutOfStockOrAvailable();

    this.getOrderTypes();
    this.getUpdatedOrderTypes();
    this.selectOrderType();

    this.getProductVariation();

    this.getCartTotalBanners();
    this.removeDisqualifiedFromCartTotal();

    this.getProductPrices();
  }

  /* ---------------- OrderTypes section ---------------- */
  getOrderTypes() {
    this.orderTypes = this.product.availableOrderType.filter(
      (orderType) => orderType !== 'ordertype_2'
    );
  }

  getUpdatedOrderTypes() {
    let orderTypesForSelection = new Set<string>();

    this.product.variations.forEach((variation) => {
      if (variation.attribute1 === this.selectedAttribute1.key) {
        if (
          !(
            this.selectedAttribute2 &&
            Object.keys(this.selectedAttribute2).length === 0 &&
            this.selectedAttribute2.constructor === Object
          )
        ) {
          if (variation.attribute2 === this.selectedAttribute2.key) {
            orderTypesForSelection.add(variation.orderType);
          }
        } else {
          orderTypesForSelection.add(variation.orderType);
        }
      }
    });

    if (!orderTypesForSelection.has('ordertype_3')) {
      this.orderTypes = this.orderTypes.filter(
        (orderType) => !(orderType === 'ordertype_3')
      );
    }
  }

  selectOrderType() {
    if (this.orderTypes.length === 1) {
      this.selectedOrdertype = this.orderTypes[0];
    } else {
      if (this.isSmartshipPage) {
        if (this.isTodaysOrderChecked) {
          this.selectedOrdertype = 'ordertype_3';
        } else {
          this.selectedOrdertype = 'ordertype_2';
        }
      } else {
        this.selectedOrdertype = 'ordertype_3';
      }
    }
  }

  onOrderTypeSelect(event: any) {
    this.selectedOrdertype = event.target.value;

    this.getProductVariation();

    this.getCartTotalBanners();
    this.removeDisqualifiedFromCartTotal();

    this.getProductPrices();
  }

  /*--------- product quantity section -------- */
  onClickQuantityPlus() {
    if (this.productQuantity < this.productVariation.maxQuantity) {
      this.productQuantity++;

      this.getProductVariation();
      this.getProductPrices();
    }
  }

  onClickQuantityMinus() {
    if (this.productQuantity > 1) {
      this.productQuantity--;

      this.getProductVariation();
      this.getProductPrices();
    }
  }

  /* -------- product variation and price section ----------- */
  getProductVariation() {
    this.productVariation = {} as ProductVariation;

    this.product.variations.forEach((variation) => {
      if (variation.attribute1 === this.selectedAttribute1.key) {
        if (variation.attribute2 !== '') {
          if (variation.attribute2 === this.selectedAttribute2.key) {
            if (variation.orderType === this.selectedOrdertype) {
              this.productVariation = variation;
            }
          }
        } else {
          if (variation.orderType === this.selectedOrdertype) {
            this.productVariation = variation;
          }
        }
      }
    });
  }

  getProductPrices() {
    if (
      this.productVariation &&
      Object.keys(this.productVariation).length === 0 &&
      this.productVariation.constructor === Object
    )
      return;

    let finalPrice = this.productVariation.priceObj.oneTime;
    let isCartTotalDiscountAvailable = false;

    const oneTimeProductSku = this.productVariation.skuObj.oneTime;
    const oneTimePrice = this.productVariation.priceObj.oneTime;

    const cartDataWithLanguages = this.generateCartWithLanguages();
    const everyMonthCart = this.utilityService.getCartIfAdded(
      cartDataWithLanguages
    ).everyMonth;

    const regularDiscountedPrice = this.utilityService.getBestRegularDiscount(
      this.productVariation.discountPrice,
      this.productVariation.smartshipDiscountPrice,
      everyMonthCart,
      this.productVariation.smartshipDiscountPrice !== 0
    );

    for (let index = 0; index < this.cartTotalOneTime.length; index++) {
      const productPrice =
        this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
          regularDiscountedPrice,
          oneTimePrice,
          oneTimeProductSku,
          this.cartTotalOneTime[index],
          everyMonthCart
        ).price;
      const productStatus =
        this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
          regularDiscountedPrice,
          oneTimePrice,
          oneTimeProductSku,
          this.cartTotalOneTime[index],
          everyMonthCart
        ).status;

      if (productStatus && productPrice < finalPrice) {
        finalPrice = productPrice;
        isCartTotalDiscountAvailable = productStatus;
      }
    }

    if (!isCartTotalDiscountAvailable) {
      this.productVariation.finalPrice =
        regularDiscountedPrice !== 0
          ? regularDiscountedPrice * this.productQuantity
          : finalPrice * this.productQuantity;

      this.productVariation.hasDiscount =
        regularDiscountedPrice !== 0 ? true : false;
    } else {
      this.productVariation.finalPrice = finalPrice * this.productQuantity;

      this.productVariation.hasDiscount =
        finalPrice !== this.productVariation.priceObj.oneTime;
    }

    const isUserCanAccess = this.userService.checkUserAccess(
      this.productVariation.accessLevels,
      this.productVariation.customUsers
    );

    if (!isUserCanAccess) {
      this.productVariation.hasDiscount = false;
      this.productVariation.finalPrice =
        this.productVariation.priceObj.oneTime * this.productQuantity;
    }

    let activeSmartshipExist: boolean = false;
    if (this.user) {
      activeSmartshipExist = this.user?.mvuser_scopes.includes('smartship');
    }

    if(
      (
        this.productVariation.skuObj.oneTime !== 'PRU-700-005' && 
        this.productVariation.skuObj.oneTime !== 'PRU-700-006' &&
        this.productVariation.skuObj.oneTime !== 'PRU-KOOZIE-001-ONCE'
      ) && 
      this.tenant === 'pruvit' &&
      ((this.selectedOrdertype === 'ordertype_3' && this.productSettings.smartshipDiscountOnTodays) ||
      ((this.everyMonthCart.length || activeSmartshipExist) && this.productSettings.smartshipDiscountOnTodays))
    ) {
      let isVipPlusExist: boolean = false;
      if (this.user) {
        isVipPlusExist = this.user?.mvuser_scopes.includes('vipPlus');
      }
      const viDiscount = isVipPlusExist ? 25 : 15;
      const vipDiscountPrice = this.staticSmartshipDiscount(this.productVariation.priceObj.oneTime, viDiscount);
      const vipDiscountFinalPrice = vipDiscountPrice * this.productQuantity;
      finalPrice = this.productVariation.finalPrice * this.productQuantity;
      if(vipDiscountFinalPrice < finalPrice) {
        this.productVariation.finalPrice = vipDiscountFinalPrice;
        this.productVariation.hasDiscount = true;
      }
    }

    if(this.tenant === 'ladyboss' &&
    (this.selectedOrdertype === 'ordertype_3' && this.productSettings.smartshipDiscountOnTodays)
    ){
      this.productVariation.finalPrice = this.productVariation.priceObj.everyMonth * this.productQuantity;
        this.productVariation.hasDiscount = true;
    }
  }

  private staticSmartshipDiscount(regularPrice: number, discountPercent: number) {
    if(regularPrice > 0) {
      const discountAmount = +((regularPrice * discountPercent) / 100).toFixed(2);
      return regularPrice - discountAmount;
    }
    return 0;
  }

  /* --------- add to cart section ------------- */
  private generateCartWithLanguages() {
    const cartDataWithLanguages: Cart[] = [];
    // console.log(this.productVariation)
    // console.log(this.product.accessLevels)
    const isUserCanAccess = this.userService.checkUserAccess(
      this.productVariation.accessLevels,
      this.productVariation.customUsers
    );

    cartDataWithLanguages.push({
      country: this.country.toLowerCase(),
      language: this.language,
      orderType: this.selectedOrdertype,
      isCurrent: true,
      isPromoter: false,
      hasUserRestriction: this.userService.isProductForUSersOnly(
        this.product.accessLevels
      ),
      cart: {
        productID: this.product.id,
        productName: this.product.title,
        productImageUrl: this.productVariation.variationImage ? this.productVariation.variationImage : this.product.thumbUrl,
        servingsName: this.selectedAttribute1.name
          ? this.selectedAttribute1.name
          : '',
        caffeineState: this.selectedAttribute2.name
          ? this.selectedAttribute2.name
          : '',
        totalQuantity: this.productVariation.maxQuantity,
        quantity: this.productQuantity,
        price: this.productVariation.priceObj,
        discountPrice: this.productVariation.discountPrice,
        productSku: this.productVariation.skuObj,
        discountPercent: this.productVariation.discountPercent,
        smartshipDiscountPrice: this.productVariation.smartshipDiscountPrice,
        smartshipDiscountPercent:
          this.productVariation.smartshipDiscountPercent,
        isUserCanAccess: isUserCanAccess,
        discountType: this.offerService.getOfferTypeForProduct(
          this.offers,
          this.productVariation.skuObj,
          this.selectedOrdertype
        ),
        offerDiscountPrice: 0,
        isSmartshipDiscountOn:
          this.productVariation.smartshipDiscountPrice !== 0,
      },
      finalPrice: 0,
    });

    return cartDataWithLanguages;
  }

  private generateSmartshipCartWithLanguages() {
    const cartDataWithLanguages: Cart[] = [];

    cartDataWithLanguages.push({
      country: this.country.toLowerCase(),
      language: this.language,
      orderType: this.selectedOrdertype,
      isCurrent: true,
      isPromoter: false,
      hasUserRestriction: this.userService.isProductForUSersOnly(
        this.product.accessLevels
      ),
      cart: {
        productID: this.product.id,
        productName: this.product.title,
        productImageUrl: this.productVariation.variationImage ? this.productVariation.variationImage : this.product.thumbUrl,
        servingsName: this.selectedAttribute1.name
          ? this.selectedAttribute1.name
          : '',
        caffeineState: this.selectedAttribute2.name
          ? this.selectedAttribute2.name
          : '',
        totalQuantity: this.productVariation.maxQuantity,
        quantity: this.productQuantity,
        price: this.productVariation.priceObj,
        discountPrice: this.isTodaysOrderChecked
          ? this.productVariation.discountPrice
          : 0,
        smartshipDiscountPrice: this.isTodaysOrderChecked
          ? this.productVariation.smartshipDiscountPrice
          : 0,
        discountPercent: this.isTodaysOrderChecked
          ? this.productVariation.discountPercent
          : 0,
        smartshipDiscountPercent: this.isTodaysOrderChecked
          ? this.productVariation.smartshipDiscountPercent
          : 0,
        isUserCanAccess: true,
        productSku: this.isTodaysOrderChecked
          ? this.productVariation.skuObj
          : {
              oneTime: this.productVariation.skuObj.oneTime,
              everyMonth: this.productVariation.skuObj.everyMonth,
            },
        discountType: '',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn:
          this.productVariation.smartshipDiscountPrice !== 0,
      },
      finalPrice: 0,
    });

    return cartDataWithLanguages;
  }

  onClickAddToCart() {
    const isInvalidSupplement =
      this.utilityService.isIncompatibleCheckout(false);

    const cartDataWithLanguages = this.generateCartWithLanguages();
    if(this.tenant === 'pruvit') {
      this.tagManager.addToCartItemEvent(this.product, cartDataWithLanguages[0], this.country);
    }

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      localStorage.setItem('DirectCheckout', JSON.stringify(false));
      this.dataService.setIsFromSmartshipStatus(false);

      const isProductHasSmartshipDiscount: boolean =
        this.productVariation.smartshipDiscountPrice !== 0 ? true : false;

      if (
        this.product.isForPromoter &&
        this.productSettings.isPromoterEnabled &&
        this.productSettings.promoterSku
      ) {
        if (this.tenant === 'ladyboss' && this.product.promoterSku !== '') {
          cartDataWithLanguages.forEach((cartData: any) => {
            cartData.isPromoter = true;
          });
          const promoterFee: Cart = this.promoterService.getPromoterFeeCartLadyboss(
            this.country,
            this.language,
            this.productSettings,
            this.product.promoterSku
          );
          cartDataWithLanguages.push(promoterFee);
        }
        if (this.tenant === 'pruvit' && this.country.toLowerCase() === 'jp') {
          const promoterFee: Cart = this.promoterService.getPromoterFeeCart(
            this.country,
            this.language,
            this.productSettings
          );
          cartDataWithLanguages.push(promoterFee);
        }
      }

      const isUserCanAccess = this.userService.checkUserAccess(
        this.productVariation.accessLevels,
        this.productVariation.customUsers
      );

      const isSmartshipUserCanAccess =
        this.userService.checkSmartshipUserAccess(
          isProductHasSmartshipDiscount
        );

      if (
        this.tenant !== 'ladyboss' &&
        isProductHasSmartshipDiscount &&
        !(
          this.everyMonthCart.length > 0 ||
          (this.user !== null && this.user?.food_autoship) ||
          (this.user !== null && this.user?.keto_autoship) ||
          isSmartshipUserCanAccess
        ) &&
        this.selectedOrdertype === 'ordertype_1' &&
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
          this.country,
          this.language
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

  /*---------smartship  variation section -------- */
  onTodaysOrderSelect(event: any) {
    this.isTodaysOrderChecked = event.target.checked;

    if (this.isTodaysOrderChecked) {
      this.selectedOrdertype = 'ordertype_3';
    } else {
      this.selectedOrdertype = 'ordertype_2';
    }

    this.getProductVariation();

    this.getCartTotalBanners();
    this.removeDisqualifiedFromCartTotal();

    this.getProductPrices();
  }

  onClickAddToSmartship() {
    const isInvalidSupplement =
      this.utilityService.isIncompatibleCheckout(false);

    const cartDataWithLanguages = this.generateSmartshipCartWithLanguages();
    if(this.tenant === 'pruvit') {
      this.tagManager.addToCartItemEvent(this.product, cartDataWithLanguages[0], this.country);
    }

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      localStorage.setItem('DirectCheckout', JSON.stringify(false));
      this.dataService.setIsFromSmartshipStatus(true);

      this.utilityService.setCarts(
        cartDataWithLanguages,
        this.country,
        this.language
      );

      /*if (
        this.product.showRelatedProducts &&
        this.product.relatedProducts.length > 0
      ) {
        this.dataService.changeSidebarName('add-to-cart');
      } else {
        this.dataService.changeSidebarName('checkout-cart');
      }*/
      
      this.dataService.changeSidebarName('checkout-cart');

      const cartOneTime = this.utilityService.getCartIfAdded(cartDataWithLanguages).oneTime;
      const cartEveryMonth = this.utilityService.getCartIfAdded(cartDataWithLanguages).everyMonth;
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
      }else {
        $('.drawer').drawer('open');
      }
    }
  }

  /* ------------ Sold out texts and learn more --------------- */
  getSoldOutText(product: Product) {
    let soldOutText = '';

    if (product.isSoldOut) {
      if (product.sellingClosedText !== '') {
        soldOutText = product.sellingClosedText;
      } else {
        soldOutText = this.translate.instant('currently-sold-out');
      }
    }

    return soldOutText;
  }

  getTranslatedText(orderType: string) {
    let translatedText = '';
    if (orderType === 'ordertype_1') {
      translatedText = this.translate.instant('onetime-purchase');
    }
    if (orderType === 'ordertype_3' || orderType === 'ordertype_2') {
      translatedText = this.translate.instant('subscribe-and-save');
    }
    return translatedText;
  }

  onClickLearnMore() {
    this.dataService.changeSidebarName('delivery-options');
    $('.drawer').drawer('open');
  }

  /* ----------------- navigation ------------------- */
  onClickViewDetails(product: Product) {
    if (product) {
      if(this.tenant === 'pruvit') {
        this.tagManager.viewItemEvent(product, this.country);
      }
      const routeURL = '/product/' + product.name;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onClickShopNow() {
    this.utilityService.navigateToRoute('/smartship');
  }

  get hasOrderTypeOneVariation() {
    return this.product.variations.some(varEl => varEl.orderType === 'ordertype_1');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
