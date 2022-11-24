import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { Product } from '../../models/product.model';
import { ProductSettings } from '../../models/product-settings.model';
import { PromoterService } from '../../services/promoter.service';
import { ProductCardComponent } from '../common/product-card/product-card.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-promoter',
  templateUrl: './promoter.component.html',
  styleUrls: ['./promoter.component.css'],
})
export class PromoterComponent implements OnInit, OnDestroy {
  @ViewChildren('child') childComponents!: QueryList<ProductCardComponent>;
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  refCode = '';
  productsData: any = {};
  promoterProducts: Product[] = [];
  limitedPromoterStartingPrice = 0;
  limitedPromoterProducts: Product[] = [];
  productSettings = {} as ProductSettings;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    public utilityService: AppUtilityService,
    private router: Router,
    private promoterService: PromoterService,
    private appUtilityService: AppUtilityService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCarts();
    this.getUser();
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = height;
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

  getCarts() {
    this.subscriptions.push(
      this.store.select('cartList').subscribe(() => {
        this.setUserAccess();
      })
    );
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.setUserAccess();
      }
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

        this.productSettings = data.productSettings;
        this.defaultLanguage = data.productsData.default_lang;
        this.productsData = data.productsData;

        const products = data.products.filter(
          (p) =>
            !p.accessLevels.isCustom.on &&
            (p.categories.length > 0 || p.tags.length > 0)
        );

        this.getPromoters(products);
        this.getLimitedPromoters(products);
        this.getLimitedPromoterStartingPrice();

        $(document).ready(() => {
          tooltipJS();
        });
      })
    );
  }

  getPromoterBenefits(bannerDescription: string) {
    return bannerDescription.includes('<br>')
      ? bannerDescription.split('<br>')
      : bannerDescription.split(',');
  }

  getPromoters(products: Product[]) {
    this.promoterProducts = this.promoterService.getPromoters(products, false);
  }

  getLimitedPromoters(products: Product[]) {
    this.limitedPromoterProducts = this.promoterService.getPromoters(
      products,
      true
    );
  }

  isPromoterMini(promoter: Product) {
    if (promoter) {
      if (promoter.title.includes('mini') || promoter.name.includes('mini')) {
        return true;
      }
    }
    return false;
  }

  getLimitedPromoterStartingPrice() {
    let minPrice = Number.MAX_SAFE_INTEGER;

    this.limitedPromoterProducts.forEach((promoter) => {
      const price = this.getPromoterStartingPrice(promoter);

      minPrice = Math.min(minPrice, price);
    });

    this.limitedPromoterStartingPrice =
      minPrice !== Number.MAX_SAFE_INTEGER ? minPrice : 0;
  }

  getPromoterStartingPrice(promoter: Product) {
    if (promoter) {
      return promoter.finalPrice !== 0
        ? promoter.finalPrice
        : promoter.originalPrice;
    } else {
      return 0;
    }
  }

  getPromoterFee() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;

      return +productsSettings.new_promoter_price;
    } else {
      return 0;
    }
  }

  onClickPromoter(product: Product) {
    const oneTimeVariations = this.promoterService.getVariations(
      product.variations
    );

    if (oneTimeVariations.length === 1) {
      const isInvalidSupplement =
        this.appUtilityService.isIncompatibleCheckout(false);

      if (isInvalidSupplement) {
        this.dataService.changePostName({ postName: 'purchase-modal' });
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

  onClickPromoterFee() {
    const isInvalidSupplement =
      this.appUtilityService.isIncompatibleCheckout(false);

    if (isInvalidSupplement) {
      this.dataService.changePostName({ postName: 'purchase-modal' });
      $('#PurchaseWarningModal').modal('show');
    } else {
      this.promoterService.onPromoterAddToCart(
        this.selectedCountry,
        this.selectedLanguage,
        null,
        [],
        this.productSettings
      );

      $('.drawer').drawer('open');
    }
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

  get limitedPromoterMarkets() {
    if (
      this.selectedCountry === 'US' ||
      this.selectedCountry === 'CA' ||
      this.selectedCountry === 'AU' ||
      this.selectedCountry === 'NZ'
    ) {
      return true;
    } else {
      return false;
    }
  }

  get isAsianMarkets() {
    if (
      this.selectedCountry === 'HK' ||
      this.selectedCountry === 'MO' ||
      this.selectedCountry === 'MY' ||
      this.selectedCountry === 'SG'
    ) {
      return true;
    } else {
      return false;
    }
  }

  private setUserAccess() {
    if (this.childComponents) {
      this.childComponents.toArray().forEach((c) => c.manageUserAccess());
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
