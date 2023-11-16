import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ProductVariation } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { Cart } from 'src/app/shared/models/cart.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

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

  constructor(
    private promoterService: PromoterService,
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private userService: AppUserService,
    private offerService: AppOfferService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.isContactSuccess = history.state.contactSuccess ? true : false;
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
        this.offers = data.offers;
        const found = data.products.find((item: any) => {
          const regex = /challenge-pack/i;
          return item.categories.some((el: any) => {
            return el.slug.match(regex);
          });
        });
        if (found) this.product = found;
      });
  }

  onClickAddToCart(product: Product) {
    const { ordertype_1, ordertype_3 } =
      this.promoterService.getOnetimeAndEveryMonthVariations(
        product.variations
      );
    const productVariation = ordertype_1[0];
    console.log(productVariation);
    const cartDataWithLanguages: Cart[] = this.generateCartWithLanguages(
      productVariation,
      product
    );

    const isProductHasSmartshipDiscount: boolean =
      productVariation.smartshipDiscountPrice !== 0 ? true : false;

    if (
      this.product?.isForPromoter &&
      this.productSettings.isPromoterEnabled &&
      this.productSettings.promoterSku
    ) {
      cartDataWithLanguages.forEach((cartData) => {
        cartData.isPromoter = true;
      });
      if (product.promoterSku !== '') {
        const promoterFee: Cart =
          this.promoterService.getPromoterFeeCartLadyboss(
            this.selectedCountry,
            this.selectedLanguage,
            this.productSettings,
            product.promoterSku
          );
        cartDataWithLanguages.push(promoterFee);
      }
    }

    const isUserCanAccess = this.userService.checkUserAccess(
      productVariation.accessLevels,
      productVariation.customUsers
    );

    const isSmartshipUserCanAccess = this.userService.checkSmartshipUserAccess(
      isProductHasSmartshipDiscount
    );

    if (
      (product?.isForPromoter || isProductHasSmartshipDiscount) &&
      !(this.everyMonthCart.length > 0 || isSmartshipUserCanAccess) &&
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

      if (product.showRelatedProducts && product.relatedProducts.length > 0) {
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
      hasUserRestriction: false,
      cart: {
        productID: product?.id,
        productName: product?.title,
        productImageUrl: product?.thumbUrl,
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

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
