import { NgModule } from '@angular/core';
import { AddToCartComponent } from './components/add-to-cart/add-to-cart.component';
import { CheckoutCartComponent } from './components/checkout-cart/checkout-cart.component';
import { DeliveryOptionsComponent } from './components/delivery-options/delivery-options.component';
import { CountryBarComponent } from './components/country-bar/country-bar.component';
import { FoodFilterComponent } from './components/food-filter/food-filter.component';
import { FoodSummaryComponent } from './components/food-summary/food-summary.component';
import { FoodBoxSidebarComponent } from './components/food-box-sidebar/food-box-sidebar.component';
import { FoodResetSidebarComponent } from './components/food-reset-sidebar/food-reset-sidebar.component';
import { SharedModule } from '../shared/shared.module';
import { SidebarContainerComponent } from './components/sidebar-container/sidebar-container.component';

@NgModule({
  declarations: [
    AddToCartComponent,
    CheckoutCartComponent,
    DeliveryOptionsComponent,
    CountryBarComponent,
    FoodFilterComponent,
    FoodSummaryComponent,
    FoodBoxSidebarComponent,
    FoodResetSidebarComponent,
    SidebarContainerComponent,
  ],
  imports: [SharedModule],
  exports: [
    AddToCartComponent,
    CheckoutCartComponent,
    DeliveryOptionsComponent,
    CountryBarComponent,
    FoodFilterComponent,
    FoodSummaryComponent,
    FoodBoxSidebarComponent,
    FoodResetSidebarComponent,
    SidebarContainerComponent,
  ],
})
export class SidebarModule {}
