import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FoodsComponent } from './foods.component';
import { FoodsHomeComponent } from './components/foods-home/foods-home.component';
import { FoodsSelectComponent } from './components/foods-select/foods-select.component';
import { FoodsRoutingModule } from './foods-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ModalFoodsComponent } from './modals/modal-foods/modal-foods.component';
import { FoodCardComponent } from './components/common/food-card/food-card.component';
import { FoodsBoxFooterComponent } from './components/foods-box-footer/foods-box-footer.component';
import { FilterCategoryPipe } from './pipes/filter-category.pipe';
import { FilterDietPipe } from './pipes/filter-diet.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { FilterTypePipe } from './pipes/filter-type.pipe';
import { ModalZipComponent } from './modals/modal-zip/modal-zip.component';
import { FilterSubCategoryPipe } from './pipes/filter-sub-category.pipe';
import { ModalShippingOptionsComponent } from './modals/modal-shipping-options/modal-shipping-options.component';
import { ModalShippingConfirmComponent } from './modals/modal-shipping-confirm/modal-shipping-confirm.component';
import { ModalLimitedTimeComponent } from './modals/modal-limited-time/modal-limited-time.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
  declarations: [
    FoodsComponent,
    FoodsHomeComponent,
    FoodsSelectComponent,
    ModalFoodsComponent,
    FoodCardComponent,
    FoodsBoxFooterComponent,
    FilterCategoryPipe,
    FilterDietPipe,
    SortPipe,
    FilterTypePipe,
    ModalZipComponent,
    FilterSubCategoryPipe,
    ModalShippingOptionsComponent,
    ModalShippingConfirmComponent,
    ModalLimitedTimeComponent,
  ],
  imports: [FoodsRoutingModule, SharedModule, SlickCarouselModule],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FoodsModule {}
