import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { Product } from 'src/app/products/models/product.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
declare var $: any;
declare var gallerySliderJS: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-phoenix',
  templateUrl: './phoenix.component.html',
  styleUrls: ['./phoenix.component.css'],
})
export class PhoenixComponent implements OnInit {
  tenant: string = '';
  discountHeight = 0;
  subscriptions: SubscriptionLike[] = [];
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  refCode = '';
  productsData: any = {};
  promoterProducts: Product[] = [];
  product: Product | null = null;
  promoterBenefits: string[] = [];
  offers: Offer[] = [];
  limitedPromoterStartingPrice = 0;
  limitedPromoterProducts: Product[] = [];
  productSettings = {} as ProductSettings;

  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService,
    private translate: TranslateService,
    private router: Router,
    private promoterService: PromoterService,
    private offerService: AppOfferService
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = this.tenant === 'ladyboss' ? height + 0 : height;
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
        this.defaultLanguage = data.productsData.default_lang;
        this.productsData = data.productsData;
        this.offers = data.offers;

        const products = data.products.filter(
          (p) =>
            !p.accessLevels.isCustom.on &&
            (p.categories.length > 0 || p.tags.length > 0)
        );

        this.getPromoters(products);

        $(document).ready(() => {
          tooltipJS();
        });
      })
    );
  }

  getPromoters(products: Product[]) {
    this.promoterProducts = this.promoterService.getPromoters(products, false);
    this.getCurrentPromoterProduct(this.promoterProducts);
  }

  getCurrentPromoterProduct(products: Product[]) {
    const found = products.find(
      (prod) => prod.promoterBtnUrl === this.router.url
    );
    this.product = found ? found : null;
    if (this.product) {
      this.getProductGallery();
      this.promoterBenefits = this.product.bannerDiscription.includes('<br>')
        ? this.product.bannerDiscription.split('<br>')
        : this.product.bannerDiscription.split(',');
    }
  }

  /* ----------- image slider ------------- */
  getProductGallery() {
    if (this.product) {
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
            gallerySliderJS(this.product?.customGallery.length);

            $('.sk-product-slider-for').slick('setPosition');
          }, 0);
        });
      }
    }
  }

  getTotalPrice() {
    if (this.product) {
      return +this.product.originalPrice + +this.productSettings.promoterPrice;
    } else {
      return 0;
    }
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

  onClickShopAll() {
    const shopAllSlug = 'shop-all';
    this.utilityService.navigateToRoute('/category/' + shopAllSlug);
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onClickPromoter() {
    if (this.product) {
      const oneTimeVariations = this.promoterService.getVariations(
        this.product.variations
      );
      if (oneTimeVariations.length === 1) {
        const isInvalidSupplement =
          this.utilityService.isIncompatibleCheckout(false);

        if (isInvalidSupplement && this.tenant !== 'ladyboss') {
          this.dataService.changePostName({ postName: 'purchase-modal' });
          $('#PurchaseWarningModal').modal('show');
        } else {
          this.promoterService.onPromoterAddToCart(
            this.selectedCountry,
            this.selectedLanguage,
            this.product,
            oneTimeVariations[0],
            this.productSettings
          );

          if (this.tenant === 'ladyboss') {
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
          } else {
            this.dataService.setOfferFlowStatus(true);
            const routeURL = '/smartship';
            this.utilityService.navigateToRoute(routeURL);
          }
        }
      } else {
        const routeURL =
          this.tenant === 'ladyboss'
            ? '/champion/' + this.product.name
            : '/promoter/' + this.product.name;
        this.utilityService.navigateToRoute(routeURL);
      }
    }
  }
}
