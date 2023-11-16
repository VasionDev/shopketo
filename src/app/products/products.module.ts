import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CartComponent } from './components/cart/cart.component';
import { ProductAvailabilityComponent } from './components/common/product-card/product-availability/product-availability.component';
import { ProductBuyComponent } from './components/common/product-card/product-buy/product-buy.component';
import { ProductCardComponent } from './components/common/product-card/product-card.component';
import { VideoSliderComponent } from './components/common/video-slider/video-slider.component';
import { LearnComponent } from './components/learn/learn.component';
import { MostPopularComponent } from './components/most-popular/most-popular.component';
import { PagesComponent } from './components/pages/pages.component';
import { ProductDetailComponent } from './components/product-details/details.component';
import { FormComponent } from './components/product-details/form/form.component';
import { InfoComponent } from './components/product-details/info/info.component';
import { BannerSliderComponent } from './components/products-home/banner-slider/banner-slider.component';
import { CategoriesListComponent } from './components/products-home/categories-list/categories-list.component';
import { HomeComponent } from './components/products-home/home.component';
import { TagsListComponent } from './components/products-home/tags-list/tags-list.component';
import { BrandBuilderComponent } from './components/promoter/brand-builder/brand-builder.component';
import { PhoenixComponent } from './components/promoter/phoenix/phoenix.component';
import { PromoterLadybossComponent } from './components/promoter/promoter-ladyboss/promoter-ladyboss.component';
import { PromoterComponent } from './components/promoter/promoter.component';
import { ReferrerHomeComponent } from './components/referrer-home/referrer-home.component';
import { SearchComponent } from './components/search/search.component';
import { SmartshipAboutComponent } from './components/smartship/smartship-about/smartship-about.component';
import { SmartshipProductsComponent } from './components/smartship/smartship-products/smartship-products.component';
import { SmartshipComponent } from './components/smartship/smartship.component';
import { TagsAndCategoriesComponent } from './components/tags-and-categories/tags-and-categories.component';
import { VipComponent } from './components/vip/vip.component';
import { ModalAccessLevelComponent } from './modals/modal-access-level/modal-access-level.component';
import { ModalProductsComponent } from './modals/modal-products/modal-products.component';
import { CategoryFilterPipe } from './pipes/category-filter.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { ProductsRoutingModule } from './products-routing.module';
import { SezzleDarkComponent } from './svgs/sezzle-dark/sezzle-dark.component';
import { SezzleLightComponent } from './svgs/sezzle-light/sezzle-light.component';

@NgModule({
  declarations: [
    HomeComponent,
    LearnComponent,
    PagesComponent,
    ModalProductsComponent,
    TagsAndCategoriesComponent,
    SearchComponent,
    CategoryFilterPipe,
    BannerSliderComponent,
    TagsListComponent,
    CategoriesListComponent,
    FormComponent,
    InfoComponent,
    ProductDetailComponent,
    SmartshipComponent,
    SortPipe,
    PromoterComponent,
    BrandBuilderComponent,
    SmartshipProductsComponent,
    SmartshipAboutComponent,
    ProductCardComponent,
    VipComponent,
    SezzleLightComponent,
    SezzleDarkComponent,
    ModalAccessLevelComponent,
    ProductBuyComponent,
    ProductAvailabilityComponent,
    VideoSliderComponent,
    ReferrerHomeComponent,
    CartComponent,
    PhoenixComponent,
    PromoterLadybossComponent,
    MostPopularComponent,
  ],
  imports: [SharedModule, ProductsRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsModule {}
