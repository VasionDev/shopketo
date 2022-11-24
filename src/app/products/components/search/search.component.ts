import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { ProductTagOrCategory } from '../../models/product-tag-or-category.model';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../common/product-card/product-card.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('search') search!: ElementRef;
  @ViewChildren('child') childComponents!: QueryList<ProductCardComponent>;
  searchFilter = '';
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  isLoggedUserExist: boolean = false;
  products: Product[] = [];
  productsData: any = {};
  categories: ProductTagOrCategory[] = [];
  categoryProducts: Product[] = [];
  filteredCategories: ProductTagOrCategory[] = [];
  selectedCategory = '';
  defaultLanguage = '';
  sortOrder = '';
  discountHeight$ = this.dataService.currentDiscountHeight$;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private seoService: AppSeoService,
    private store: Store<AppState>
  ) {
    this.searchFilter = this.dataService.searchKey;
    this.addKeyCodeToUrl();
    this.dataService.changeRedirectURL('search');
  }

  ngOnInit(): void {
    this.getUser();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
    this.getBodyClassStatus();
    this.setSeo();
    this.getCarts();
    this.getCategories();
  }

  getBodyClassStatus() {
    this.subscriptions.push(
      this.dataService.isSearchFocused$.subscribe((status) => {
        if (status) {
          setTimeout(() => {
            if (this.search) {
              this.search.nativeElement.focus();
            }
          }, 0);
        }
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
          this.selectedCategory = '';
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

  getQueryParams() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((params) => {
        const keyCode = params.get('key');

        if (keyCode !== null) {
          this.searchFilter = keyCode;
          this.dataService.searchKey = keyCode;

          this.addKeyCodeToUrl();
        }
      })
    );
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
        this.isLoggedUserExist = true;
        this.setUserAccess();
      }
    });
  }

  getCategories() {
    this.dataService.currentCategories$.subscribe((categories) => {
      this.categories = categories.filter((c) => c.products.length !== 0);

      this.filteredCategories = this.categories;
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

        this.defaultLanguage = data.productsData.default_lang;

        this.sortOrder = 'alphabetic';
        this.productsData = data.productsData;
        this.products = data.products.filter(
          (p) => 
            !p.accessLevels.isCustom.on && 
            (p.categories.length > 0 || p.tags.length > 0) && 
            (!p.accessLevels.isLoggedUser.on || (p.accessLevels.isLoggedUser.on && this.isLoggedUserExist))
        );
        this.categoryProducts = this.products;
      })
    );
  }

  addKeyCodeToUrl() {
    const url = this.location.path();

    if (!url.includes('key=') && this.searchFilter !== '') {
      const redirectUrl = url.includes('?')
        ? url + '&key=' + this.searchFilter
        : url + '?key=' + this.searchFilter;
      this.location.go(redirectUrl);
    }
  }

  onInput() {
    this.dataService.searchKey = this.searchFilter;

    const url = this.location.path();
    let redirectUrl = this.updateQueryStringParameter(
      url,
      'key',
      this.searchFilter
    );
    if (this.searchFilter === '') {
      redirectUrl = redirectUrl.includes('&key=')
        ? redirectUrl.replace('&key=', ' ')
        : redirectUrl.replace('?key=', ' ');
    }

    this.location.go(redirectUrl);
  }

  private updateQueryStringParameter(uri: string, key: string, value: string) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  isSoldOut(product: Product) {
    const isAllOutOfStock = this.checkAllAttr1OutOfStock(product);

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

  private checkAllAttr1OutOfStock(product: Product) {
    let isAllAttr1OutOfStock = true;

    product.variations.forEach((variation) => {
      if (!variation.isOutOfStock) {
        isAllAttr1OutOfStock = false;
      }
    });

    return isAllAttr1OutOfStock;
  }

  onClickCategory(category: ProductTagOrCategory) {
    if (category.slug === this.selectedCategory) {
      this.selectedCategory = '';

      this.categoryProducts = this.products;
    } else {
      this.selectedCategory = category.slug;

      this.categoryProducts = category.products;
    }
  }

  onClickSearch() {
    if (this.search) {
      this.search.nativeElement.focus();
    }
  }

  getTranslatedSearchPruvit() {
    if (this.search) {
      this.search.nativeElement.placeholder =
        this.translate.instant('search-pruvit');
    }
  }

  onChangeSort(event: any) {
    this.sortOrder = event.target.value;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('Search');
    this.seoService.updateDescription('');

    this.subscriptions.push(
      this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
        if (!status) {
          this.seoService.updateRobots('index,follow');
        }
      })
    );
  }

  @HostListener('document:keydown', ['$event'])
  onKeySlashHandler(event: any) {
    if (event.code === 'Escape' || event.code === 'Enter') {
      this.dataService.changeSearchFocusStatus(false);

      if (this.search) {
        this.search.nativeElement.blur();
      }
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
