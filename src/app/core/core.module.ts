import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorResponseInterceptor } from './interceptors/error-response.interceptor';
import { ProductsUtilityService } from '../products/services/products-utility.service';
import { BlogInterceptor } from '../blogs/intereptors/blog.interceptor';
import { PhraseInterceptor } from './interceptors/phrase.interceptor';
import { ProductsApiService } from '../products/services/products-api.service';
import { FoodUtilityService } from '../foods/services/food-utility.service';
import { FoodApiService } from '../foods/services/food-api.service';
import { NgInterceptorService } from './interceptors/ng-interceptor.service';
import { ProductsFormService } from '../products/services/products-form.service';
import { RouterModule } from '@angular/router';
import { MobileNavigationComponent } from './mobile-navigation/mobile-navigation.component';
import { ProductsTagAndCategoryService } from '../products/services/products-tag-and-category.service';
import { PromoterService } from '../products/services/promoter.service';
import { PruvitLogoDesktopComponent } from './svgs/pruvit-logo-desktop/pruvit-logo-desktop.component';
import { PruvitLogoMobileComponent } from './svgs/pruvit-logo-mobile/pruvit-logo-mobile.component';
import { BlogApiService } from '../blogs/services/blog-api.service';
import { ProductCardService } from '../products/services/product-card.service';
import { AppOfferService } from '../shared/services/app-offer.service';
import { PruvitLogoFooterComponent } from './svgs/pruvit-logo-footer/pruvit-logo-footer.component';
import { CurrencyPipe } from '../shared/pipes/currency.pipe';
import {
  PHRASE_CONFIG,
  PHRASE_CONFIG_TOKEN,
} from '../shared/config/phrase-config';
import { ConfirmCountryComponent } from './header/confirm-country/confirm-country.component';
import { DiscountBannerSliderComponent } from './header/discount-banner-slider/discount-banner-slider.component';
import { SearchBarResultsComponent } from './header/common/search-bar-results/search-bar-results.component';
import { HeaderCategoriesComponent } from './header/common/header-categories/header-categories.component';
import { SearchDesktopComponent } from './header/search-desktop/search-desktop.component';
import { SearchMobileComponent } from './header/search-mobile/search-mobile.component';
import { SearchBaseComponent } from './header/search-base/search-base.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    MobileNavigationComponent,
    PruvitLogoDesktopComponent,
    PruvitLogoMobileComponent,
    PruvitLogoFooterComponent,
    ConfirmCountryComponent,
    DiscountBannerSliderComponent,
    SearchBarResultsComponent,
    HeaderCategoriesComponent,
    SearchDesktopComponent,
    SearchMobileComponent,
    SearchBaseComponent,
  ],
  imports: [SharedModule, RouterModule],
  exports: [HeaderComponent, FooterComponent, MobileNavigationComponent],
  providers: [
    ProductsApiService,
    BlogApiService,
    ProductsUtilityService,
    AppOfferService,
    ProductsFormService,
    ProductsTagAndCategoryService,
    PromoterService,
    FoodUtilityService,
    FoodApiService,
    ProductCardService,
    CurrencyPipe,
    { provide: PHRASE_CONFIG_TOKEN, useValue: PHRASE_CONFIG },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorResponseInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: BlogInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: PhraseInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgInterceptorService,
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
