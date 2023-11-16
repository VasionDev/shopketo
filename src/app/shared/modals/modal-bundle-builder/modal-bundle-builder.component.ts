import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ProductServing } from 'src/app/products/models/product-serving.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { ProductVariation, ProductVariationBase } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { ProductsApiService } from 'src/app/products/services/products-api.service';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { environment } from 'src/environments/environment';
import { CartTotal } from '../../models/cart-total.model';
import { Cart } from '../../models/cart.model';
import { Offer } from '../../models/offer.model';
import { AppCartTotalService } from '../../services/app-cart-total.service';
import { AppCheckoutService } from '../../services/app-checkout.service';
import { AppDataService } from '../../services/app-data.service';
import { AppOfferService } from '../../services/app-offer.service';
import { AppUserService } from '../../services/app-user.service';
import { AppUtilityService } from '../../services/app-utility.service';
import { NewgenApiService } from '../../services/newgen-api.service';
declare var $: any;

@Component({
  selector: 'app-modal-bundle-builder',
  templateUrl: './modal-bundle-builder.component.html',
  styleUrls: ['./modal-bundle-builder.component.css'],
})
export class ModalBundleBuilderComponent implements OnInit {
  slideConfig = {
    slidesToShow: 6,
    slidesToScroll: 2,
    arrows: true,
    autoplay: false,
    dots: false,
    infinite: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private timeoutId: any = null;
  tenant: string = '';
  user: any = null;
  selectedLanguage: string = '';
  selectedCountry: string = '';
  currentCountry: string = '';
  currentLanguage: string = '';
  checkoutDomain: string = '';
  clientDomain: string = '';
  currencySymbol: string = '$';
  products: Product[] = [];
  categories: ProductTagOrCategory[] = [];
  productSettings = {} as ProductSettings;
  existingSmartshipOrders: Array<any> = [];
  currentCartItem: Cart[] = [];
  summaryList: {category: ProductTagOrCategory, cart: Cart[]}[] = [];
  totalCartCount: number = 0;
  cartTotalRegularPrice: number = 0;
  cartTotalDiscountPrice: number = 0;
  modalState: number = 0;
  slidesToScroll: number = 0;
  slidesToShow: number = 0;
  autoshipLoader: boolean = false;
  autoshipOrder: any;
  modalTitle: string = '';
  modalDescription: string = '';
  isVipPlusExist: boolean = false;
  forOnetimeVar: boolean = false;
  cartTotalDiscount: any;
  countries: any[] = [];
  activeCountries: any[] = [];
  cartTotalOneTime: CartTotal[] = [];
  offers: Offer[] = [];
  canCheckout: boolean = true;
  @Input() bundleBuilder: any;
  @ViewChild('slickModal') slickModal: any;
  @ViewChild('bundleBuilderModalHeader') bundleBuilderModalHeader!: ElementRef;
  slickHeaderHeight: number = 0;
  modalHeaderHeight: any;
  selectedCategorySlug: string = '';

  constructor(
    private dataService: AppDataService,
    private newgenSvc: NewgenApiService,
    private productsApiService: ProductsApiService,
    private userService: AppUserService,
    private productUtilityService: ProductsUtilityService,
    private cartTotalService: AppCartTotalService,
    private offerService: AppOfferService,
    private utilityService: AppUtilityService,
    private appCheckoutService: AppCheckoutService
  ) {
    this.getUser();
    this.getCountries();
    this.getSelectedCountry();
    this.tenant = environment.tenant;
    this.clientDomain = environment.clientDomain;
    this.checkoutDomain = environment.checkoutDomain;
    this.getScreenSize();
  }

  ngOnInit(): void {
    this.modalTitle =
      this.bundleBuilder.modalTitle != ''
        ? this.bundleBuilder.modalTitle
        : 'Update products';
    this.selectedCategorySlug =
      this.bundleBuilder.hasOwnProperty('category') &&
      this.bundleBuilder.category !== '' ? this.bundleBuilder.category : '';
    this.forOnetimeVar = 
      this.bundleBuilder.hasOwnProperty('onetimeOrder') && 
      this.bundleBuilder.onetimeOrder ? this.bundleBuilder.onetimeOrder : false;
    this.modalDescription = this.bundleBuilder.modalDescription != '' ? this.bundleBuilder.modalDescription : '';
    this.autoshipOrder = this.bundleBuilder.autoshipOrder;
    this.getSelectedLanguage();
    this.getAutoshipProducts();
    this.updateSmartshipCart();
  }

  getUser() {
    this.dataService.currentUserWithScopes$
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.isVipPlusExist = this.user?.mvuser_scopes.includes('vipPlus');
      }
    });
  }

  getCountries() {
    this.dataService.currentCountries$
    .pipe(takeUntil(this.destroyed$))
    .subscribe((countries: any) => {
      this.countries = countries;
      this.activeCountries = countries.filter(
        (country: any) => country.active === '1' && this.user.checkoutCountries.find((c: any) => c.code === country.country_code)
      ).sort((a: any, b: any) => (a.country > b.country ? 1 : -1));
    })
  }

  get countryName() {
    const countryObj = this.countries.find(c=> c.country_code === this.selectedCountry)
    if(countryObj) {
      return countryObj.country;
    }
    return '';
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe((country: string) => {
      this.selectedCountry = country;
      this.currentCountry = country;
      const found = this.activeCountries.find(c=> c.country_code === this.selectedCountry);
      this.canCheckout = found ? true : false;
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
    .pipe(takeUntil(this.destroyed$))
    .subscribe((language: string) => {
      this.selectedLanguage = language;
      this.currentLanguage = language;
    });
  }

  getAutoshipProducts() {
    if (this.autoshipOrder) {
      this.autoshipLoader = true;
      this.newgenSvc
        .getAutoship(this.autoshipOrder.id)
        .pipe(
          map((x) => {
            const smartShipData = x.collection[0].subscriptions[0].items;
            return smartShipData.map((autoship: any) => ({
              name: autoship.bundle.name,
              sku: autoship.bundle.sku,
              quantity: autoship.quantity,
              price: autoship.unitPrice,
            }));
          }),
          takeUntil(this.destroyed$)
        )
        .subscribe((x) => {
          this.existingSmartshipOrders = x;
          this.autoshipLoader = false;
          this.getProductsbyCountry();
        });
    } else {
      this.existingSmartshipOrders = [];
      this.getProductsbyCountry();
    }
  }

  updateSmartshipCart() {
    this.dataService.bundleBuilderCartList$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.currentCartItem = x;
        this.totalCartCount = this.currentCartItem.reduce((sum, item) => {
          return (sum += item.cart.quantity);
        }, 0);
        this.cartTotalRegularPrice = this.currentCartItem.reduce(
          (sum, item) => {
            return (sum += item.cart.price.oneTime * item.cart.quantity);
          },
          0
        );
        this.cartTotalDiscountPrice = this.currentCartItem.reduce(
          (sum, item) => {
            return (sum += item.finalPrice * item.cart.quantity);
          },
          0
        );
        this.cartProductByCategory();
      });
  }

  getProductsbyCountry() {
    this.productsApiService
      .getProductsWithLanguage(this.selectedCountry, this.selectedLanguage)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        if (x && Object.keys(x).length === 0 && x.constructor === Object) {
          return;
        }
        this.products = x.products;
        this.productSettings = x.productSettings;
        this.offers = this.forOnetimeVar ? x.offers : [];
        this.cartTotalDiscount = x.productsData.cart_total_discount;
        this.getCurrencySymbol();
        const childCategories = this.updateChildCategories(x.categories);
        const sortedByOrder = childCategories
          .filter((x) => x.order > 0)
          .sort((a, b) => (a.order < b.order ? 1 : -1));
        const sortedByName = childCategories
          .filter((x) => x.order < 1)
          .sort((a, b) => (a.name > b.name ? 1 : -1));
        this.categories = sortedByOrder.concat(sortedByName);
        this.prePopulatedCartProduct();
        this.getModalHeaderHeight();
        if(this.forOnetimeVar) {
          this.setOneTimeCartTotalDiscount();
          this.setOneTimePriceAndStatus();
        }
      });
  }

  navigateToSelectedCategory() {
    if(this.selectedCategorySlug !== '') {
      const selectedCategory = this.categories.find(c => c.slug === this.selectedCategorySlug);
      if(selectedCategory) {
        this.editByCategory({category: selectedCategory, cart:[]});
      }
    }
  }

  cartProductByCategory() {
    this.summaryList = this.categories
      .map((c) => {
        const cartProd = this.currentCartItem.filter((x) => {
          return x.cart.categoryId === c.termId;
        });
        return {
          category: c,
          cart: cartProd,
        };
      })
      .filter((l) => l.cart.length);
  }

  private prePopulatedCartProduct() {
    const selectedCart: Cart[] = [];
    this.categories.forEach((cat) => {
      cat.products.forEach((prod) => {
        prod.variations.forEach((variation) => {
          const variationObj = this.existingSmartshipOrders.find(
            (x) => x.sku === variation.sku
          );
          if (variationObj) {
            selectedCart.push(
              this.generateCartObject(
                cat,
                prod,
                variation,
                variationObj.quantity
              )
            );
          }
        });
      });
    });
    this.dataService.setBundleBuilderCart(selectedCart);
  }

  private updateChildCategories(
    categories: ProductTagOrCategory[]
  ): ProductTagOrCategory[] {
    const childCats: ProductTagOrCategory[] = [];
    categories.forEach((cat) => {
      if (cat.childs.length) {
        childCats.push(...cat.childs);
      }
    });
    const tempCategories = childCats.length > 0 ? childCats : categories;
    return tempCategories
      .map((c) => ({
        ...c,
        products: this.getFilteredVariations(c.products).sort((a, b) => (a.flavor > b.flavor ? 1 : -1)),
      }))
      .filter((c) => c.products.length > 0);
  }

  setOneTimeCartTotalDiscount() {
    if (this.categories.length) {
      const cartTotalDiscount = this.cartTotalDiscount;
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

      const maxRegularDiscount = 0;
      const cartOneTimeSkuForLength1 = '';
      const cartOneTimePriceForLength1 = 0;

      if (cartTotalDiscountOneTime) {
        cartTotalDiscountOneTime.forEach((discount: any, index: number) => {
          const isUserCanAccess = this.userService.checkUserAccess(
            discount.accessLevels,
            discount.customUsers,
            false
          );
          if(isUserCanAccess) {
            this.cartTotalOneTime[index] =
              this.cartTotalService.getCartTotalObject(
                true,
                discount,
                this.currentCartItem,
                [],
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

    this.currentCartItem = this.currentCartItem.map((oneTimeItem) => {
      const tempOneTimeItem = Object.assign({}, oneTimeItem);
      let price = oneTimeItem.cart.price.oneTime;
      let status = false;

      const regularDiscountedPrice = this.utilityService.getBestRegularDiscount(
        oneTimeItem.cart.discountPrice,
        oneTimeItem.cart.smartshipDiscountPrice,
        [],
        oneTimeItem.cart.isSmartshipDiscountOn
      );

      for (let index = 0; index < this.cartTotalOneTime.length; index++) {
        const productPrice =
          this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
            regularDiscountedPrice,
            oneTimeItem.cart.price.oneTime,
            oneTimeItem.cart.productSku.oneTime,
            this.cartTotalOneTime[index],
            []
          ).price;
        const productStatus =
          this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
            regularDiscountedPrice,
            oneTimeItem.cart.price.oneTime,
            oneTimeItem.cart.productSku.oneTime,
            this.cartTotalOneTime[index],
            []
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
        this.tenant === 'pruvit' &&
        activeSmartshipExist &&
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

      tempDiscountSumPrice +=
        tempOneTimeItem.cart.quantity * tempOneTimeItem.finalPrice;
      tempSumPrice +=
        tempOneTimeItem.cart.quantity * tempOneTimeItem.cart.price.oneTime;

      return tempOneTimeItem;
    });
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
          this.currentCartItem,
          [],
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
      this.currentCartItem.forEach((element) => {
        if (!cartTotalOfferSkus.includes(element.cart.productSku.oneTime)) {
          let price = element.cart.price.oneTime;
          let status = false;

          const regularDiscountedPrice =
            this.utilityService.getBestRegularDiscount(
              element.cart.discountPrice,
              element.cart.smartshipDiscountPrice,
              [],
              element.cart.isSmartshipDiscountOn
            );

          for (let index = 0; index < this.cartTotalOneTime.length; index++) {
            const productPrice =
              this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
                regularDiscountedPrice,
                element.cart.price.oneTime,
                element.cart.productSku.oneTime,
                this.cartTotalOneTime[index],
                []
              ).price;
            const productStatus =
              this.cartTotalService.getOneTimeBestCartTotalPriceAndStatus(
                regularDiscountedPrice,
                element.cart.price.oneTime,
                element.cart.productSku.oneTime,
                this.cartTotalOneTime[index],
                []
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
      this.currentCartItem.forEach((element) => {
        if (!cartTotalOfferSkus.includes(element.cart.productSku.oneTime)) {
          cartTotalPrice += element.cart.price.oneTime * element.cart.quantity;
        }
      });
    }

    return cartTotalPrice;
  }

  getCurrencySymbol() {
    if (this.productSettings) {
      this.currencySymbol =
        this.productSettings.exchangeRate > 0
          ? this.productSettings.currencySymbol
          : '$';
    }
  }

  private getFilteredVariations(products: Product[]) {
    const orderType = this.forOnetimeVar ? 'ordertype_1' : 'ordertype_2';
    return products.filter((product) => {
      product.flavor = product.flavor !== '' ? product.flavor : product.title;
      let isOrderTypeFound = false;
      const isUserCanAccess = this.userService.checkUserAccess(
        product.accessLevels,
        product.customUsers,
        false
      );
      if(product.isSoldOut || product.isAllVariationOutOfStock || product.isForPromoter) {
        isOrderTypeFound = false;
      }else {
        const selectedVariations: ProductVariation[] = [];
        product.variations.forEach((variation) => {
          if (variation.orderType === orderType) {
            variation.finalPrice = this.getFinalDiscountedPrice(variation);
            selectedVariations.push(variation);
            isOrderTypeFound = true;
          }
        });
        product.variations = selectedVariations;
      }
      return isOrderTypeFound;
    });
  }

  getAttributeList(variation: ProductVariation, servings: ProductServing[]) {
    let servingName: string[] = [];
    servings.forEach((serving) => {
      serving.servingAttributes.forEach((attribute) => {
        if (
          attribute.key === variation.attribute1 ||
          attribute.key === variation.attribute2
        ) {
          servingName.push(attribute.name);
        }
      });
    });
    return servingName.join(', ');
  }

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

  onSmartshipRemove(
    cat: ProductTagOrCategory,
    product: Product,
    variation: ProductVariation
  ) {
    let index = -1;
    const cartProd = this.currentCartItem.find((x: Cart, i: number) => {
      index = i;
      const sku = this.forOnetimeVar ? x.cart.productSku.oneTime : x.cart.productSku.everyMonth;
      return sku === variation.sku;
    });

    if (cartProd) {
      if (cartProd.cart.quantity === 1) {
        this.currentCartItem.splice(index, 1);
      } else {
        this.currentCartItem[index] = this.generateCartObject(
          cat,
          product,
          variation,
          cartProd.cart.quantity - 1
        );
      }
      if(this.forOnetimeVar) {
        this.setOneTimeCartTotalDiscount();
        this.setOneTimePriceAndStatus();
      }
      this.updateProductWithCartTotalDiscount(this.categories);
      this.dataService.setBundleBuilderCart(this.currentCartItem);
    }
  }

  onSmartshipAdd(
    cat: ProductTagOrCategory,
    product: Product,
    variation: ProductVariation
  ) {
    let index = -1;
    const cartProd = this.currentCartItem.find((x: Cart, i: number) => {
      index = i;
      const sku = this.forOnetimeVar ? x.cart.productSku.oneTime : x.cart.productSku.everyMonth;
      return sku === variation.sku;
    });

    if (cartProd) {
      if (cartProd.cart.quantity < variation.maxQuantity)
        this.currentCartItem[index] = this.generateCartObject(
          cat,
          product,
          variation,
          cartProd.cart.quantity + 1
        );
    } else {
      this.currentCartItem.push(
        this.generateCartObject(cat, product, variation, 1)
      );
    }
    if(this.forOnetimeVar) {
      this.setOneTimeCartTotalDiscount();
      this.setOneTimePriceAndStatus();
    }
    this.updateProductWithCartTotalDiscount(this.categories);
    this.dataService.setBundleBuilderCart(this.currentCartItem);
  }

  updateProductWithCartTotalDiscount(categories: ProductTagOrCategory[]) {
    categories
      .map((c) => ({
        ...c,
        products: this.getFilteredVariations(c.products),
      }))
      .filter((c) => c.products.length > 0);
  }

  numberOfAdded(
    variation: ProductVariation
  ) {
    const cartProd = this.currentCartItem.find((x: Cart, i: number) => {
      const sku = this.forOnetimeVar ? x.cart.productSku.oneTime : x.cart.productSku.everyMonth;
      return sku === variation.sku;
    });
    if (cartProd) {
      return +cartProd.cart.quantity;
    } else {
      return 0;
    }
  }

  getBgColor(product: Product) {
    return product.themeColor &&
      product.themeColor !== '' &&
      product.themeColor !== '#000000'
      ? product.themeColor
      : '#919192';
  }

  onViewOrEditSummary() {
    this.modalState = Number(!this.modalState);
  }

  onConfirmCart() {
    this.modalState = 2;
  }

  onBackState() {
    this.modalState = 0;
  }

  getFinalDiscountedPrice(variation: ProductVariation) {
    if(this.forOnetimeVar) {
      const finalPrice = this.getProductBestPrice(variation);
      return finalPrice;
    }
    return variation.priceObj.everyMonth;
  }

  private getProductBestPrice(variation: ProductVariation) {
    const discount = this.getBestRegularDiscountPrice(variation);
    const finalDiscount = this.getApplicableVipDiscount(discount, variation);
    const cartTotalDiscount = this.getCartTotalDiscountedPrice(
      variation
    );

    if (finalDiscount === 0) {
      if (cartTotalDiscount === 0) {
        return variation.priceObj.oneTime;
      } else {
        return cartTotalDiscount;
      }
    } else {
      if (cartTotalDiscount === 0) {
        return finalDiscount;
      } else {
        const minDiscount = Math.min(finalDiscount, cartTotalDiscount);
        return minDiscount;
      }
    }
  }

  private getBestRegularDiscountPrice(variation: ProductVariation) {
    let activeSmartshipExist: boolean = false;
    let discountPrice = 0;
    if (this.user) {
      activeSmartshipExist = this.user?.mvuser_scopes.includes('smartship');
    }
    
    if (variation.orderType === 'ordertype_1') {
      const isUserCanAccess = this.userService.checkUserAccess(
        variation.accessLevels,
        variation.customUsers
      );

      if (isUserCanAccess) {
        if (variation.discountPrice !== 0) {
          if (variation.smartshipDiscountPrice !== 0 && activeSmartshipExist) {
            discountPrice = Math.min(
              variation.discountPrice,
              variation.smartshipDiscountPrice
            );
          } else {
            discountPrice = variation.discountPrice;
          }
        } else {
          if (variation.smartshipDiscountPrice !== 0 && activeSmartshipExist) {
            discountPrice = variation.smartshipDiscountPrice;
          } else {
            discountPrice = 0;
          }
        }
      }
    }
    return discountPrice;
  }

  private getApplicableVipDiscount(discount: number, variation: ProductVariation) {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    const user = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    let activeSmartshipExist: boolean = false;
    if (user) {
      activeSmartshipExist = user?.mvuser_scopes.includes('smartship');
    }
    /*const localEveryMonthCart = localStorage.getItem('EveryMonth');
    const everyMonthCart = localEveryMonthCart ? JSON.parse(localEveryMonthCart) : [];
    const filterEveryMonthCart = everyMonthCart.filter((cart: any) => (
      cart.country.toLowerCase() === this.selectedCountry.toLowerCase())
    );*/
    if(
      this.productSettings.smartshipDiscountOnTodays && 
      activeSmartshipExist && 
      Object.keys(variation).length
    ) {
      let tempDiscount = 0;
      let isVipPlusExist: boolean = false;
      if (user) {
        isVipPlusExist = user?.mvuser_scopes.includes('vipPlus');
      }
      const viDiscount = isVipPlusExist ? 25 : 15;
      tempDiscount = this.staticSmartshipDiscount(variation.priceObj.oneTime, viDiscount);
      return discount > 0 ? (tempDiscount < discount ? tempDiscount : discount) : tempDiscount;
    }
    return discount;
  }

  private staticSmartshipDiscount(regularPrice: number, discountPercent: number) {
    if(regularPrice > 0) {
      const discountAmount = +((regularPrice * discountPercent) / 100).toFixed(2);
      return regularPrice - discountAmount;
    }
    return 0;
  }

  private getCartTotalDiscountedPrice(variation: ProductVariation) {
    let minDiscountedPrice = Number.MAX_SAFE_INTEGER;
    let allCartTotalDiscounts: Array<{ sku: string; percent: number; isUnlocked: boolean;}> = [];

    if(this.cartTotalOneTime) {
      this.cartTotalOneTime.forEach((discount: CartTotal) => {
        const skuObj = discount.discountedSkus;
        if (skuObj.length) {
          allCartTotalDiscounts = skuObj.map(element => {
            return {...element, isUnlocked: discount.isUnlocked}
          })
        }
      });
    }

    allCartTotalDiscounts.forEach((skuObj) => {
      if (skuObj.sku === variation.sku && skuObj.isUnlocked) {
        const discount = variation.price - (skuObj.percent / 100) * variation.price;
        minDiscountedPrice = Math.min(minDiscountedPrice, discount);
      }
    });

    return minDiscountedPrice !== Number.MAX_SAFE_INTEGER
      ? minDiscountedPrice
      : 0;
  }

  getTotalDiscountAmount(item: Cart, quantity: number) {
    return (item.cart.price.oneTime - item.finalPrice) * quantity;
  }

  getDiscountTitle() {
    return this.isVipPlusExist ? '25% SmartShip Discount' : '15% SmartShip Discount';
  }

  getCartQuantityInCategory(category: ProductTagOrCategory) {
    return +this.currentCartItem.reduce((sum, item) => {
      if (category.termId === item.cart.categoryId) {
        sum += item.cart.quantity;
      }
      return sum;
    }, 0);
  }

  onSelectCategory(category: ProductTagOrCategory) {
    $('#update-smartship .update-products-nav li div.active').removeClass(
      'active'
    );
    $(
      '#update-smartship .update-products-nav li div[data-target="#tab-' +
        category.termId +
        '"]'
    ).tab('show');
    const selectedCart: Cart[] = [];
    category.products.forEach((prod) => {
      const cartFound = this.currentCartItem.filter(
        (item) => item.cart.productID == prod.id
      );
      if (cartFound.length) {
        selectedCart.push(...cartFound);
      }
    });
    if (selectedCart.length) {
      selectedCart.forEach((el) => {
        $(`#products-${el.cart.productID}`).collapse('show');
      });
    }
  }

  editByCategory(data: { category: ProductTagOrCategory; cart: Cart[] }) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.modalState = 0;
    this.timeoutId = setTimeout(() => {
      let slideIndex = this.categories.findIndex(
        (cat) => cat.termId === data.category.termId
      );
      this.slickModal.slickGoTo(
        slideIndex - (this.slidesToShow - this.slidesToScroll)
      );
      $('#update-smartship .update-products-nav li div.active').removeClass(
        'active'
      );
      $(
        '#update-smartship .update-products-nav li div[data-target="#tab-' +
          data.category.termId +
          '"]'
      ).tab('show');
      if (data.cart.length) {
        data.cart.forEach((el) => {
          $(`#products-${el.cart.productID}`).collapse('show');
        });
      }
    }, 10);
  }

  slickInit(e: any) {
    this.navigateToSelectedCategory();
    const { slidesToScroll, slidesToShow } = e.slick.options;
    this.slidesToScroll = slidesToScroll;
    this.slidesToShow = slidesToShow;
  }

  breakpoint(e: any) {
    const { slidesToScroll, slidesToShow } = e.slick.options;
    this.slidesToScroll = slidesToScroll;
    this.slidesToShow = slidesToShow;
  }

  onCheckout() {
    $('#bundleBuilderModal').modal('hide');
    const availableOffers = this.offerService.getAvailableOffers(
      this.offers,
      this.currentCartItem,
      this.currentCartItem,
      []
    );
    if (availableOffers.length > 0 && this.forOnetimeVar) {
      this.dataService.setOfferArray(availableOffers, 0);
      this.dataService.changePostName({
        postName: 'pruvit-modal-utilities',
        payload: { key: 'isBundleBuilderCheckout', value: true },
      });
      setTimeout(() => {
        $('#special-offer').modal('show');
      }, 0);
    }else {
      const userInfo = JSON.parse(this.user.mvuser_info);
      const refCode = userInfo?.collection[0]?.code;
      const redirectUrl = this.clientDomain + '/cloud/dashboard';
      this.appCheckoutService.setBundleBuilderCheckoutUrl(
        refCode, 
        redirectUrl, 
        this.selectedCountry, 
        this.selectedLanguage, 
        this.currentCartItem
      );
    }
  }

  // generate Cart object of share product
  private generateCartObject(
    category: ProductTagOrCategory,
    product: Product,
    productVar: ProductVariation,
    quantity: number
  ): Cart {
    const cartObj: any = {};
    cartObj.country = this.currentCountry.toLowerCase();
    cartObj.language = this.selectedLanguage;
    cartObj.orderType = productVar.orderType;
    cartObj.isCurrent = true;
    cartObj.isPromoter = product.isForPromoter;
    cartObj.hasUserRestriction = this.userService.isProductForUSersOnly(
      product.accessLevels
    );
    cartObj.cart = {
      categoryId: category.termId,
      variation: productVar,
      product: product,
      productID: product.id,
      productName: product.title,
      productImageUrl: product.thumbUrl,
      servingsName: productVar.attribute1
        ? this.getAttributeName(productVar.attribute1, product)
        : '',
      caffeineState: productVar.attribute2
        ? this.getAttributeName(productVar.attribute2, product)
        : '',
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
        productVar.customUsers,
        false
      ),
      discountType: this.offerService.getOfferTypeForProduct(
        this.offers,
        productVar.skuObj,
        productVar.orderType
      ),
      offerDiscountPrice: 0,
      isSmartshipDiscountOn: productVar.smartshipDiscountPrice !== 0,
    };
    cartObj.finalPrice = this.getFinalDiscountedPrice(productVar);
    return cartObj as Cart;
  }

  splitOddAndEven(products: Product[]) {
    const oddProd = products.filter((p, i) => !(i % 2));
    const evenProd = products.filter((p, i) => (i % 2));
  
    const returnObject = {
      oddProd,
      evenProd,
    };
  
    return returnObject;
  }

  onChangeCountry(country: string) {
    if(country !== this.selectedCountry) {
      this.selectedCountry = country;
      this.selectedLanguage = '';
      this.dataService.changeSelectedCountry(this.selectedCountry);
      this.categories = [];
      this.getProductsbyCountry();
    }
  }

  private getModalHeaderHeight() {
    let modalHeaderHeight: any = 0;
    let slickHeaderHeight = 0;
    const refreshInterval = setInterval(() => {
      if (modalHeaderHeight === 0 || slickHeaderHeight === 0) {
        modalHeaderHeight = this.bundleBuilderModalHeader.nativeElement.offsetHeight -2;
        slickHeaderHeight = $('#categorySlickCarousel').length ? $('#categorySlickCarousel').outerHeight() : 0;
      } else {
        this.modalHeaderHeight = modalHeaderHeight;
        this.slickHeaderHeight = slickHeaderHeight;
        clearInterval(refreshInterval);
      }
    }, 10);
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.getModalHeaderHeight();
  }

  isUserCanAccess(product: Product) {
    return this.userService.checkUserAccess(
      product.accessLevels,
      product.customUsers,
      false
    );
  }

  getAccessLevelTitle(product: Product) {
    return Object.values(product.accessLevels)
      .filter((a: { on: boolean; title: string }) => a.on)
      .map((a) => a.title)
      .join(', ');
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
