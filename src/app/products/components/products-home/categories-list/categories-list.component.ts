import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, SubscriptionLike } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css'],
})
export class CategoriesListComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  categories$!: Observable<ProductTagOrCategory[]>;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCategories();
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
      })
    );
  }

  getCategories() {
    this.categories$ = this.dataService.currentCategories$.pipe(
      map((categories) =>
        categories
          .filter((c) => !c.accessLevels.isCustom.on && c.products.length !== 0)
          .sort((a, b) => a.order - b.order)
      )
    );

    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
    });
  }

  onClickLockIcon(category: ProductTagOrCategory) {
    this.dataService.changePostName({
      postName: 'access-level-modal',
      payload: { key: 'accessLevels', value: category.accessLevels },
    });

    $('#accessLevelModal').modal('show');
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug) {
      if (categorySlug === 'food') {
        if (this.selectedLanguage !== 'en') {
          this.router.navigate(['/food'], {
            queryParams: {
              lang: this.selectedLanguage,
            },
          });
        } else {
          this.router.navigate(['/food']);
        }
      } else {
        const routeURL = '/category/' + categorySlug;
        this.utilityService.navigateToRoute(routeURL);
      }
    }
  }

  enableCategory() {
    if (
      this.selectedCountry === 'US' ||
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

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
