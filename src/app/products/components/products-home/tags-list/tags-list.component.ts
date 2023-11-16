import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, SubscriptionLike } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { Product } from 'src/app/products/models/product.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { ProductCardComponent } from '../../common/product-card/product-card.component';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.css'],
})
export class TagsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('tagContainer') tagContainer!: ElementRef;
  @ViewChildren('child') childComponents!: QueryList<ProductCardComponent>;
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  isLoadedCustomizeData = false;
  isLoggedUserExist: boolean = false;
  tags$!: Observable<ProductTagOrCategory[]>;
  subscriptions: SubscriptionLike[] = [];
  userCustomizedProducts: any = [];
  isMobileView: boolean = false;
  tagList: ProductTagOrCategory[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private store: Store<AppState>,
    private websiteSvc: WebsiteService
  ) {
    this.onMobileCheck();
  }

  onMobileCheck() {
    this.dataService.mobileView$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(res => {
      this.isMobileView = res;
      this.onSlickInitialization(this.tagList);
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCarts();
    this.getUser();
    this.getTags();
    this.getCustomizedData();
  }

  ngAfterViewInit(): void {
    if (this.tagContainer) {
      if (this.selectedCountry !== 'US') {
        this.tagContainer.nativeElement?.parentElement?.lastElementChild?.style?.setProperty(
          'padding-bottom',
          '187px'
        );
      }
    }
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);
          //this.getCustomizedData();
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

  getTags() {
    this.tags$ = this.dataService.currentTags$.pipe(
      map((tags) =>
        tags
          .filter((tag) => tag.products.length !== 0)
          .sort((a, b) => a.order - b.order)
          .map((tag) => {
            const soldOutItems: Product[] = [];
            const inSaleItems: Product[] = [];

            tag.products.forEach((product) => {
              if (
                this.dataService.isProductHasOrderTypeOne(product) &&
                (!product.accessLevels.isLoggedUser.on ||
                (product.accessLevels.isLoggedUser.on && this.isLoggedUserExist))
              ) {
                if (product.isSoldOut || product.isAllVariationOutOfStock) {
                  soldOutItems.push(product);
                } else {
                  inSaleItems.push(product);
                }
              }
            });

            tag.products = [...inSaleItems, ...soldOutItems];

            return tag;
          })
      ),
      tap((tags) => {
        this.tagList = tags;
        $(document).ready(() => {
          this.onSlickInitialization(tags)
        });
      })
    );
  }
  
  onSlickInitialization(tags: ProductTagOrCategory[]) {
    tags.forEach((tag) => {
      const isSlickPresent = $(
        '.sk-category__products.slick-initialized'
      ).hasClass(tag.slug);

      if (isSlickPresent) {
        $('.sk-category__products.' + tag.slug).slick('unslick');
      }

      if (tag.products.length > 2 && !this.isMobileView) {
        tagSliderJS(tag.slug, tag.products.length);
      }
    });
  }

  onClickTag(tagSlug: string) {
    if (tagSlug) {
      const routeURL = '/tag/' + tagSlug;
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  private setUserAccess() {
    if (this.childComponents) {
      this.childComponents.toArray().forEach((c) => c.manageUserAccess());
    }
  }

  getCustomizedData() {
    this.subscriptions.push(
      this.websiteSvc.userCustomizeData$.subscribe((res: any) => {
        if (res !== null && res?.success) {
          if (res.data.status === 'approved') {
            if (
              Object.entries(res.data.favoriteProducts).length &&
              res.data.favoriteProducts[this.selectedCountry]
            )
            this.getProducts(res.data.favoriteProducts[this.selectedCountry]);
          } else {
            this.isLoadedCustomizeData = true;
          }
        } else {
          this.isLoadedCustomizeData = true;
        }
      })
    );
  }

  getProducts(uniqueIds: []) {
    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }
        const regularProducts = data.products.filter(prod => this.dataService.isProductHasOrderTypeOne(prod));
        const favProducts = regularProducts.filter((product: any) => {
          return uniqueIds.some((item: any) => {
            return item === product.uniqueId;
          });
        });
        const soldOutItems: Product[] = [];
        const inSaleItems: Product[] = [];

        favProducts.forEach((product, ind) => {
          if (product.isSoldOut || product.isAllVariationOutOfStock) {
            soldOutItems.push(product);
          } else {
            inSaleItems.push(product);
          }
        });

        this.userCustomizedProducts = [...inSaleItems, ...soldOutItems].sort(
          (a, b) => b.productOrder - a.productOrder
        );

        if (this.userCustomizedProducts.length > 2) {
          setTimeout(() => {
            tagSliderJS('my-favorites', this.userCustomizedProducts.length);
          }, 500);
        }

        this.isLoadedCustomizeData = true;
      })
    );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
