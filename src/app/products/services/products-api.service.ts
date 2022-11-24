import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProductSettings } from '../models/product-settings.model';
import { ProductTagOrCategory } from '../models/product-tag-or-category.model';
import { Product } from '../models/product.model';

import { DiscountBanner } from 'src/app/shared/models/discount-banner.model';
import { AppDiscountBannerService } from 'src/app/shared/services/app-discount-banner.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { Offer } from '../../shared/models/offer.model';
import { ProductsFormService } from './products-form.service';
import { ProductsTagAndCategoryService } from './products-tag-and-category.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';

@Injectable()
export class ProductsApiService {
  domainPath: string;
  isLoggedUserExist: boolean = false;
  apiPath = 'wp-json/wp/pruvitnow/products';

  constructor(
    private http: HttpClient,
    private dataService: AppDataService,
    private productsFormService: ProductsFormService,
    private productsTagAndCategoriesService: ProductsTagAndCategoryService,
    private discountBannerService: AppDiscountBannerService,
    private offerService: AppOfferService
  ) {
    this.domainPath = environment.apiDomain;
    this.getUser()
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isLoggedUserExist = true;
      }else {
        this.isLoggedUserExist = false;
      }
    });
  }

  getProducts(country: string) {
    if (country.toLowerCase() === 'us') {
      return this.http.get(this.domainPath + '/' + this.apiPath);
    } else {
      return this.http.get(
        this.domainPath + '/' + country.toLowerCase() + '/' + this.apiPath
      );
    }
  }

  getProductsWithLanguage(country: string, language: string): Observable<any> {

    let fullApiPath = '';
    if (country.toLowerCase() === 'us') {
      if (language !== '') {
        fullApiPath =
          this.domainPath + '/' + this.apiPath + '/lang/?lang_code=' + language;
      } else {
        fullApiPath = this.domainPath + '/' + this.apiPath + '/lang';
      }
    } else {
      if (language !== '') {
        fullApiPath =
          this.domainPath +
          '/' +
          country.toLowerCase() +
          '/' +
          this.apiPath +
          '/lang/?lang_code=' +
          language;
      } else {
        fullApiPath =
          this.domainPath +
          '/' +
          country.toLowerCase() +
          '/' +
          this.apiPath +
          '/lang';
      }
    }

    return this.http.get<any>(fullApiPath).pipe(
      map((responseData: any) => {
        let products: Product[] = [];

        const productSettings: ProductSettings =
          this.productsFormService.getProductSettings(responseData);

        responseData.list.forEach((product: any) => {
          const mappedProduct = this.productsFormService.getProduct(
            product,
            responseData
          );
          products.push(mappedProduct);
        });

        const offers: Offer[] = responseData.hasOwnProperty('offer')
          ? this.offerService.getProductOffers(responseData.offer)
          : [];

        const discountBanners: DiscountBanner[] = responseData.hasOwnProperty(
          'banner'
        )
          ? this.discountBannerService.getDiscountBanner(responseData.banner)
          : [];

        products = this.filterProducts(products);

        products = products.map((p) => {
          p.relatedProducts = this.productsFormService.getRelatedProducts(
            p,
            products
          );
          return p;
        });

        const categories: ProductTagOrCategory[] =
          this.productsTagAndCategoriesService.getCategoriesOrTags(
            responseData.parent_category,
            products,
            true
          );

        const tags: ProductTagOrCategory[] =
          this.productsTagAndCategoriesService.getCategoriesOrTags(
            responseData.product_tag,
            products,
            false
          );

        return {
          products,
          productsData: responseData,
          productSettings,
          categories,
          tags,
          offers,
          discountBanners,
        };
      })
    );
  }

  private filterProducts(products: Product[]) {
    return products.filter((p) => 
    !p.accessLevels.isHidden.on && 
    (!p.accessLevels.isLoggedUser.on || 
    (p.accessLevels.isLoggedUser.on && this.isLoggedUserExist)) );
  }
}
