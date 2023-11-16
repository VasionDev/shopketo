import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { Product } from 'src/app/products/models/product.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { Offer } from 'src/app/shared/models/offer.model';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-brand-builder',
  templateUrl: './brand-builder.component.html',
  styleUrls: ['./brand-builder.component.css'],
})
export class BrandBuilderComponent implements OnInit, OnDestroy {
  tenant: string = '';
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  refCode = '';
  variations: any[] = [];
  offers: Offer[] = [];
  product = {} as Product;
  productsData: any = {};
  productSettings = {} as ProductSettings;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    public utilityService: AppUtilityService,
    private offerService: AppOfferService,
    private router: Router,
    private route: ActivatedRoute,
    public promoterService: PromoterService,
    private appUtilityService: AppUtilityService
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = this.tenant === 'ladyboss' ? height + 20 : height;
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);

          this.getProducts();
        }
      )
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
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
        this.productsData = data.productsData;
        this.offers = data.offers;

        const products = data.products.filter(
          (p) =>
            !p.accessLevels.isCustom.on &&
            (p.categories.length > 0 || p.tags.length > 0)
        );

        this.productSettings = data.productSettings;
        this.getProduct(products);
      })
    );
  }

  getProduct(products: Product[]) {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.product = {} as Product;

        products.forEach((product) => {
          if (product.name === params['id']) {
            this.product = product;

            this.variations = this.promoterService.getVariations(
              this.product.variations
            );

            this.loadTooltip();
          }
        });
      })
    );
  }

  getOriginalPrice(variationObj: any[]) {
    let price = 0;

    variationObj.forEach((item: { key: string; value: any }) => {
      if (item.key === 'price') {
        price = item.value;
      }
    });

    return price;
  }

  getDiscountPrice(variationObj: any[]) {
    let finalPrice = 0;
    let price = 0;
    let discountPrice = 0;
    let smartshipDiscountPrice = 0;

    variationObj.forEach((item: { key: string; value: any }) => {
      if (item.key === 'discountPrice') {
        discountPrice = item.value;
      }
      if (item.key === 'smartshipDiscountPrice') {
        smartshipDiscountPrice = item.value;
      }
      if (item.key === 'price') {
        price = item.value;
      }
    });

    if (discountPrice !== 0) {
      if (smartshipDiscountPrice !== 0) {
        finalPrice =
          discountPrice > smartshipDiscountPrice
            ? smartshipDiscountPrice
            : discountPrice;
      } else {
        finalPrice = discountPrice;
      }
    } else {
      if (smartshipDiscountPrice !== 0) {
        finalPrice = smartshipDiscountPrice;
      } else {
        finalPrice = price;
      }
    }

    return finalPrice;
  }

  isBothPricesSame(variationObj: any[]) {
    const discountPrice = this.getDiscountPrice(variationObj);
    const originalPrice = this.getOriginalPrice(variationObj);

    return discountPrice === originalPrice;
  }

  getVariationImage(variationObj: any[]) {
    let imageUrl = this.promoterService.getAttributeValue(
      variationObj,
      'variationImage'
    );

    return imageUrl;
  }

  getServingName(variationObj: any[]) {
    return this.promoterService.getServingName(variationObj, this.product);
  }

  getCaffeineStateName(variationObj: any[]) {
    return this.promoterService.getCaffeineStateName(
      variationObj,
      this.product
    );
  }

  onClickBuyNow(variationObj: any[]) {
    const isInvalidSupplement =
      this.appUtilityService.isIncompatibleCheckout(false);

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      const variationSku = this.promoterService.getAttributeValue(
        variationObj,
        'sku'
      );

      if (variationSku.includes('CAM-2912-MXC-01')) {
        this.dataService.setPulseProProduct(this.product);

        this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
        $('#pulse-pro').modal('show');
      } else {
        this.promoterService.onPromoterAddToCart(
          this.selectedCountry,
          this.selectedLanguage,
          this.product,
          variationObj,
          this.productSettings
        );

        if(this.tenant === 'ladyboss') {
          if (
            this.product.showRelatedProducts &&
            this.product.relatedProducts.length > 0
          ) {
            this.dataService.changeSidebarName('add-to-cart');
          } else {
            this.dataService.changeSidebarName('checkout-cart');
          }

          const cartOneTime = this.utilityService.getOneTimeStorage(
            this.selectedCountry.toLowerCase(),
            this.selectedLanguage
          );
    
          const cartEveryMonth = this.utilityService.getEveryMonthStorage(
            this.selectedCountry.toLowerCase(),
            this.selectedLanguage
          );
    
          const availableOffers = this.offerService.getAvailableOffers(
            this.offers,
            [],
            cartOneTime,
            cartEveryMonth
          );
          if(availableOffers.length > 0) {
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
        }else {
          this.dataService.setOfferFlowStatus(true);
          const routeURL = '/smartship';
          this.utilityService.navigateToRoute(routeURL);
        }
      }
    }
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onClickPromoter() {
    const navigatorPath = this.tenant === 'ladyboss' ? '/champion': '/promoter';
    this.utilityService.navigateToRoute(navigatorPath);
  }

  getTooltipPlacement() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      return 'bottom';
    } else {
      return 'right';
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
