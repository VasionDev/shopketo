import { Component, Input, Renderer2 } from '@angular/core';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-header-categories',
  templateUrl: './header-categories.component.html',
  styleUrls: ['./header-categories.component.css'],
})
export class HeaderCategoriesComponent {
  @Input() categories: ProductTagOrCategory[] = [];

  constructor(
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private renderer: Renderer2
  ) {}

  onClickCategory(categorySlug: string) {
    if (categorySlug) {
      const routeURL = '/category/' + categorySlug;
      this.utilityService.navigateToRoute(routeURL);
    }

    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    this.renderer.removeClass(document.body, 'navbar-show');
  }

  isProductExist(category: ProductTagOrCategory) {
    const prodList = category.products.filter(prod => this.dataService.isProductHasOrderTypeOne(prod));
    return prodList.length ? true : false;
  }

  onClickLockIcon(category: ProductTagOrCategory) {
    this.dataService.changePostName({
      postName: 'access-level-modal',
      payload: { key: 'accessLevels', value: category.accessLevels },
    });

    $('#accessLevelModal').modal('show');
  }
}
