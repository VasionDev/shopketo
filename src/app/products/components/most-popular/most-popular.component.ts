import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { Product } from '../../models/product.model';
import { ProductsUtilityService } from '../../services/products-utility.service';
import { ProductCardComponent } from '../common/product-card/product-card.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-most-popular',
  templateUrl: './most-popular.component.html',
  styleUrls: ['./most-popular.component.css']
})
export class MostPopularComponent implements OnInit {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public mostPopularProducts: Product[] = [];
  @Input() isSmartshipOnly: boolean = true;
  @ViewChildren('childPopular')
  childPopularComponents!: QueryList<ProductCardComponent>;

  selectedLanguage = '';
  selectedCountry = '';
  isLoggedUserExist: boolean = false;
  productsSettings: any;
  currencySymbol = '$';
  isMobileView: boolean = false;

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private productUtilityService: ProductsUtilityService,
    private store: Store<AppState>
  ) {
    this.onMobileCheck();
  }

  onMobileCheck() {
    this.dataService.mobileView$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(res => {
      this.isMobileView = res;
      const isSlickPresent = $('.most-popular').hasClass('slick-initialized');
      if(isSlickPresent) {
        $('.most-popular').slick('unslick');
      }
      if (this.mostPopularProducts.length > 2 && !this.isMobileView) {
        tagSliderJS('most-popular', this.mostPopularProducts.length);
      }
    });
  }

  ngOnInit(): void {
    this.getUser();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getProductSettings();
    this.getCarts();
  }

  getCarts() {
    this.store.select('cartList').subscribe(() => {
      if (this.childPopularComponents) {
        this.childPopularComponents.toArray().forEach((c) => c.manageUserAccess());
      }
    })
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isLoggedUserExist = true;
      }
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(
      (language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
      }
    )
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
    .pipe(takeUntil(this.destroyed$))
    .subscribe((country: string) => {
      this.selectedCountry = country;
    })
  }

  getProductSettings() {
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

      this.productsSettings = data.productsData.product_settings;

      const products = data.products.filter(
        (p) =>
          !p.accessLevels.isCustom.on &&
          (p.categories.length > 0 || p.tags.length > 0) &&
          (!p.accessLevels.isLoggedUser.on || (p.accessLevels.isLoggedUser.on && this.isLoggedUserExist))
      );
      if(this.isSmartshipOnly) {
        this.mostPopularProducts = this.productUtilityService.getMostPopularSmartships(products);
      }else {
        this.mostPopularProducts = products.filter(p=> p.isMostPopular && this.dataService.isProductHasOrderTypeOne(p));
      }

      $(document).ready(() => {
        if (this.mostPopularProducts.length > 2 && !this.isMobileView) {
          tagSliderJS('most-popular', this.mostPopularProducts.length);
        }
      });
      this.getCurrencySymbol();
    })
  }

  getCurrencySymbol() {
    if (this.productsSettings) {
      this.currencySymbol =
      this.productsSettings.exchange_rate !== ''
          ? this.productsSettings.currency_symbol
          : '$';
    }
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(this.isSmartshipOnly);

    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: postName },
    });
  }

  isSoldOut(product: Product) {
    const isAllOutOfStock = this.checkAllAttr2OutOfStock(product);

    if (product) {
      if (product.isSoldOut) {
        return true;
      } else if (isAllOutOfStock) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getSoldOutText(product: Product) {
    const isAllOutOfStock = this.checkAllAttr2OutOfStock(product);

    let soldOutText = '';

    if (product) {
      if (product.isSoldOut) {
        if (product.sellingClosedText !== '') {
          soldOutText = product.sellingClosedText;
        } else {
          soldOutText = '';
          this.translate.get('currently-sold-out').subscribe((res: string) => {
            soldOutText = res;
          });
        }
      } else if (isAllOutOfStock) {
        soldOutText = '';
        this.translate.get('out-of-stock').subscribe((res: string) => {
          soldOutText = res;
        });
      }
    }

    return soldOutText;
  }

  checkAllAttr2OutOfStock(product: Product) {
    if(this.isSmartshipOnly) {
      let isAllAttr1OutOfStock = true;
      product.variations.forEach((variation) => {
        if (variation.orderType === 'ordertype_2') {
          if (!variation.isOutOfStock) {
            isAllAttr1OutOfStock = false;
          }
        }
      });
      return isAllAttr1OutOfStock;
    }else {
      return product.isAllVariationOutOfStock;
    }
  }

  isBothPricesSame(product: Product) {
    const discountPrice = this.getSmartshipDiscountPrice(product);
    const originalPrice = this.getOriginalPrice(product);

    return discountPrice === originalPrice;
  }

  getSmartshipDiscountPrice(product: Product) {
    let minPrice = Number.MAX_SAFE_INTEGER;

    product.variations.forEach((variation) => {
      if (variation.orderType === 'ordertype_2') {
        if (variation.price < minPrice) {
          minPrice = variation.price;
        }
      }
    });

    if (minPrice === Number.MAX_SAFE_INTEGER) {
      minPrice = 0;
    }

    return this.getNumFormat(this.getExchangedPrice(minPrice));
  }

  getOriginalPrice(product: Product) {
    let minPrice = Number.MAX_SAFE_INTEGER;

    product.variations.forEach((variation) => {
      if (variation.orderType === 'ordertype_1') {
        if (variation.price < minPrice) {
          minPrice = variation.price;
        }
      }
    });

    if (minPrice === Number.MAX_SAFE_INTEGER) {
      minPrice = 0;
    }

    return this.getNumFormat(this.getExchangedPrice(minPrice));
  }

  getNumFormat(num: number) {
    if (isNaN(num)) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      return num.toFixed(2);
    }
  }

  getExchangedPrice(price: number) {
    let finalPrice = 0;
    
    if(this.productsSettings) {
      const exchangedPrice =
      this.productsSettings.exchange_rate !== ''
        ? +this.productsSettings.exchange_rate * price
        : price;

      finalPrice =
        this.productsSettings.tax_rate !== '' && +this.productsSettings.tax_rate !== 0
        ? exchangedPrice + (exchangedPrice * +this.productsSettings.tax_rate) / 100
        : exchangedPrice;
    }
    return finalPrice;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
