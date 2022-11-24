import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, SubscriptionLike } from 'rxjs';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { Product } from 'src/app/products/models/product.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { ProductCardComponent } from '../../common/product-card/product-card.component';
import { map, tap } from 'rxjs/operators';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.css'],
})
export class TagsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tagContainer') tagContainer!: ElementRef;
  @ViewChildren('child') childComponents!: QueryList<ProductCardComponent>;
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  isLoggedUserExist: boolean = false;
  tags$!: Observable<ProductTagOrCategory[]>;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCarts();
    this.getUser();
    this.getTags();
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
              if(!product.accessLevels.isLoggedUser.on || (product.accessLevels.isLoggedUser.on && this.isLoggedUserExist)) {
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
        $(document).ready(() => {
          tags.forEach((tag) => {
            const isSlickPresent = $(
              '.sk-category__products.slick-initialized'
            ).hasClass(tag.slug);

            if (isSlickPresent) {
              $('.sk-category__products.' + tag.slug).slick('unslick');
            }

            if (tag.products.length > 2) {
              tagSliderJS(tag.slug, tag.products.length);
            }
          });
        });
      })
    );
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

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
