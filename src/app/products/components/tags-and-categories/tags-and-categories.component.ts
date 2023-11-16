import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { ProductSettings } from '../../models/product-settings.model';
import { ProductTagOrCategory } from '../../models/product-tag-or-category.model';
import { Product } from '../../models/product.model';
import { ProductsTagAndCategoryService } from '../../services/products-tag-and-category.service';
import { ProductCardComponent } from '../common/product-card/product-card.component';
declare var $: any;

@Component({
  selector: 'app-tags-and-categories',
  templateUrl: './tags-and-categories.component.html',
  styleUrls: ['./tags-and-categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsAndCategoriesComponent implements OnInit, OnDestroy {
  @ViewChildren('childInSale')
  childInSaleComponents!: QueryList<ProductCardComponent>;
  @ViewChildren('childOutOfStock')
  childOutOfStockComponents!: QueryList<ProductCardComponent>;
  @ViewChildren('childRestricted')
  childRestrictedComponents!: QueryList<ProductCardComponent>;
  user: any;
  selectedLanguage = '';
  selectedCountry = '';
  pageName!: 'category' | 'tag';
  isLoggedUserExist: boolean = false;
  tagsOrCategories: ProductTagOrCategory[] = [];
  inSaleProducts: Product[] = [];
  outOfStockProducts: Product[] = [];
  restrictedProducts: Product[] = [];
  mostPopularProducts: Product[] = [];
  categoryOrTag = {} as ProductTagOrCategory;
  parentCategory = {} as ProductTagOrCategory;
  isParentCategory = false;
  productSettings = {} as ProductSettings;
  sortOrder = '';
  isUserCanAccess = true;
  isRedirectionStarted = false;
  isLoggedIn = false;
  discountHeight$ = this.dataService.currentDiscountHeight$;
  subscriptions: SubscriptionLike[] = [];
  selectedChildCategory = '';
  isShopAllPage: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private productsTagAndCategoryService: ProductsTagAndCategoryService,
    private location: Location,
    private seoService: AppSeoService,
    private meta: Meta,
    private userService: AppUserService,
    private changeDetectionRef: ChangeDetectorRef,
    private store: Store<AppState>
  ) {
    this.getUser();
    this.setTagOrCategoryName();
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCategoriesOrTags();
    this.getCarts();
  }

  setTagOrCategoryName() {
    let routeUrl = window.location.pathname.split('/')[1];

    if (routeUrl === 'tag' || routeUrl === 'category') {
      if (routeUrl === 'tag') {
        this.pageName = 'tag';
      }
      if (routeUrl === 'category') {
        this.pageName = 'category';
      }
    } else {
      routeUrl = window.location.pathname.split('/')[2];

      if (routeUrl === 'tag') {
        this.pageName = 'tag';
      }
      if (routeUrl === 'category') {
        this.pageName = 'category';
      }
    }

    if (this.pageName === 'tag') {
      this.getTags();
    }

    if (this.pageName === 'category') {
      this.getCategories();
    }
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
        this.isLoggedUserExist = true;
        this.user = user;
        this.getCategoryOrTag();
        this.setUserAccess();
      }
    });
  }

  getTags() {
    this.subscriptions.push(
      this.dataService.currentTags$.subscribe((tags) => {
        this.tagsOrCategories = tags;

        this.getCategoryOrTag();
      })
    );
  }

  getCategories() {
    this.subscriptions.push(
      this.dataService.currentCategories$.subscribe((categories) => {
        this.tagsOrCategories = categories.filter((c) => c.products.length !== 0);
        this.tagsOrCategories.forEach(cat => {
          const popularProd = cat.products.filter(p => p.isMostPopular);
          this.mostPopularProducts.push(...popularProd);
        })
        this.getCategoryOrTag();
      })
    );
  }

  getCategoriesOrTags() {
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
      })
    );
  }

  getCategoryOrTag() {
    this.selectedChildCategory = '';
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.isShopAllPage = params['id'].includes('shop-all');
        this.changeDetectionRef.markForCheck();

        this.parentCategory = {} as ProductTagOrCategory;
        this.isParentCategory = false;

        if (this.pageName === 'category') {
          this.getParentCategory(params['id']);
        }

        this.setRedirectURL();

        this.categoryOrTag = this.productsTagAndCategoryService.getCategoryInfo(
          this.tagsOrCategories,
          params['id']
        ).category;

        if(Object.keys(this.categoryOrTag).length === 0) {
          const currentCategoryUId = this.dataService.getCurrentCategoryUniqueID();
          if (currentCategoryUId !== '') {
            const selectedCatInfo = this.tagsOrCategories.find((category) => {
              return category.english_unique_id === currentCategoryUId;
            })
            if (selectedCatInfo) {
              this.categoryOrTag = this.productsTagAndCategoryService.getCategoryInfo(
                this.tagsOrCategories,
                selectedCatInfo.slug,
              ).category;
            }
          }
        }

        if(this.categoryOrTag && Object.keys(this.categoryOrTag).length) {
          const navigateUrl = `/${this.pageName === 'category' ? 'category' : 'tag'}/${this.categoryOrTag.slug}`;
          this.utilityService.navigateToRoute(navigateUrl);
        }else {
          this.utilityService.navigateToRoute('/');
        }

        const isSoldOutProducts: Product[] = [];
        const inSaleProducts: Product[] = [];
        const restrictedProducts: Product[] = [];

        if (
          !(
            Object.keys(this.categoryOrTag).length === 0 &&
            this.categoryOrTag.constructor === Object
          )
        ) {
          this.categoryOrTag.products.forEach((product) => {
            if (
              this.dataService.isProductHasOrderTypeOne(product) &&
              (!product.accessLevels.isLoggedUser.on ||
              (product.accessLevels.isLoggedUser.on && this.isLoggedUserExist))
            ) {
              const canAccess = this.userService.checkUserAccess(
                product.accessLevels,
                product.customUsers
              );
              if (this.isSoldOut(product)) {
                isSoldOutProducts.push(product);
              } else if (!canAccess) {
                restrictedProducts.push(product);
              } else {
                inSaleProducts.push(product);
              }
            }
          });

          this.outOfStockProducts = isSoldOutProducts;
          this.inSaleProducts = inSaleProducts;
          this.restrictedProducts = restrictedProducts;
        }

        this.sortOrder = 'alphabetic';
        this.setSeo();

        this.checkUserAccess();
      })
    );
  }

  onClickChildCategory(category?: ProductTagOrCategory) {
    const isSoldOutProducts: Product[] = [];
    const inSaleProducts: Product[] = [];
    const restrictedProducts: Product[] = [];
    if (
      this.selectedChildCategory === category?.slug ||
      category === undefined
    ) {
      this.selectedChildCategory = '';
      const regularProducts = this.categoryOrTag.products.filter(prod => this.dataService.isProductHasOrderTypeOne(prod));
      regularProducts.forEach((product) => {
        const canAccess = this.userService.checkUserAccess(
          product.accessLevels,
          product.customUsers
        );
        if (this.isSoldOut(product)) {
          isSoldOutProducts.push(product);
        } else if (!canAccess) {
          restrictedProducts.push(product);
        } else {
          inSaleProducts.push(product);
        }
      });
      this.outOfStockProducts = isSoldOutProducts;
      this.inSaleProducts = inSaleProducts;
      this.restrictedProducts = restrictedProducts;
    } else {
      if (category.products.length) {
        const regularProducts = category.products.filter(prod => this.dataService.isProductHasOrderTypeOne(prod));
        regularProducts.forEach((product) => {
          const canAccess = this.userService.checkUserAccess(
            product.accessLevels,
            product.customUsers
          );
          if (this.isSoldOut(product)) {
            isSoldOutProducts.push(product);
          } else if (!canAccess) {
            restrictedProducts.push(product);
          } else {
            inSaleProducts.push(product);
          }
        });
        this.selectedChildCategory = category.slug;
        this.outOfStockProducts = isSoldOutProducts;
        this.inSaleProducts = inSaleProducts;
        this.restrictedProducts = restrictedProducts;
      }
    }
  }

  getParentCategory(categorySlug: string) {
    this.tagsOrCategories.forEach((item) => {
      if (item.slug === categorySlug) {
        this.parentCategory = item;
        this.isParentCategory = true;
      }

      item.childs.forEach((child) => {
        if (child.slug === categorySlug) {
          this.parentCategory = item;
        }
      });
    });
  }

  checkUserAccess() {
    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    const viCode = this.activatedRoute.snapshot.queryParamMap.get('vicode');
    const referrer = this.activatedRoute.snapshot.queryParamMap.get('ref');
    const promptLogin =
      this.activatedRoute.snapshot.queryParamMap.get('promptLogin');
    const isWindowReferrer = document.referrer.includes('experienceketo.com');

    const removedParamsUrl = this.router.url.substring(
      0,
      this.router.url.indexOf('?')
    );
    if (
      viCode !== null &&
      referrer !== null &&
      promptLogin !== null &&
      isWindowReferrer
    ) {
      if (promptLogin === 'true') {
        this.userService.login();

        this.isRedirectionStarted = true;
        this.isUserCanAccess = false;
      } else {
        this.isUserCanAccess = true;
      }

      this.userService.setVIUser(referrer, promptLogin, viCode, true);
      this.dataService.setViTimer('');
    } else {
      if (VIUser !== null && VIUser?.guestPass) {
        this.isUserCanAccess = true;
      } else {
        this.isUserCanAccess = !(
          this.categoryOrTag &&
          Object.keys(this.categoryOrTag).length === 0 &&
          this.categoryOrTag.constructor === Object
        )
          ? this.userService.isUserCanAccess(
            this.categoryOrTag.accessLevels,
            this.categoryOrTag.customUsers
          )
          : false;

        if (!this.user) {
          this.isLoggedIn = false;
        } else {
          this.isLoggedIn = true;
        }
      }
    }

    if (viCode !== null) {
      this.location.go(removedParamsUrl);
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

  checkAllAttr1OutOfStock(product: Product) {
    let isAllAttr1OutOfStock = true;

    product.variations.forEach((variation) => {
      if (!variation.isOutOfStock) {
        isAllAttr1OutOfStock = false;
      }
    });

    return isAllAttr1OutOfStock;
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug) {
      const routeURL = '/category/' + categorySlug;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onChangeSort(event: any) {
    this.sortOrder = event.target.value;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.subscriptions.push(
      this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
        if (status) {
          if (this.categoryOrTag.slug !== '') {
            this.seoService.updateTitle(this.categoryOrTag.name);
            this.meta.updateTag( { property: 'og:title', content: this.categoryOrTag.name });
            this.seoService.updateDescription(this.categoryOrTag.description);
          } else {
            this.seoService.updateTitle('Page not found');
          }
        } else {
          if (this.categoryOrTag.slug !== '') {
            this.seoService.updateTitle(this.categoryOrTag.name);
            this.meta.updateTag( { property: 'og:title', content: this.categoryOrTag.name });
            this.seoService.updateDescription(this.categoryOrTag.description);
            this.seoService.updateRobots('index,follow');
          } else {
            this.seoService.updateTitle('Page not found');
            this.seoService.updateRobots('noindex,follow');
          }
        }
      })
    );
  }

  onClickShopAll() {
    let shopAllSlug = '';

    this.tagsOrCategories.forEach((categoryOrTag) => {
      if (categoryOrTag.slug.includes('shop-all')) {
        shopAllSlug = categoryOrTag.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? (this.selectedLanguage === 'en' ? 'shop-all' : `shop-all-${this.selectedLanguage}`) : shopAllSlug;

    this.utilityService.navigateToRoute('/category/' + shopAllSlug);
  }

  private setUserAccess() {
    if (this.childInSaleComponents) {
      this.childInSaleComponents.toArray().forEach((c) => c.manageUserAccess());
    }

    if (this.childOutOfStockComponents) {
      this.childOutOfStockComponents
        .toArray()
        .forEach((c) => c.manageUserAccess());
    }

    if (this.childRestrictedComponents) {
      this.childRestrictedComponents.toArray().forEach((c) => c.manageUserAccess());
    }
  }

  ngOnDestroy() {
    this.dataService.setCurrentCategoryUniqueID(this.categoryOrTag.english_unique_id);
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
