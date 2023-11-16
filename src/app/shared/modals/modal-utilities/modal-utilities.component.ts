import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ReplaySubject, SubscriptionLike, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { ProductVariation } from 'src/app/products/models/product-variation.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { SearchPipe } from 'src/app/shared/pipes/search.pipe';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import {
  ProductServing,
  ProductServingAttribute,
} from '../../../products/models/product-serving.model';
import { ProductSettings } from '../../../products/models/product-settings.model';
import { ProductVariationBase } from '../../../products/models/product-variation.model';
import { Product } from '../../../products/models/product.model';
import { Cart } from '../../models/cart.model';
import { Offer } from '../../models/offer.model';
import { AppCheckoutService } from '../../services/app-checkout.service';
import { AppUserService } from '../../services/app-user.service';
import { BonusService } from '../../services/bonus.service';
import { UserEmitterService } from '../../services/user-emitter.service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-modal-utilities',
  templateUrl: './modal-utilities.component.html',
  styleUrls: ['./modal-utilities.component.css'],
  providers: [SearchPipe],
})
export class ModalUtilitiesComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant: string = '';
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

  leadForm!: FormGroup;
  isLeadFormSubmitted: boolean = false;
  genericError: boolean = false;
  phoneCountries: Array<any> = [];
  bonuses: Array<any> = [];
  requestMade: number = 0;
  isLoaded: boolean = false;
  user: any;
  loggedUser: any;
  activeBonus: any = {
    title: '',
    info: {
      link: '',
      availableCredits: 0,
      totalMoneyAwarded: '',
    },
  };
  selectedCountryObj: any = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  linkCopied: boolean = false;
  leadUser: any;
  activeModal: string = '';
  cardClasses: Array<string> = [
    'pink-card',
    'family-card',
    'orange-card',
    'blue-gradient-light',
    'green-gradient',
    'purple-gradient',
  ];
  isMobile = false;
  clientDomain: string = '';
  checkoutDomain: string = '';
  currentCartItem: Cart[] = [];
  @Input() isBundleBuilderCheckout: boolean = false;

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    public utilityService: AppUtilityService,
    private appUtilityService: AppUtilityService,
    private offerService: AppOfferService,
    private promoterService: PromoterService,
    private appCheckoutService: AppCheckoutService,
    private userService: AppUserService,
    private userEmitterService: UserEmitterService,
    private bonusSvc: BonusService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private websiteSvc: WebsiteService,
  ) {
    this.tenant = environment.tenant;
    this.clientDomain = environment.clientDomain;
    this.checkoutDomain = environment.checkoutDomain;
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        navigator.userAgent
      );

    $(document).on('shown.bs.modal', '#joinAsPromoterModal', () => {
      $('body').addClass('modal-open');
    });

    $(document).on('shown.bs.modal', '#special-offer', () => {
      $('body').addClass('modal-open');
    });
  }

  ngOnInit(): void {
    this.getUser();
    this.getGngOffer();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getPromoterCartData();
    this.getProducts();
    this.getBundleBuilderCartData();
    this.getPruvitTvLink();
    this.getTinyUrl();
    this.getOffer();
    this.getPulseProProduct();
    this.getPhoneCountries();
    this.updateBBCheckoutStatus();
  }

  getUser() {
    this.subscriptions.push(
      this.dataService.currentUserWithScopes$.subscribe((user) => {
        if (user !== null) {
          this.loggedUser = user;
        }
      })
    );
  }

  updateBBCheckoutStatus() {
    this.isBundleBuilderCheckout = (this.isBundleBuilderCheckout || this.dataService.getBBCheckoutStatus()) ? true : false;
  }

  getBundleBuilderCartData() {
    this.dataService.bundleBuilderCartList$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.currentCartItem = x;
      });
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
        this.loadTooltip();
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
    if(this.servings.length > 1) {
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

    let activeSmartshipExist: boolean = false;
    if (this.loggedUser) {
      activeSmartshipExist = this.loggedUser?.mvuser_scopes.includes('smartship');
    }

    const everyMonthCartList = this.utilityService.getEveryMonthStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    if(
      (
        tempProductVariation.skuObj.oneTime !== 'PRU-700-005' && 
        tempProductVariation.skuObj.oneTime !== 'PRU-700-006' &&
        tempProductVariation.skuObj.oneTime !== 'PRU-KOOZIE-001-ONCE'
      ) && 
      this.tenant === 'pruvit' &&
      ((this.selectedOrdertype === 'ordertype_3' && this.productSettings.smartshipDiscountOnTodays) ||
      ((everyMonthCartList.length || activeSmartshipExist) && this.productSettings.smartshipDiscountOnTodays))
    ) {
      let isVipPlusExist: boolean = false;
      if (this.loggedUser) {
        isVipPlusExist = this.loggedUser?.mvuser_scopes.includes('vipPlus');
      }
      const viDiscount = isVipPlusExist ? 25 : 15;
      const vipDiscountPrice = this.staticSmartshipDiscount(tempProductVariation.priceObj.oneTime, viDiscount);
      if((vipDiscountPrice * this.offerQuantity) < tempProductVariation.finalPrice) {
        tempProductVariation.finalPrice = vipDiscountPrice * this.offerQuantity;
        tempProductVariation.hasDiscount = true;
      }
    }
    this.productVariation = tempProductVariation;
  }

  private staticSmartshipDiscount(regularPrice: number, discountPercent: number) {
    if(regularPrice > 0) {
      const discountAmount = +((regularPrice * discountPercent) / 100).toFixed(2);
      return regularPrice - discountAmount;
    }
    return 0;
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
        productImageUrl: this.productVariation.variationImage ? this.productVariation.variationImage : this.offerProduct.thumbUrl,
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
        isOfferProduct: this.offer && Object.keys(this.offer).length ? true : false,
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
        productImageUrl: this.productVariation.variationImage ? this.productVariation.variationImage : this.offerProduct.thumbUrl,
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

    if(!this.isBundleBuilderCheckout) {
      this.utilityService.setCarts(
        cartDataWithLanguages,
        this.selectedCountry,
        this.selectedLanguage
      );
      this.dataService.changeSidebarName('add-to-cart');
    }

    const cartOneTime = this.utilityService.getCartIfAdded(
      cartDataWithLanguages
    ).oneTime;
    const cartEveryMonth = this.utilityService.getCartIfAdded(
      cartDataWithLanguages
    ).everyMonth;

    if(this.isBundleBuilderCheckout) {
      cartDataWithLanguages.forEach(el => {
        if(el.orderType === 'ordertype_1' || el.orderType === 'ordertype_3') {
          this.currentCartItem.push(...cartOneTime);
        }else {
          this.currentCartItem.push(...cartEveryMonth);
        }
      })
    }

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
      if(this.isBundleBuilderCheckout) {
        const refCode = this.user.code;
        const redirectUrl = this.clientDomain + '/cloud/dashboard';
        this.appCheckoutService.setBundleBuilderCheckoutUrl(
          refCode, 
          redirectUrl, 
          this.selectedCountry,
          this.selectedLanguage, 
          this.currentCartItem
        );
      }else {
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
      if(this.isBundleBuilderCheckout) {
        const refCode = this.user.code;
        const redirectUrl = this.clientDomain + '/cloud/dashboard';
        this.appCheckoutService.setBundleBuilderCheckoutUrl(
          refCode, 
          redirectUrl, 
          this.selectedCountry,
          this.selectedLanguage, 
          this.currentCartItem
        );
      }else {
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

  getGngOffer() {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
        if (x) {
          this.createLeadForm();
          //this.referrerCode = this.user.code;
          this.getBonusMeta(this.user.id);
        }
      });
  }

  getBonusMeta(userId: string) {
    this.bonusSvc.getBonusMeta(userId, 'en').pipe(takeUntil(this.destroyed$)).subscribe(
      (x) => {
        const bonuses = x.result.records.filter((r:any) => r.isExpired === false);
        for (let index = 0; index < bonuses.length; index++) {
          this.getBonusInfo(
            this.user.id,
            bonuses[index],
            index,
            bonuses.length
          );
        }
      },
      (err) => {
        // if (err.error.error.detail) {
        //   this.error = err.error.error.detail;
        // }
      }
    );
  }

  getBonusInfo(userId: string, bonus: any, index: number, totalBonus: number) {
    const productId = bonus.id;
    this.bonusSvc
      .getBonusInfo(userId, productId, 'en')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
      (x) => {
        this.requestMade++;
        const bonusRes = x;
        if (bonusRes?.isSuccess && bonusRes?.result !== null) {
          const diffTime = Math.floor(new Date(bonus.expirationDate).getTime() / 1000) - Math.floor(Date.now() / 1000);
          if (diffTime < 90 * 86400) {
            bonus.expiresIn = bonus.expirationDate;
          }
          if (diffTime > 0) {
            bonus.info = bonusRes.result;
            this.bonuses[index] = bonus;
          }

          if (totalBonus === this.requestMade) {
            this.bonuses = this.bonuses.filter((elm) => elm);
            this.isLoaded = true;
          }
        }
      });
  }

  getPhoneCountries() {
    this.http.get('assets/countries.json').pipe(takeUntil(this.destroyed$)).subscribe((data: any) => {
      this.phoneCountries = data;
    });
  }

  createLeadForm() {
    this.leadForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
      phone: new FormControl('', [
        Validators.pattern(
          '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s]?[(]?[0-9]{1,3}[)]?([-s]?[0-9]{3})([-s]?[0-9]{1,4})'
        ),
      ])
    });
  }

  onSubmitLeadForm() {
    this.genericError = false;
    let { firstName, lastName, email, phone } = this.leadForm.value;
    const phoneWithCountry = phone !== '' ? this.selectedCountryObj.phone_code + phone : '';
    
    let contactId = '';
    if (this.leadForm.valid) {
      this.isLeadFormSubmitted = true;

      this.websiteSvc
        .getContactByUserEmail(this.user.id, email)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (x: any) => {
            let contactReqArr: any = [];
            contactId = x != '' ? x : '';
            if (contactId !== '') {
              contactReqArr.push(
                this.websiteSvc.updateContactName(contactId, firstName, lastName)
              );
              contactReqArr.push(
                this.websiteSvc.updateContactSource(contactId, 'PersonalInvite')
              );
              if(phoneWithCountry) {
                contactReqArr.push(
                  this.websiteSvc.updateContactPhone(contactId, phoneWithCountry)
                );
              }
            } else {
              contactReqArr.push(
                this.websiteSvc
                  .createContact(
                    this.user.id,
                    firstName,
                    lastName,
                    email,
                    phoneWithCountry,
                    this.selectedCountryObj.country_code,
                    'PersonalInvite'
                  )
              );
            }
            forkJoin(contactReqArr)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
              (x: any) => {
                const isSuccess = x.every(
                  (el: { isSuccess: boolean }) => el.isSuccess === true
                );
                if (isSuccess) {
            
                  if (x.length === 1 && contactId === '' && x[0]?.result?.contactId) {
                    contactId = x[0].result.contactId;
                  }
               
                  this.bonusSvc
                    .createPersonalInvite(
                      {
                        composer: btoa(
                          'urn:' + this.tenant + ':profile:' + this.user.id
                        ),
                        productId: this.activeBonus.info.productId,
                        recipient: contactId,
                      },
                      'en'
                    )
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe(
                      (inviteResponse: any) => {
                        this.isLeadFormSubmitted = false;

                        if (inviteResponse.isSuccess) {
                          var localDateUtc = moment.utc(inviteResponse.result.expiresAt);
                          var localDate = moment(localDateUtc).utcOffset(10 * 60);
                          const offerExpiryTimeString = localDate.format();
                          const VI = {
                            offererCode: this.user.code,
                            firstName: firstName,
                            lastName: lastName,
                            email: email.replace('+', '%2B'),
                            phone: phoneWithCountry ? phoneWithCountry.replace('+', '%2B') + phone : '',
                            viProductId: this.activeBonus.info.productId.split('urn:'+this.tenant+':product:')[1],
                            viCode: btoa(inviteResponse.result.proposalId), 
                            offerExpiryTime: offerExpiryTimeString.replace('+', '%2B')
                          }
                          this.appUtilityService.setTinyUrl(VI)
                          this.activeBonus.info.availableCredits--;
                          this.activeModal = 'lead-send';
                          this.leadUser = inviteResponse.result;
                          this.loadTooltip();
                        } else {
                          this.genericError = true;
                        }
                      },
                      (err: any) => {
                        this.genericError = true;
                        this.isLeadFormSubmitted = false;
                      },
                      () => {
                        this.leadForm.reset({ phone: '' });
                        this.selectedCountryObj = {
                          country_code: 'US',
                          phone_code: '+1',
                          name: 'United States',
                        };
                        console.log('contat and proposal completed');
                      }
                    );
                } else {
                  this.genericError = true;
                  this.isLeadFormSubmitted = false;
                }
              },
              (err) => {
                this.leadForm.reset({ phone: '' });
                this.selectedCountryObj = {
                  country_code: 'US',
                  phone_code: '+1',
                  name: 'United States',
                };
                this.genericError = true;
                this.isLeadFormSubmitted = false;
              }
            )
          } 
        );
    }
  }

  get firstNameControl() {
    return this.leadForm.controls['firstName'];
  }

  get lastNameControl() {
    return this.leadForm.controls['lastName'];
  }

  get emailControl() {
    return this.leadForm.controls['email'];
  }

  get phoneControl() {
    return this.leadForm.controls['phone'];
  }

  onClickGngOffer(n:any) {
    if(n.info.availableCredits > 0) {
      this.activeBonus = n;
      this.activeModal = 'lead-create'; 
    }
  }

  onChangePhoneCountry(event: any) {
    const index = event.target.value;
    this.selectedCountryObj = this.phoneCountries[index];
  }

  copy(event:any) {
    if(this.isMobile && $("div[role='tooltip']").length && $("div[role='tooltip']").hasClass('hide')) {
      $("div[role='tooltip']").removeClass('hide');
    }
    if (event.isSuccess) {
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
        if(this.isMobile) $("div[role='tooltip']").addClass('hide');
        this.loadTooltip();
      }, 1500);
    }
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  sendEmail() {
    window.location.href = `mailto:?&body=Check this out! ${this.bitlyLink}`;
  }

  sendSMS() {
    window.location.href = `sms:?&body=${this.bitlyLink}`;
  }

  redirectFacebook() {
    window.open(
      'https://www.facebook.com/dialog/share?' +
        'app_id=' +
        environment.facebookAppId +
        '&display=popup' +
        '&href=' +
        encodeURIComponent(this.bitlyLink) +
        '&redirect_uri=' +
        encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  redirectTwitter() {
    window.open(
      'https://twitter.com/intent/tweet' +
        '?url=' +
        encodeURIComponent(this.bitlyLink) +
        '&text=' +
        encodeURIComponent(
          `I just wanted to share with you ${
            this.tenant === 'pruvit' ? 'PruvIt!' : '.'
          } Please take a look ;) `
        ),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  ngOnDestroy() {
    this.dataService.setBundleBuilderCart(this.currentCartItem);
    this.dataService.setBBCheckoutStatus(this.isBundleBuilderCheckout);
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
