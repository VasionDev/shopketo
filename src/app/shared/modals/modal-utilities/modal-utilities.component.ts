import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { SearchPipe } from 'src/app/shared/pipes/search.pipe';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { Offer } from '../../models/offer.model';
import { Product } from '../../../products/models/product.model';
import {
  ProductServing,
  ProductServingAttribute,
} from '../../../products/models/product-serving.model';
import { ProductVariationBase } from '../../../products/models/product-variation.model';
import { ProductSettings } from '../../../products/models/product-settings.model';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { ProductVariation } from 'src/app/products/models/product-variation.model';
import { Cart } from '../../models/cart.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { AppCheckoutService } from '../../services/app-checkout.service';
import { AppUserService } from '../../services/app-user.service';
declare var $: any;

@Component({
  selector: 'app-modal-utilities',
  templateUrl: './modal-utilities.component.html',
  styleUrls: ['./modal-utilities.component.css'],
  providers: [SearchPipe],
})
export class ModalUtilitiesComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  offers: Offer[] = [];

  promoterCart: Cart[] = [];
  smartshipDiscountPercent = 0;
  smartshipProductName = '';

  servings: ProductServing[] = [];
  selectedAttribute1 = {} as ProductServingAttribute;
  selectedAttribute2 = {} as ProductServingAttribute;
  orderTypes: ProductVariationBase['orderType'][] = [];
  selectedOrdertype = '' as ProductVariationBase['orderType'];
  productVariation = {} as ProductVariationBase;

  isTodaysOrderChecked = false;
  productSettings = {} as ProductSettings;

  offer = {} as Offer;
  offerQuantity = 1;
  offerProduct = {} as Product;
  offerIndex = 0;
  offerArray: Offer[] = [];
  offerDiscountedPrice = 0;

  pruvitTvLink = '';
  isTinyConversionStarted = false;
  bitlyLink = '';
  copyLinkText = '';
  isLinkCopied = false;

  billing = 'annually';
  pulseProProduct = {} as Product;
  pulseProVariation: any[] = [];

  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    public utilityService: AppUtilityService,
    private appUtilityService: AppUtilityService,
    private offerService: AppOfferService,
    private promoterService: PromoterService,
    private appCheckoutService: AppCheckoutService,
    private userService: AppUserService
  ) {
    $(document).on('shown.bs.modal', '#joinAsPromoterModal', () => {
      $('body').addClass('modal-open');
    });

    $(document).on('shown.bs.modal', '#special-offer', () => {
      $('body').addClass('modal-open');
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getPromoterCartData();
    this.getProducts();
    this.getPruvitTvLink();
    this.getTinyUrl();
    this.getOffer();
    this.getPulseProProduct();
  }

  getPulseProProduct() {
    this.subscriptions.push(
      this.dataService.currentPulseProProduct$.subscribe((pulsePro) => {
        if (
          !(
            pulsePro &&
            Object.keys(pulsePro).length === 0 &&
            pulsePro.constructor === Object
          )
        ) {
          this.pulseProProduct = pulsePro;
          this.pulseProVariation = this.getPulseProVariation(
            this.pulseProProduct.variations
          );
        }
      })
    );
  }

  getPulseProVariation(variations: ProductVariation[]) {
    const tempPulsePro: any[] = [];

    variations.forEach((variation) => {
      if (variation.sku.includes('CAM-2912-MXC-01')) {
        Object.entries(variation).forEach((varItem: any[]) => {
          tempPulsePro.push({ key: varItem[0], value: varItem[1] });
        });
      }
    });

    return tempPulsePro;
  }

  getOffer() {
    this.subscriptions.push(
      this.dataService.currentOfferArray$.subscribe(
        (offerRes: { offer: Offer[]; index: number }) => {
          this.offerArray = offerRes.offer;
          this.offerIndex = offerRes.index;

          this.offerArray.forEach((offer, i: number) => {
            if (offerRes.index === i) {
              this.offer = offer;
              this.offerQuantity = 1;
              this.offerProduct = offer.product;
              this.offerDiscountedPrice = 0;

              this.servings = [];
              this.selectedAttribute1 = {} as ProductServingAttribute;
              this.selectedAttribute2 = {} as ProductServingAttribute;
              this.orderTypes = [];
              this.selectedOrdertype = '' as ProductVariationBase['orderType'];
              this.productVariation = {} as ProductVariationBase;

              this.isTodaysOrderChecked = false;

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
            }
          });
        }
      )
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
        this.productSettings = data.productSettings;
        this.offers = data.offers;
      })
    );
  }

  getTinyUrl() {
    this.subscriptions.push(
      this.dataService.currentTinyUrl$.subscribe((tinyUrl) => {
        this.bitlyLink = tinyUrl.url;
        this.isTinyConversionStarted = tinyUrl.isConversionStarted;
        this.copyLinkText = this.translate.instant('copy-link');
      })
    );
  }

  getPruvitTvLink() {
    this.subscriptions.push(
      this.dataService.currentPruvitTvLink$.subscribe((link: string) => {
        if (link !== '') {
          this.pruvitTvLink = link;
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

  getPromoterCartData() {
    this.subscriptions.push(
      this.dataService.currentPromoterCart$.subscribe((promoterCart) => {
        if (promoterCart.length !== 0) {
          const maxDiscountPercent =
            promoterCart[0].cart.smartshipDiscountPercent >
            promoterCart[0].cart.discountPercent
              ? promoterCart[0].cart.smartshipDiscountPercent
              : promoterCart[0].cart.discountPercent;

          this.smartshipDiscountPercent = Math.floor(maxDiscountPercent);
          this.smartshipProductName = promoterCart[0].cart.productName;
        }

        this.promoterCart = promoterCart;
      })
    );
  }

  bitlyLinkCopied(event: any) {
    if (event.isSuccess) {
      this.isLinkCopied = true;
      this.copyLinkText = this.translate.instant('link-copied');

      setTimeout(() => {
        this.isLinkCopied = false;
        this.copyLinkText = this.translate.instant('copy-link');
      }, 3000);
    }
  }

  onClickEmail() {
    window.location.href =
      'mailto:?subject=Share Your Cart&body=This%20is%20your%20cart.%20%0D%0A' +
      this.bitlyLink;
  }

  onClickText() {
    window.location.href =
      'sms:?&body=This%20is%20your%20cart.%20%20' + this.bitlyLink;
  }

  /* ------------- Servings section -------------- */
  getServings() {
    this.servings = this.offerProduct.servings.map(
      (serving: ProductServing, index: number) => {
        const availabelAttributes = serving.servingAttributes.filter((item) =>
          this.isAttributesAvailable(this.offerProduct, item.key, index)
        );

        const tempServing = Object.assign({}, serving);
        tempServing.servingAttributes = availabelAttributes;

        return tempServing;
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
    if (this.offerProduct.defaultAttribute1 !== '') {
      this.servings[0].servingAttributes.forEach((attribute) => {
        if (
          !attribute.isOutOfStock &&
          this.offerProduct.defaultAttribute1 === attribute.key
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
    this.servings = this.servings.map(
      (serving: ProductServing, index: number) => {
        serving.servingAttributes.map((item) => {
          const tempServingAttribute = Object.assign({}, item);

          if (index === 0) {
            tempServingAttribute.isOutOfStock = this.checkAllAttr1OutOfStock(
              item.key
            );
          }
          return tempServingAttribute;
        });

        return serving;
      }
    );
  }

  private checkAllAttr1OutOfStock(attributeItem1: string) {
    const isAllNotOutOfStock = this.offerProduct.variations.every(
      (variation) => {
        if (this.offer.offerAppliedFor === 'SMARTSHIP') {
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
      }
    );
    return isAllNotOutOfStock;
  }

  makeAttribute2OutOfStockOrAvailable() {
    this.servings = this.servings.map(
      (serving: ProductServing, index: number) => {
        serving.servingAttributes.map((item) => {
          const tempServingAttribute = Object.assign({}, item);

          if (index === 1) {
            tempServingAttribute.isOutOfStock =
              this.checkAttr2OutOfStockForSelection(item.key);
            tempServingAttribute.isAvailable =
              this.checkAttr2AvailableForSelection(item.key);
          }

          return tempServingAttribute;
        });

        return serving;
      }
    );
  }

  private checkAttr2OutOfStockForSelection(attributeItem2: string) {
    let isAttr2OutOfStock = false;

    this.offerProduct.variations.forEach((variation) => {
      if (this.offer.offerAppliedFor === 'SMARTSHIP') {
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

    this.offerProduct.variations.forEach((variation) => {
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
      if (this.offerProduct.defaultAttribute2 !== '') {
        this.servings[1].servingAttributes.forEach((attribute) => {
          if (
            !this.checkAttr2OutOfStockForSelection(attribute.key) &&
            this.checkAttr2AvailableForSelection(attribute.key)
          ) {
            if (attribute.key === this.offerProduct.defaultAttribute2) {
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
    this.getProductPrices();
  }

  /* ---------------- OrderTypes section ---------------- */
  getOrderTypes() {
    this.orderTypes = this.offerProduct.availableOrderType.filter(
      (orderType) => orderType !== 'ordertype_2'
    );
  }

  getUpdatedOrderTypes() {
    let orderTypesForSelection = new Set<string>();

    this.offerProduct.variations.forEach((variation) => {
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

    if (this.offer.offerAppliedFor === 'ONE_TIME') {
      this.orderTypes = this.orderTypes.filter(
        (orderType) => orderType === 'ordertype_1'
      );
    }
  }

  selectOrderType() {
    if (this.orderTypes.length === 1) {
      this.selectedOrdertype = this.orderTypes[0];
    } else {
      if (this.offer.offerAppliedFor === 'SMARTSHIP') {
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
    this.getProductPrices();
  }

  /*--------- product quantity section -------- */
  onClickOfferPlus() {
    if (this.offerQuantity < this.productVariation.maxQuantity) {
      this.offerQuantity++;

      this.getProductVariation();
      this.getProductPrices();
    }
  }

  onClickOfferMinus() {
    if (this.offerQuantity > 1) {
      this.offerQuantity--;

      this.getProductVariation();
      this.getProductPrices();
    }
  }

  /* -------- product variation and price section ----------- */
  getProductVariation() {
    this.productVariation = {} as ProductVariationBase;

    this.offerProduct.variations.forEach((variation) => {
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

    let isOfferFound = false;
    let offerDiscount = 0;

    if (
      !(
        this.offer &&
        Object.keys(this.offer).length === 0 &&
        this.offer.constructor === Object
      )
    ) {
      if (this.selectedOrdertype === 'ordertype_1') {
        const oneTimeSkuFound = this.offer.discount.oneTime.find(
          (oneTimeItem) =>
            oneTimeItem.sku === this.productVariation.skuObj.oneTime
        );

        if (oneTimeSkuFound) {
          offerDiscount = oneTimeSkuFound.amount;
        }
      } else {
        const everyMonthSkuFound = this.offer.discount.everyMonth.find(
          (everyMonthItem) =>
            everyMonthItem.sku === this.productVariation.skuObj.everyMonth
        );

        if (everyMonthSkuFound) {
          offerDiscount = everyMonthSkuFound.amount;
        }
      }

      this.offerDiscountedPrice = offerDiscount;

      if (this.offer.type === 'CART_TOTAL') {
        isOfferFound = true;
      }

      const oneTimeCart = this.utilityService.getOneTimeStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const everyMonthCart = this.utilityService.getEveryMonthStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      if (this.offer.type === 'SKU_PURCHASE') {
        isOfferFound = this.offerService.isSkuBaseOfferFound(
          this.offer,
          oneTimeCart,
          everyMonthCart,
          this.selectedOrdertype
        );
      }

      if (this.offer.type === 'FOOD') {
        isOfferFound = true;
      }
    }

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

    const tempProductVariation = Object.assign({}, this.productVariation);

    if (isOfferFound && offerDiscount !== 0) {
      const originalPrice =
        this.selectedOrdertype === 'ordertype_1'
          ? this.productVariation.priceObj.oneTime
          : this.productVariation.priceObj.everyMonth;

      if (this.offer.includeRegularDiscount && regularDiscountedPrice !== 0) {
        tempProductVariation.finalPrice =
          (regularDiscountedPrice - offerDiscount) * this.offerQuantity;
        tempProductVariation.hasDiscount = true;
      } else {
        tempProductVariation.finalPrice =
          (originalPrice - offerDiscount) * this.offerQuantity;
        tempProductVariation.hasDiscount = true;
      }
    } else {
      tempProductVariation.finalPrice =
        regularDiscountedPrice !== 0
          ? regularDiscountedPrice * this.offerQuantity
          : finalPrice * this.offerQuantity;

      tempProductVariation.hasDiscount =
        regularDiscountedPrice !== 0 ||
        finalPrice !== this.productVariation.priceObj.oneTime
          ? true
          : false;
    }

    this.productVariation = tempProductVariation;
  }

  private generateCartWithLanguages() {
    const cartDataWithLanguages: Cart[] = [];

    const isUserCanAccess = this.userService.checkUserAccess(
      this.productVariation.accessLevels,
      this.productVariation.customUsers
    );

    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: this.selectedOrdertype,
      isCurrent: true,
      isPromoter: false,
      cart: {
        productID: this.offerProduct.id,
        productName: this.offerProduct.title,
        productImageUrl: this.offerProduct.thumbUrl,
        servingsName: this.selectedAttribute1.name
          ? this.selectedAttribute1.name
          : '',
        caffeineState: this.selectedAttribute2.name
          ? this.selectedAttribute2.name
          : '',
        totalQuantity: this.productVariation.maxQuantity,
        quantity: this.offerQuantity,
        price: this.productVariation.priceObj,
        discountPrice: this.productVariation.discountPrice,
        productSku: this.productVariation.skuObj,
        discountPercent: this.productVariation.discountPercent,
        smartshipDiscountPrice: this.productVariation.smartshipDiscountPrice,
        smartshipDiscountPercent:
          this.productVariation.smartshipDiscountPercent,
        isUserCanAccess: isUserCanAccess,
        discountType: this.offer.type,
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
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: this.selectedOrdertype,
      isCurrent: true,
      isPromoter: false,
      cart: {
        productID: this.offerProduct.id,
        productName: this.offerProduct.title,
        productImageUrl: this.offerProduct.thumbUrl,
        servingsName: this.selectedAttribute1.name
          ? this.selectedAttribute1.name
          : '',
        caffeineState: this.selectedAttribute2.name
          ? this.selectedAttribute2.name
          : '',
        totalQuantity: this.productVariation.maxQuantity,
        quantity: this.offerQuantity,
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
        productSku: this.isTodaysOrderChecked
          ? this.productVariation.skuObj
          : {
              oneTime: this.productVariation.skuObj.oneTime,
              everyMonth: this.productVariation.skuObj.everyMonth,
            },
        isUserCanAccess: true,
        discountType: '',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn:
          this.productVariation.smartshipDiscountPrice !== 0,
      },
      finalPrice: 0,
    });

    return cartDataWithLanguages;
  }

  onClickSkip() {
    $('#joinAsPromoterModal').modal('hide');

    this.utilityService.setCarts(
      this.promoterCart,
      this.selectedCountry,
      this.selectedLanguage
    );

    this.dataService.changeSidebarName('add-to-cart');

    const cartOneTime = this.utilityService.getCartIfAdded(
      this.promoterCart
    ).oneTime;
    const cartEveryMonth = this.utilityService.getCartIfAdded(
      this.promoterCart
    ).everyMonth;

    const availableOffers = this.offerService.getAvailableOffers(
      this.offers,
      this.promoterCart,
      cartOneTime,
      cartEveryMonth
    );

    if (availableOffers.length > 0) {
      this.dataService.setOfferArray(availableOffers, 0);

      this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });

      setTimeout(() => {
        $('#special-offer').modal('show');
      }, 0);
    } else {
      $('.drawer').drawer('open');
    }
  }

  onClickSubscribe() {
    $('#joinAsPromoterModal').modal('hide');

    this.utilityService.setCarts(
      this.promoterCart,
      this.selectedCountry,
      this.selectedLanguage
    );

    this.dataService.setOfferFlowStatus(true);

    this.dataService.changeSidebarName('add-to-cart');

    this.utilityService.navigateToRoute('/smartship');
  }

  onClickContinueToCheckout() {
    this.dataService.setIsCheckoutStatus(true);
  }

  onTodaysOrderSelect(event: any) {
    this.isTodaysOrderChecked = event.target.checked;

    if (this.isTodaysOrderChecked) {
      this.selectedOrdertype = 'ordertype_3';
    } else {
      this.selectedOrdertype = 'ordertype_2';
    }

    this.getProductVariation();
    this.getProductPrices();
  }

  onAddProductOffer() {
    const cartDataWithLanguages =
      this.offer.offerAppliedFor === 'SMARTSHIP'
        ? this.generateSmartshipCartWithLanguages()
        : this.generateCartWithLanguages();

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    this.dataService.changeSidebarName('add-to-cart');

    const cartOneTime = this.utilityService.getCartIfAdded(
      cartDataWithLanguages
    ).oneTime;
    const cartEveryMonth = this.utilityService.getCartIfAdded(
      cartDataWithLanguages
    ).everyMonth;

    const availableOffers: Offer[] = [];

    this.offers.forEach((offer) => {
      if (offer.type === 'CART_TOTAL') {
        const isUserCanAccess = this.userService.checkUserAccess(
          offer.accessLevels,
          offer.customUsers
        );

        const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
          offer.includeRegularDiscount,
          offer.priceOver,
          offer.priceUnder,
          cartDataWithLanguages
        );

        const isOfferSkuFound = this.offerService.getOfferSkuFoundStatus(
          offer,
          cartOneTime,
          cartEveryMonth
        );

        if (cartTotalOfferFound && !isOfferSkuFound && isUserCanAccess) {
          availableOffers.push(offer);
        }
      }
    });

    if (availableOffers.length > 0) {
      availableOffers.forEach((offer) => {
        const index = this.offerArray.findIndex(
          (existingItem) =>
            existingItem.type === offer.type &&
            offer.type === 'CART_TOTAL' &&
            existingItem.priceOver === offer.priceOver &&
            existingItem.priceUnder === offer.priceUnder
        );

        if (index === -1) {
          this.offerArray.push(offer);
        }
      });
    }

    this.offerIndex = this.offerIndex + 1;

    if (this.offerIndex < this.offerArray.length) {
      this.dataService.setOfferArray(this.offerArray, this.offerIndex);

      this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });

      setTimeout(() => {
        $('#special-offer').modal('show');
      }, 0);
    } else {
      const LocalDirectCheckout = localStorage.getItem('DirectCheckout');
      const isDirectCheckout = LocalDirectCheckout
        ? JSON.parse(LocalDirectCheckout)
        : null;

      if (isDirectCheckout) {
        this.dataService.setIsCheckoutStatus(true);
      }

      this.dataService.changeSidebarName('checkout-cart');
      $('.drawer').drawer('open');
    }
  }

  onAddFoodOffer() {
    let cartDataWithLanguages = this.generateCartWithLanguages();

    cartDataWithLanguages = cartDataWithLanguages.map((cartItem) => {
      if (cartItem.cart.discountType === 'FOOD')
        cartItem.cart.offerDiscountPrice = this.offerDiscountedPrice;

      return cartItem;
    });

    localStorage.setItem(
      'CheckoutFoodOffers',
      JSON.stringify(cartDataWithLanguages)
    );

    const isEditSelections = this.utilityService.getEditSelectionsStatus();

    if (isEditSelections) {
      this.appCheckoutService.checkoutFood();
    } else {
      this.dataService.changePostName({ postName: 'shipping-options-modal' });
      $('#foodShippingOptionsModal').modal('show');
    }
  }

  onClickProductOfferNoThanks() {
    $('body').removeClass('modal-open');

    this.offerIndex = this.offerIndex + 1;

    if (this.offerIndex < this.offerArray.length) {
      this.dataService.setOfferArray(this.offerArray, this.offerIndex);

      this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });

      setTimeout(() => {
        $('#special-offer').modal('show');
      }, 0);
    } else {
      const LocalDirectCheckout = localStorage.getItem('DirectCheckout');
      const isDirectCheckout = LocalDirectCheckout
        ? JSON.parse(LocalDirectCheckout)
        : null;

      if (isDirectCheckout) {
        this.dataService.setIsCheckoutStatus(true);
      } else {
        this.dataService.changeSidebarName('checkout-cart');
        $('.drawer').drawer('open');
      }
    }
  }

  onClickFoodOfferNoThanks() {
    localStorage.removeItem('CheckoutFoodOffers');

    const isEditSelections = this.utilityService.getEditSelectionsStatus();

    if (isEditSelections) {
      this.appCheckoutService.checkoutFood();
    } else {
      this.dataService.changePostName({ postName: 'shipping-options-modal' });
      $('#foodShippingOptionsModal').modal('show');
    }
  }

  onBillingSelect(event: any) {
    this.billing = event.target.value;
  }

  onClickLearnMore() {
    this.dataService.changeSidebarName('delivery-options');
    $('.drawer').drawer('open');
  }

  getPulseProAttributeValue(
    variation: { key: string; value: any }[],
    searchedAttribute: string
  ) {
    let attributeValue: any;

    variation.forEach((attribute) => {
      if (attribute.key === searchedAttribute) {
        attributeValue = attribute.value;
      }
    });

    return attributeValue;
  }

  getPulseProServingName(attr: any, product: Product) {
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

  onPulseProAddToCart() {
    const isInvalidSupplement =
      this.appUtilityService.isIncompatibleCheckout(false);

    const cartDataWithLanguages: Cart[] = [];

    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: 'ordertype_1',
      isCurrent: true,
      isPromoter: false,
      cart: {
        productID: this.pulseProProduct.id,
        productName: this.pulseProProduct.title,
        productImageUrl: this.pulseProProduct.homeThumbUrl,
        servingsName: this.getPulseProServingName(
          this.pulseProVariation[0].value,
          this.pulseProProduct
        ),
        caffeineState: this.getPulseProServingName(
          this.pulseProVariation[1].value,
          this.pulseProProduct
        ),
        totalQuantity: this.getPulseProAttributeValue(
          this.pulseProVariation,
          'maxQuantity'
        ),
        quantity: 1,
        price: this.getPulseProAttributeValue(
          this.pulseProVariation,
          'priceObj'
        ),
        discountPrice: this.getPulseProAttributeValue(
          this.pulseProVariation,
          'discountPrice'
        ),
        productSku: {
          oneTime:
            this.billing === 'monthly'
              ? 'MEM-PUL-PRO-T1:1'
              : 'MEM-PUL-PRO-T2:1',
          everyMonth: '',
        },
        discountPercent: this.getPulseProAttributeValue(
          this.pulseProVariation,
          'discountPercent'
        ),
        smartshipDiscountPrice: this.getPulseProAttributeValue(
          this.pulseProVariation,
          'smartshipDiscountPrice'
        ),
        smartshipDiscountPercent: this.getPulseProAttributeValue(
          this.pulseProVariation,
          'smartshipDiscountPercent'
        ),
        isUserCanAccess: true,
        discountType: '',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: false,
      },
      finalPrice: 0,
    });

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      if (isInvalidSupplement) {
        this.dataService.changePostName({ postName: 'purchase-modal' });
        $('#PurchaseWarningModal').modal('show');
      } else {
        localStorage.setItem('DirectCheckout', JSON.stringify(false));
        this.dataService.setIsFromSmartshipStatus(false);

        cartDataWithLanguages.forEach((cartData: any) => {
          cartData.isPromoter = true;
        });
        const promoterFee: Cart = this.promoterService.getPromoterFeeCart(
          this.selectedCountry,
          this.selectedLanguage,
          this.productSettings
        );
        cartDataWithLanguages.push(promoterFee);

        this.utilityService.setCarts(
          cartDataWithLanguages,
          this.selectedCountry,
          this.selectedLanguage
        );

        this.dataService.changeSidebarName('add-to-cart');

        this.dataService.setOfferFlowStatus(true);

        const routeURL = '/smartship';

        this.utilityService.navigateToRoute(routeURL);
      }
    }
  }

  getTranslatedText(orderType: string) {
    let translatedText = '';
    if (orderType === 'ordertype_1') {
      translatedText = this.translate.instant('onetime-purchase');
    }
    if (orderType === 'ordertype_2') {
      translatedText = this.translate.instant('subscribe-and-save');
    }
    if (orderType === 'ordertype_3') {
      translatedText = this.translate.instant('subscribe-and-save');
    }
    return translatedText;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
