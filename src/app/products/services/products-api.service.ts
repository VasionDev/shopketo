import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DiscountBanner } from 'src/app/shared/models/discount-banner.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppDiscountBannerService } from 'src/app/shared/services/app-discount-banner.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { environment } from 'src/environments/environment';
import { Offer } from '../../shared/models/offer.model';
import { ProductSettings } from '../models/product-settings.model';
import { ProductTagOrCategory } from '../models/product-tag-or-category.model';
import { Product } from '../models/product.model';
import { ProductsFormService } from './products-form.service';
import { ProductsTagAndCategoryService } from './products-tag-and-category.service';

@Injectable()
export class ProductsApiService {
  domainPath: string;
  isLoggedUserExist: boolean = false;
  viDiscount: number = 15;
  apiPath = 'wp-json/wp/pruvitnow/products';

  constructor(
    private http: HttpClient,
    private dataService: AppDataService,
    private productsFormService: ProductsFormService,
    private productsTagAndCategoriesService: ProductsTagAndCategoryService,
    private discountBannerService: AppDiscountBannerService,
    private offerService: AppOfferService,
    private userService: AppUserService
  ) {
    this.domainPath = environment.apiDomain;
    this.getUser();
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isLoggedUserExist = true;
        const isVipPlusExist = user.mvuser_scopes.includes('vipPlus');
        if(isVipPlusExist) {
          this.viDiscount = 25;
        }
      } else {
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
        const productSettings: ProductSettings =
          this.productsFormService.getProductSettings(responseData);
        const challengeSettings = responseData?.challenge_settings || null;

        const generalSettings = responseData?.general_settings || null;

        const mappedProducts = responseData.list.map((product: any) =>
          this.productsFormService.getProduct(product, responseData)
        ) as Product[];
        
        const mappedProdWithPrice = this.setSmartshipDiscountIfExist(mappedProducts);

        const offers: Offer[] = responseData.hasOwnProperty('offer')
          ? this.offerService.getProductOffers(responseData.offer)
          : [];

        const offersInStock = offers.filter(f=> Object.keys(f.product).length && !f.product.isAllVariationOutOfStock && !f.product.isSoldOut);

        const discountBanners: DiscountBanner[] = responseData.hasOwnProperty(
          'banner'
        )
          ? this.discountBannerService.getDiscountBanner(responseData.banner)
          : [];

        const hiddenProducts = mappedProdWithPrice.filter(p=> p.accessLevels.isHidden.on);

        const promoterMembership =
          this.productsFormService.getPromoterMembershipProduct(mappedProdWithPrice);
        const filterProducts = this.filterProducts(mappedProdWithPrice);
        const products =
          this.productsFormService.populateWithRelatedProducts(filterProducts);

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
          promoterMembership: promoterMembership ? promoterMembership : null,
          hiddenProducts,
          productSettings,
          challengeSettings,
          generalSettings,
          categories,
          tags,
          offers: offersInStock,
          discountBanners,
        };
      })
    );
  }

  private filterProducts(products: Product[]) {
    return products.filter(
      (p) =>
        !p.accessLevels.isHidden.on &&
        (!p.accessLevels.isLoggedUser.on ||
          (p.accessLevels.isLoggedUser.on && this.isLoggedUserExist)
        ) &&
        (!p.accessLevels.isLoggedSmartship.on ||
          (p.accessLevels.isLoggedSmartship.on && this.isLoggedUserExist)
        )
    );
  }

  private setSmartshipDiscountIfExist(products: Product[]) {
    return products.map(p => {
      const variations = p.variations.map(v => {
        const isUserCanAccess = this.userService.checkUserAccess(
          v.ssDiscountAccessLevels,
          v.ssDiscountCustomUsers
        );
        if(
          v.regularSSDiscountPercent > 0 &&
          v.regularSSDiscountPrice > 0 && 
          v.regularSSDiscountPrice < v.priceObj.everyMonth &&
          isUserCanAccess
        ) {
          v.priceObj.everyMonth = v.regularSSDiscountPrice;
          v.onetimeAndSmartshipDifference = v.priceObj.oneTime - v.priceObj.everyMonth > 0
          ? +(v.priceObj.oneTime - v.priceObj.everyMonth).toFixed(2)
          : 0;
        }
        return v;
      })
      p.variations = variations;
      return p;
    })
  }
}
