import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { CartTotal } from 'src/app/shared/models/cart-total.model';
import { AppCartTotalService } from 'src/app/shared/services/app-cart-total.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { Product } from 'src/app/products/models/product.model';
import { ProductVariationBase } from 'src/app/products/models/product-variation.model';
import {
  ProductServing,
  ProductServingAttribute,
} from 'src/app/products/models/product-serving.model';
import { ProductsTagAndCategoryService } from 'src/app/products/services/products-tag-and-category.service';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { Cart } from 'src/app/shared/models/cart.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { getMaxRegularDiscount } from 'src/app/shared/utils/discount';

declare var $: any;
declare var gallerySliderJS: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  language = '';
  country = '';
  user: any;

  products = [] as Product[];
  product = {} as Product;
  servings: ProductServing[] = [];
  orderTypes: ProductVariationBase['orderType'][] = [];
  selectedAttribute1 = {} as ProductServingAttribute;
  selectedAttribute2 = {} as ProductServingAttribute;
  selectedOrdertype = '' as ProductVariationBase['orderType'];
  productVariation = {} as ProductVariationBase;
  productQuantity = 1;

  categories: ProductTagOrCategory[] = [];
  offers: Offer[] = [];
  productsData: any = {};
  parentCategory = {} as ProductTagOrCategory;
  childCategory = {} as ProductTagOrCategory;
  productSettings = {} as ProductSettings;

  cartTotalOneTime: CartTotal[] = [];
  oneTimeCart: Cart[] = [];
  everyMonthCart: Cart[] = [];

  wistiaHTML = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService,
    private translate: TranslateService,
    private productsTagAndCategoryService: ProductsTagAndCategoryService,
    private seoService: AppSeoService,
    private cartTotalService: AppCartTotalService,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private promoterService: PromoterService,
    private changeDetectionRef: ChangeDetectorRef,
    private store: Store<AppState>
  ) {
    this.getProducts();
  }

  ngOnInit(): void {
    this.getCountry();
    this.getLanguage();
    this.getUser();
    this.getCategories();
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
    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }

        this.products = data.products;
        this.productsData = data.productsData;
        this.productSettings = data.productSettings;
        this.offers = data.offers;
      })
    );
  }

  @Input()
  set newProduct(product: Product) {
    this.product = product;
    this.orderTypes = [];
    this.servings = [];
    this.selectedAttribute1 = {} as ProductServingAttribute;
    this.selectedAttribute2 = {} as ProductServingAttribute;
    this.selectedOrdertype = '' as ProductVariationBase['orderType'];
    this.productQuantity = 1;
    this.productVariation = {} as ProductVariationBase;

    this.parentCategory = {} as ProductTagOrCategory;
    this.childCategory = {} as ProductTagOrCategory;
    this.wistiaHTML = '';
    this.cartTotalOneTime = [];
    this.oneTimeCart = [];
    this.everyMonthCart = [];
    this.subscriptions = [];

    this.getProductGallery();

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

    this.parentCategory =
      this.productsTagAndCategoryService.getParentCategoryForProduct(
        this.product,
        this.categories
      );
    this.childCategory =
      this.productsTagAndCategoryService.getChildCategoryForProduct(
        this.product
      );

    this.getWistiaVideoHTML();
    this.loadTooltip();

    this.getCartsForCartTotal();

    this.setSeo();
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

        this.changeDetectionRef.detectChanges();
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

      if (cartTotalDiscountOneTime) {
        cartTotalDiscountOneTime.forEach((discount: any, index: number) => {
          this.cartTotalOneTime[index] =
            this.cartTotalService.getCartTotalObject(
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

  /* ----------- image slider ------------- */
  getProductGallery() {
    if (this.product.hasOwnProperty('customGallery')) {
      const bannerSlick = $(
        '.slider.sk-product-slider-for.sk-product__main-img.slick-initialized.slick-slider'
      );

      const bannerPreviewSlick = $(
        '.sk-product__flavor-list.slider.sk-product-slider-nav.slick-initialized.slick-slider'
      );

      if (bannerSlick.length > 0) {
        $('.sk-product-slider-for').slick('unslick');
      }

      if (bannerPreviewSlick.length > 0) {
        $('.sk-product-slider-nav').slick('unslick');
      }

      $(document).ready(() => {
        setTimeout(() => {
          gallerySliderJS(this.product.customGallery.length);

          $('.sk-product-slider-for').slick('setPosition');
        }, 0);
      });
    }
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

  private checkAllAttr1OutOfStock(attributeItem1: string) {
    const isAllNotOutOfStock = this.product.variations.every(
      (variation) =>
        variation.attribute1 === attributeItem1 &&
        (variation.orderType === 'ordertype_1' ||
          variation.orderType === 'ordertype_3') &&
        variation.isOutOfStock
    );
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
      if (
        variation.attribute1 === this.selectedAttribute1.key &&
        variation.attribute2 === attributeItem2 &&
        variation.orderType === 'ordertype_1' &&
        variation.isOutOfStock
      ) {
        isAttr2OutOfStock = true;
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
      this.selectedOrdertype = 'ordertype_3';
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
    this.productVariation = {} as ProductVariationBase;

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
  }

  /* --------- add to cart section ------------- */
  private generateCartWithLanguages() {
    const cartDataWithLanguages: Cart[] = [];

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
      hasUserRestriction: this.userService.isProductForUSersOnly(this.product.accessLevels),
      cart: {
        productID: this.product.id,
        productName: this.product.title,
        productImageUrl: this.product.thumbUrl,
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

  onClickAddToCart() {
    const isInvalidSupplement =
      this.utilityService.isIncompatibleCheckout(false);

    const cartDataWithLanguages: Cart[] = this.generateCartWithLanguages();

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      localStorage.setItem('DirectCheckout', JSON.stringify(false));
      this.dataService.setIsFromSmartshipStatus(false);

      const isProductHasSmartshipDiscount: boolean =
        this.productVariation.smartshipDiscountPrice !== 0 ? true : false;

      if (this.product.isForPromoter) {
        cartDataWithLanguages.forEach((cartData) => {
          cartData.isPromoter = true;
        });
        const promoterFee: Cart = this.promoterService.getPromoterFeeCart(
          this.country,
          this.language,
          this.productSettings
        );
        cartDataWithLanguages.push(promoterFee);
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
        (this.product.isForPromoter || isProductHasSmartshipDiscount) &&
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

  /* ------------ wistia and other texts --------------- */
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

  getWistiaVideoHTML() {
    const videoID = this.getWistiaVideoID();

    const watchTheVideoTranslation =
      this.product.bannerLinkTitle !== ''
        ? this.product.bannerLinkTitle
        : this.getWatchVideoTranslatedText();

    const tempWistiaHTML =
      '<span class="btn btn-brand-primary btn-large btn-icon btn-watch btn-watch-videopop wistia_embed wistia_async_' +
      videoID +
      ' popover=true popoverContent=link" style="display: inline;"> <span class="a-link link-hover"><i class="far fa-play-circle play-icon"></i>' +
      watchTheVideoTranslation +
      '</span></span>';

    this.wistiaHTML = videoID === '' ? '' : tempWistiaHTML;
  }

  getWistiaVideoID() {
    const videoLink =
      this.product.bannerLink !== ''
        ? this.product.bannerLink
        : this.product.wistiaVideoLink;

    let videoID = '';

    if (videoLink) {
      if (videoLink.includes('home.wistia.com')) {
        videoID = videoLink.substring(videoLink.lastIndexOf('/') + 1);
      } else {
        videoID = videoLink;
      }
    }
    return videoID;
  }

  isPruvitTVPresent(videoLink: string) {
    if (videoLink !== '') {
      if (videoLink?.includes('pruvit.tv')) {
        return true;
      }
    }
    return false;
  }

  onClickPruvitTvVideo(videoLink: string) {
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
  }

  getTranslatedText(orderType: string) {
    let translatedText = '';
    if (orderType === 'ordertype_1') {
      translatedText = this.translate.instant('onetime-purchase');
    }
    if (orderType === 'ordertype_3') {
      translatedText = this.translate.instant('subscribe-and-save');
    }
    return translatedText;
  }

  getWatchVideoTranslatedText(): string {
    let translatedText = '';
    switch (this.language) {
      case 'en':
        translatedText = 'Watch the video';
        break;
      case 'de':
        translatedText = 'Video ansehen';
        break;
      case 'es':
        translatedText = 'Ver el vídeo';
        break;
      case 'it':
        translatedText = 'Guarda il video';
        break;
      case 'zh-hans':
        translatedText = '观看影片';
        break;
      case 'zh-hant':
        translatedText = '觀看影片';
        break;
      default:
        translatedText = 'Watch the video';
        break;
    }
    return translatedText;
  }

  onClickLearnMore() {
    this.dataService.changeSidebarName('delivery-options');
    $('.drawer').drawer('open');
  }

  /* navigation */
  onClickCategory(category: ProductTagOrCategory) {
    const routeURL = '/category/' + category.slug;

    this.utilityService.navigateToRoute(routeURL);
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onClickShopAll() {
    let shopAllSlug = '';

    this.product.categories.forEach((category) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;

    this.utilityService.navigateToRoute('/category/' + shopAllSlug);
  }

  onClickShopNow() {
    this.utilityService.navigateToRoute('/smartship');
  }

  /* seo */
  setSeo() {
    if (
      !(
        this.product &&
        Object.keys(this.product).length === 0 &&
        this.product.constructor === Object
      )
    ) {
      this.seoService.updateTitle(this.product.title);
      this.seoService.updateDescription(this.product.bannerDiscription);

      this.subscriptions.push(
        this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
          if (!status) {
            this.seoService.updateRobots('index,follow');
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
