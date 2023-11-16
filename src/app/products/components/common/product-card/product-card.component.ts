import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductVariation } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { ProductsFormService } from 'src/app/products/services/products-form.service';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppTagManagerService } from 'src/app/shared/services/app-tag-manager.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
declare var $: any;
declare var tooltipJS: any;
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent implements OnChanges, OnInit, OnDestroy {
  @Input() product = {} as Product;
  @Input() isPromoter = false;
  @Input() isLearnPage = false;
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  productSettings = {} as ProductSettings;
  isUserCanAccess = true;
  accessLevelTitle = '';
  isEveryoneAccess = true;
  subscriptions: SubscriptionLike[] = [];
  tenant: string;

  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService,
    private promoterService: PromoterService,
    private userService: AppUserService,
    private productFormService: ProductsFormService,
    private changeDetectionRef: ChangeDetectorRef,
    private tagManager: AppTagManagerService
  ) {
    this.tenant = environment.tenant;
    this.getProducts();
    this.getSelectedCountry();
    $(document).ready(() => {
      tooltipJS();
    });
  }

  ngOnChanges(): void {
    this.manageUserAccess();
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
  }

  manageUserAccess() {
    const { price, discount, variation } = this.productFormService.getProductPrice(
      this.product.variations
    );
    
    if(this.tenant === 'pruvit') {
      const finalDiscount = this.getApplicableVipDiscount(discount, variation);
      this.product.finalPrice = this.getProductBestPrice(finalDiscount, price);
    }else {
      this.product.finalPrice = this.getProductBestPrice(discount, price);
    }

    this.isUserCanAccess = this.userService.checkUserAccess(
      this.product.accessLevels,
      this.product.customUsers
    );

    this.accessLevelTitle = Object.values(this.product.accessLevels)
      .filter((a: { on: boolean; title: string }) => a.on)
      .map((a) => a.title)
      .join(', ');

    const isNoAccessSelected = Object.values(this.product.accessLevels).every(
      (a: { on: boolean }) => a.on === false
    );

    this.isEveryoneAccess =
      isNoAccessSelected || this.product.accessLevels.isEveryone.on;

    this.changeDetectionRef.markForCheck();
  }

  private getApplicableVipDiscount(discount: number, variation: ProductVariation) {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    const user = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    let activeSmartshipExist: boolean = false;
    if (user) {
      activeSmartshipExist = user?.mvuser_scopes.includes('smartship');
    }
    const localEveryMonthCart = localStorage.getItem('EveryMonth');
    const everyMonthCart = localEveryMonthCart ? JSON.parse(localEveryMonthCart) : [];
    const filterEveryMonthCart = everyMonthCart.filter((cart: any) => (
      cart.country.toLowerCase() === this.selectedCountry.toLowerCase())
    );
    
    if(
      (
        variation.skuObj.oneTime !== 'PRU-700-005' && 
        variation.skuObj.oneTime !== 'PRU-700-006' &&
        variation.skuObj.oneTime !== 'PRU-KOOZIE-001-ONCE'
      ) && 
      this.productSettings.smartshipDiscountOnTodays && 
      (filterEveryMonthCart.length || activeSmartshipExist) && 
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

        this.productSettings = data.productSettings;
        this.productsData = data.productsData;
      })
    );
  }

  private getProductBestPrice(discount: number, price: number) {
    const cartTotalDiscount = this.getCartTotalDiscountedPrice(
      this.product.variations
    );

    if (discount === 0) {
      if (cartTotalDiscount === 0) {
        return price;
      } else {
        return cartTotalDiscount;
      }
    } else {
      if (cartTotalDiscount === 0) {
        return discount;
      } else {
        const minDiscount = Math.min(discount, cartTotalDiscount);
        return minDiscount;
      }
    }
  }

  private getCartTotalDiscountedPrice(variations: ProductVariation[]) {
    let minDiscountedPrice = Number.MAX_SAFE_INTEGER;

    const allCartTotalDiscounts: Array<{ sku: string; percent: number }> = [];

    const cartTotalDiscount = this.productsData.cart_total_discount;

    const cartTotalDiscountOneTime: any[] = cartTotalDiscount?.onetime;

    if (cartTotalDiscountOneTime) {
      cartTotalDiscountOneTime.forEach((discount: any) => {
        const skuObj = discount?.cart_total_discounted_sku;

        if (
          skuObj &&
          discount.cart_total_settings.hasOwnProperty('show_in_catalog') &&
          discount.cart_total_settings.show_in_catalog
        ) {
          Object.entries(skuObj).forEach((element: any[]) => {
            allCartTotalDiscounts.push({
              sku: element[1].sku,
              percent: +element[1].price,
            });
          });
        }
      });
    }

    const cartTotalDiscountEveryMonth: any[] = cartTotalDiscount?.smartship;

    if (cartTotalDiscountEveryMonth) {
      cartTotalDiscountEveryMonth.forEach((discount: any) => {
        const skuObj = discount?.smartship_cart_total_discounted_sku;

        if (
          skuObj &&
          discount.smartship_cart_total_settings.hasOwnProperty(
            'show_in_catalog'
          ) &&
          discount.smartship_cart_total_settings.show_in_catalog
        ) {
          Object.entries(skuObj).forEach((element: any[]) => {
            allCartTotalDiscounts.push({
              sku: element[1].sku,
              percent: +element[1].price,
            });
          });
        }
      });
    }

    variations.forEach((variation) => {
      if (variation.orderType === 'ordertype_1') {
        allCartTotalDiscounts.forEach((skuObj) => {
          if (skuObj.sku === variation.sku) {
            const discount =
              variation.price - (skuObj.percent / 100) * variation.price;

            minDiscountedPrice = Math.min(minDiscountedPrice, discount);
          }
        });
      }
    });

    return minDiscountedPrice !== Number.MAX_SAFE_INTEGER
      ? minDiscountedPrice
      : 0;
  }

  onLogin() {
    this.userService.login();
  }

  onClickAccessLevel() {
    this.dataService.changePostName({
      postName: 'access-level-modal',
      payload: { key: 'accessLevels', value: this.product.accessLevels },
    });
    $('#accessLevelModal').modal('show');
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);
    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: postName },
    });
  }

  onClickPromoter(product: Product) {
    const oneTimeVariations = this.promoterService.getVariations(
      product.variations
    );

    if (oneTimeVariations.length === 1) {
      const isInvalidSupplement =
        this.utilityService.isIncompatibleCheckout(false);

      if (isInvalidSupplement) {
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

        const routeURL = '/smartship';

        this.utilityService.navigateToRoute(routeURL);
      }
    } else {
      const routeURL = '/promoter/' + product.name;

      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onClickProductImage(product: Product) {
    if (product && !this.isPromoter) {
      if(this.tenant === 'pruvit') {
        this.tagManager.viewItemEvent(product, this.selectedCountry);
      }
      const routeURL = '/product/' + product.name;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
