import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, SubscriptionLike } from 'rxjs';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { Product } from 'src/app/products/models/product.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { map } from 'rxjs/operators';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-smartship-products',
  templateUrl: './smartship-products.component.html',
  styleUrls: ['./smartship-products.component.css'],
})
export class SmartshipProductsComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  isLoggedUserExist: boolean = false;
  smartshipProducts: Product[] = [];
  categorySmartshipProducts: Product[] = [];
  productsData: any = {};
  currencySymbol = '$';
  defaultLanguage = '';
  sortOrder = '';
  selectedCategory = '';
  categories$!: Observable<ProductTagOrCategory[]>;
  mostPopularSmartships: Product[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private seoService: AppSeoService
  ) {}

  ngOnInit(): void {
    this.getUser();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCategories();
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);

          this.getProducts();
          this.selectedCategory = '';
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

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isLoggedUserExist = true;
      }
    });
  }

  getCategories() {
    this.categories$ = this.dataService.currentCategories$.pipe(
      map((categories) =>
        categories
          .map((c) => ({
            ...c,
            products: this.getFilteredSmartships(c.products),
          }))
          .filter((c) => c.products.length > 0)
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

        this.defaultLanguage = data.productsData.default_lang;

        this.productsData = data.productsData;

        const products = data.products.filter(
          (p) =>
            !p.accessLevels.isCustom.on &&
            (p.categories.length > 0 || p.tags.length > 0) &&
            (!p.accessLevels.isLoggedUser.on || (p.accessLevels.isLoggedUser.on && this.isLoggedUserExist))
        );

        this.sortOrder = 'alphabetic';
        this.smartshipProducts = this.getFilteredSmartships(products);
        this.mostPopularSmartships = this.getMostPopularSmartships(products);

        this.categorySmartshipProducts = this.smartshipProducts;

        $(document).ready(() => {
          if (this.mostPopularSmartships.length > 2) {
            tagSliderJS('most-popular', this.mostPopularSmartships.length);
          }
        });

        this.setSeo();
        this.getCurrencySymbol();
      })
    );
  }

  getCurrencySymbol() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';
    }
  }

  getFilteredSmartships(products: Product[]) {
    return products.filter((product) => {
      let smartshipFound = false;

      product.variations.forEach((variation) => {
        if (variation.orderType === 'ordertype_2') {
          smartshipFound = true;
        }
      });

      return smartshipFound;
    });
  }

  getMostPopularSmartships(products: Product[]) {
    const tempMostPopularProducts: Product[] = [];

    products.forEach((product) => {
      let smartshipFound = false;
      product.variations.forEach((variation) => {
        if (variation.orderType === 'ordertype_2') {
          smartshipFound = true;
        }
      });

      if (product.isMostPopular && smartshipFound) {
        tempMostPopularProducts.push(product);
      }
    });

    return tempMostPopularProducts;
  }

  getExchangedPrice(price: number) {
    let finalPrice = 0;

    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      const exchangedPrice =
        productsSettings.exchange_rate !== ''
          ? +productsSettings.exchange_rate * price
          : price;

      finalPrice =
        productsSettings.tax_rate !== '' && +productsSettings.tax_rate !== 0
          ? exchangedPrice + (exchangedPrice * +productsSettings.tax_rate) / 100
          : exchangedPrice;
    }
    return finalPrice;
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

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(true);

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
    let isAllAttr1OutOfStock = true;

    product.variations.forEach((variation) => {
      if (variation.orderType === 'ordertype_2') {
        if (!variation.isOutOfStock) {
          isAllAttr1OutOfStock = false;
        }
      }
    });

    return isAllAttr1OutOfStock;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('SmartShip');
    this.seoService.updateDescription(
      'Set up a monthly SmartShip order with any of the eligible products below and get 22% OFF future monthly product orders'
    );

    this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('index,follow');
      }
    });
  }

  onChangeSort(event: any) {
    this.sortOrder = event.target.value;
  }

  onClickCategory(category: ProductTagOrCategory) {
    if (category.slug === this.selectedCategory) {
      this.selectedCategory = '';
      this.categorySmartshipProducts = this.smartshipProducts;
    } else {
      this.selectedCategory = category.slug;
      this.categorySmartshipProducts = this.getFilteredSmartships(
        category.products
      );
    }
  }

  getSpecificCategoryProducts(categories: ProductTagOrCategory[]) {
    const category = categories.find((x) => x.slug === this.selectedCategory);
    return category ? category.products : [];
  }

  isBothPricesSame(product: Product) {
    const discountPrice = this.getSmartshipDiscountPrice(product);
    const originalPrice = this.getOriginalPrice(product);

    return discountPrice === originalPrice;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
