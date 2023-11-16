import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductVariation } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { Cart } from 'src/app/shared/models/cart.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.css'],
})
export class UpgradeComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  product: Product | null = null;
  offers: Offer[] = [];
  selectedLanguage: string = '';
  selectedCountry: string = '';
  isContactSuccess: boolean = false;
  productSettings = {} as ProductSettings;
  everyMonthCart: Cart[] = [];
  isOfferChecked = false;
  isUserLoggedIn = false;
  userAvatar = '';
  currProductSlug = 'maintainIt';
  currProduct!:any;
  isOneTimeClicked = false;
  referrer: any = {};
  user: any;

  products = [
    {
      id: 1,
      slug: 'maintainIt',
      title: 'MAINTAIN it!',
      servings: '1 Shake/Day',
      orderType: 'ordertype_1',
      thumb: 'https://statics.myclickfunnels.com/image/563942/file/223f933f9d834eabf510f749bda7a351.png',
      price: { oneTime: 77, everyMonth: 0 },
      quantity: 10,
      offerQty: 1,
      variation1Qty: 0,
      variation2Qty: 0,
      totalVariationQty: 0,
      sku: { everyMonth: '', oneTime: 'LBH-5-001-1-20-ONCE-1PACK' },
    },
    {
      id: 2,
      slug: 'toneIt',
      title: 'TONE it!',
      servings: '2 Shakes/Day',
      orderType: 'ordertype_1',
      thumb: 'https://statics.myclickfunnels.com/image/563944/file/935dc47ad45603e7b67a11743a1bf59f.png',
      price: { oneTime: 147, everyMonth: 0 },
      quantity: 10,
      offerQty: 2,
      variation1Qty: 0,
      variation2Qty: 0,
      totalVariationQty: 0,
      sku: { everyMonth: '', oneTime: 'LBH-5-001-1-20-ONCE-2PACK' },
    },
    {
      id: 3,
      slug: 'loseIt',
      title: 'LOSE it!',
      servings: '3 Shakes/Day',
      orderType: 'ordertype_1',
      thumb: 'https://statics.myclickfunnels.com/image/563943/file/e547e31195bf7d898b2df085364f60ce.png',
      price: { oneTime: 217, everyMonth: 0 },
      quantity: 10,
      offerQty: 3,
      variation1Qty: 0,
      variation2Qty: 0,
      totalVariationQty: 0,
      sku: { everyMonth: '', oneTime: 'LBH-5-001-1-20-ONCE-3PACK' },
    },
    {
      id: 4,
      slug: 'maintainIt',
      title: 'MAINTAIN it!',
      servings: '1 Shake/Day',
      orderType: 'ordertype_3',
      thumb: 'https://statics.myclickfunnels.com/image/563942/file/223f933f9d834eabf510f749bda7a351.png',
      price: { oneTime: 77, everyMonth: 67 },
      quantity: 5,
      offerQty: 1,
      variation1Qty: 0,
      variation2Qty: 0,
      totalVariationQty: 0,
      sku: {
        everyMonth: 'LBH-5-001-1-20-RENEW-1PACK',
        oneTime: 'LBH-5-001-1-20-ONCE-1PACK',
      },
    },
    {
      id: 5,
      slug: 'toneIt',
      title: 'TONE it!',
      servings: '2 Shakes/Day',
      orderType: 'ordertype_3',
      thumb: 'https://statics.myclickfunnels.com/image/563944/file/935dc47ad45603e7b67a11743a1bf59f.png',
      price: { oneTime: 147, everyMonth: 127 },
      quantity: 5,
      offerQty: 2,
      variation1Qty: 0,
      variation2Qty: 0,
      totalVariationQty: 0,
      sku: {
        everyMonth: 'LBH-5-001-1-20-RENEW-2PACK',
        oneTime: 'LBH-5-001-1-20-ONCE-2PACK',
      },
    },
    {
      id: 6,
      slug: 'loseIt',
      title: 'LOSE it!',
      servings: '3 Shakes/Day',
      orderType: 'ordertype_3',
      thumb: 'https://statics.myclickfunnels.com/image/563943/file/e547e31195bf7d898b2df085364f60ce.png',
      price: { oneTime: 217, everyMonth: 187 },
      quantity: 5,
      offerQty: 3,
      variation1Qty: 0,
      variation2Qty: 0,
      totalVariationQty: 0,
      sku: {
        everyMonth: 'LBH-5-001-1-20-RENEW-3PACK',
        oneTime: 'LBH-5-001-1-20-ONCE-3PACK',
      },
    },
  ];

  offer5DaykitProduct = {
    id: 7,
    title: '5-Day Cake Challenge Kit',
    servings: '5-Day',
    orderType: 'ordertype_1',
    thumb: 'https://statics.myclickfunnels.com/image/564343/file/e2428dfe38508e672e6d3b078496c432.png',
    price: { oneTime: 39, everyMonth: 17 },
    quantity: 1,
    sku: {
      everyMonth: '',
      oneTime: 'LBH-500-015-ONCE',
    },
  };

  offerLeanProduct = {
    id: 8,
    title: 'Vanilla Cake LEAN',
    servings: '1 Box - 20 Servings',
    orderType: 'ordertype_2',
    thumb: 'https://demodashboard.ladyboss.io/wp-content/uploads/2023/01/VCL_Hero.jpg',
    price: { oneTime: 77, everyMonth: 67 },
    quantity: 5,
    sku: {
      everyMonth: 'LBH-5-001-1-20-RENEW',
      oneTime: '',
    },
  };

  leanProduct!: Product;
  leanProductVars:any = [];

  constructor(
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private offerService: AppOfferService,
    private translate: TranslateService,
    private appCheckoutService: AppCheckoutService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getUserAvatar();
    this.getReferrer();
    this.isContactSuccess = history.state.contactSuccess ? true : false;
  }

  getReferrer() {
    this.dataService.currentReferrerData$.pipe(takeUntil(this.destroyed$)).subscribe((referrer: any) => {
      if (referrer) {
        this.referrer = referrer;
      }
    });
  }

  getUserAvatar() {
    this.dataService.currentUserWithScopes$.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.isUserLoggedIn = true;
        const userInfo = JSON.parse(user.mvuser_info);
        const imageUrl = userInfo?.collection[0]?.imageUrl;
        this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
      } else {
        this.isUserLoggedIn = false;
      }
    });
  }

  onClickAvatar() {
    this.dataService.changeSidebarName('account');
    $('.drawer').drawer('open');
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
        this.getProducts();
      });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country: string) => {
        this.selectedCountry = country;
      });
  }

  getProducts() {
    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }
        this.productSettings = data.productSettings;
        const ind = data.products.findIndex((item: any) => item.title.toLowerCase().includes('ladyboss lean'));
        if(ind !== -1) {
           this.leanProduct = data.products[ind];
          const attribute1Keys: any = [];
          this.leanProduct.servings[0].servingAttributes.forEach((attr: any) => {
            if(attr.name.toLowerCase().includes('vanilla')) attribute1Keys.push(attr.key);
            if(attr.name.toLowerCase().includes('brownie batter')) attribute1Keys.push(attr.key);
          });        
          const attribute2Key = this.leanProduct.servings.length > 1 ? this.leanProduct.servings[1].servingAttributes[0].key : '';
          this.leanProduct.variations.forEach((variation: any) => {
            if(
              attribute1Keys.includes(variation.attribute1) && 
              variation.attribute2 === attribute2Key && 
              variation.orderType === 'ordertype_3'
            ) 
              this.leanProductVars.push(variation);
          });
        }
      });
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  onAddVar1Qty() {
    this.currProduct.variation1Qty += 1; 
    this.currProduct.totalVariationQty += 1;
    if(this.currProduct.totalVariationQty === this.currProduct.offerQty) this.loadTooltip();
  }

  onRemoveVar1Qty() {
    this.currProduct.variation1Qty -= 1;
    this.currProduct.totalVariationQty -= 1;
  }

  onAddVar2Qty() {
    this.currProduct.variation2Qty += 1; 
    this.currProduct.totalVariationQty += 1;
    if(this.currProduct.totalVariationQty === this.currProduct.offerQty) this.loadTooltip();
  }

  onRemoveVar2Qty() {
    this.currProduct.variation2Qty -= 1;
    this.currProduct.totalVariationQty -= 1;
  }

  onClickOfferCheckBox() {
    this.isOfferChecked = !this.isOfferChecked;
  }

  onClickRadioCheckbox(slug: string) {
    this.currProductSlug = slug;
    const ind = this.products.findIndex((item) => {
      return (this.isOneTimeClicked && slug === item.slug && item.orderType === 'ordertype_1') || 
      (!this.isOneTimeClicked && slug === item.slug && item.orderType === 'ordertype_3');
    });
    this.currProduct = this.products[ind];
  }

  onClickAddToCart(id: number, ind: number) {
    if(id > 3) this.isOneTimeClicked = false; 
    else this.isOneTimeClicked = true; 
    this.currProduct = this.products[ind];
    this.currProductSlug = this.products[ind].slug;
    $('#cake-bundle-builder').modal('show');
  }

  onClickBuyNow(productVar: any) {
    productVar.orderType = this.isOneTimeClicked ? 'ordertype_1' : 'ordertype_3';
    const cartDataWithLanguages = this.generateCartWithLanguagesForLean(
      productVar,
      this.leanProduct,
      1
    );
    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    this.dataService.changeSidebarName('checkout-cart');
    $('#cake-bundle-builder').modal('hide');
    $('.drawer').drawer('open');
  }

  onAddToCartWithBundle() {
    let cartDataWithLanguages: Cart[];
    if(this.currProduct?.variation1Qty > 0) {
      this.leanProductVars[1].orderType = this.isOneTimeClicked ? 'ordertype_1' : 'ordertype_3'; 
      cartDataWithLanguages = this.generateCartWithLanguagesForLean(
        this.leanProductVars[1],
        this.leanProduct,
        this.currProduct?.variation1Qty
      );
      this.utilityService.setCarts(
        cartDataWithLanguages,
        this.selectedCountry,
        this.selectedLanguage
      );
    }
    if(this.currProduct?.variation2Qty > 0) {
      this.leanProductVars[0].orderType = this.isOneTimeClicked ? 'ordertype_1' : 'ordertype_3'; 
      cartDataWithLanguages = this.generateCartWithLanguagesForLean(
        this.leanProductVars[0],
        this.leanProduct,
        this.currProduct?.variation2Qty
      );
      this.utilityService.setCarts(
        cartDataWithLanguages,
        this.selectedCountry,
        this.selectedLanguage
      );
    }
    this.dataService.changeSidebarName('checkout-cart');
    $('#cake-bundle-builder').modal('hide');
    $('.drawer').drawer('open');
  }

  onClickBuyNowOneTime(ind: number) {
    const product = this.products[ind];

    const cartDataWithLanguages: Cart[] = this.generateCartWithLanguages(product);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    this.dataService.changeSidebarName('checkout-cart');
    $('.drawer').drawer('open');
    
  }

  onClickBuyNowSmartShip(ind: number) {
    const product = this.products[ind];

    $('#cake-bundle-builder').modal('show');

    const cartDataWithLanguages: Cart[] = this.generateCartWithLanguages(product);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    const cartDataWithLanguages1= this.generateCartWithLanguagesForLean(this.leanProductVars[0], this.leanProduct, 1);

    this.utilityService.setCarts(
      cartDataWithLanguages1,
      this.selectedCountry,
      this.selectedLanguage
    );

    this.dataService.changeSidebarName('checkout-cart');
    $('.drawer').drawer('open');
    
  }

  onClickBuyNowOfferProduct() {
    const product = this.offer5DaykitProduct;
    let cartDataWithLanguages: Cart[];

    cartDataWithLanguages = this.generateCartWithLanguages(product);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    cartDataWithLanguages= this.generateCartWithLanguages(this.offerLeanProduct);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    //this.dataService.changeSidebarName('checkout-cart');
    //$('.drawer').drawer('open');

    const localContact = sessionStorage.getItem('Contact');
    const contact = localContact ? JSON.parse(localContact) : null;
      
    if (contact !== null) {
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
    } else if (!this.user) {
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

  /* --------- add to cart section ------------- */
  private generateCartWithLanguages(product: any) {
    const cartDataWithLanguages: Cart[] = [];
    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: product.orderType,
      isCurrent: true,
      isPromoter: false,
      hasUserRestriction: false,
      cart: {
        productID: product?.id,
        productName: product?.title,
        productImageUrl: product?.thumb,
        servingsName: product.servings,
        caffeineState: '',
        totalQuantity: product.quantity,
        quantity: 1,
        price: product.price,
        discountPrice: product.price.everyMonth,
        productSku: product.sku,
        discountPercent: 0,
        smartshipDiscountPrice: 0,
        smartshipDiscountPercent: 0,
        isUserCanAccess: true,
        discountType: 'SKU_PURCHASE',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: false,
      },
      finalPrice: 0,
    });

    return cartDataWithLanguages;
  }

  private generateCartWithLanguagesForLean(productVar: ProductVariation, product: any, quantity: number) {
    const cartDataWithLanguages: Cart[] = [];
    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: productVar.orderType,
      isCurrent: true,
      isPromoter: false,
      hasUserRestriction: false,
      cart: {
        productID: product?.id,
        productName: product?.title,
        productImageUrl: productVar?.variationImage ? productVar?.variationImage : product?.thumbUrl,
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
        productSku: productVar.skuObj,
        discountPercent: productVar.discountPercent,
        smartshipDiscountPrice: productVar.smartshipDiscountPrice,
        smartshipDiscountPercent: productVar.smartshipDiscountPercent,
        isUserCanAccess: true,
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

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
