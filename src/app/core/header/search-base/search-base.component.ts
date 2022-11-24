import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Blog } from 'src/app/blogs/models/blog.model';
import { Product } from 'src/app/products/models/product.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-search-base',
  templateUrl: './search-base.component.html',
  styleUrls: ['./search-base.component.css'],
})
export class SearchBaseComponent {
  public products: Product[] = [];
  public blogs: Blog[] = [];
  public selectedCountry = '';

  constructor(
    public dataService: AppDataService,
    public renderer: Renderer2,
    public utilityService: AppUtilityService,
    public router: Router
  ) {
    this.getSelectedCountry();
    this.getBlogs();
    this.getProducts();
  }

  private getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  private getBlogs() {
    this.dataService.currentBlogsData$.subscribe((blogs) => {
      this.blogs = blogs;
    });
  }

  private getProducts() {
    this.dataService.currentProductsData$.subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }

      this.products = data.products.filter(
        (p) =>
          !p.accessLevels.isCustom.on &&
          (p.categories.length > 0 || p.tags.length > 0)
      );
    });
  }

  onClickProduct(postName: string) {
    if (postName) {
      const routeURL = '/product/' + postName;
      this.utilityService.navigateToRoute(routeURL);
    }
    $('#SearchBoxModal').modal('hide');
    this.renderer.removeClass(document.body, 'search-focus');

    this.dataService.changeSearchFocusStatus(false);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickBlog(blogSlug: string) {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog' + '/' + blogSlug]);
    } else {
      this.router.navigate([
        this.selectedCountry.toLowerCase() + '/' + 'blog' + '/' + blogSlug,
      ]);
    }
    $('#SearchBoxModal').modal('hide');
    this.renderer.removeClass(document.body, 'search-focus');

    this.dataService.changeSearchFocusStatus(false);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }

  onClickSeeResults() {
    this.dataService.changeRedirectURL('search');

    this.utilityService.navigateToRoute('/search');

    $('#SearchBoxModal').modal('hide');
    this.renderer.removeClass(document.body, 'search-focus');

    this.dataService.changeSearchFocusStatus(false);
    $('.collapse.mobile-nav-menu-wrap').collapse('hide');
  }
}
