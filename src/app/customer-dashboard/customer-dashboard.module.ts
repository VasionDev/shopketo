import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskModule } from 'ngx-mask';
import { QuillModule } from 'ngx-quill';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SharedModule } from '../shared/shared.module';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { AccountComponent } from './account/account.component';
import { AddressesComponent } from './addresses/addresses.component';
import { AddBillingAddressComponent } from './components/add-billing-address/add-billing-address.component';
import { ConfirmAddressComponent } from './components/confirm-address/confirm-address.component';
import { UsAddressComponent } from './components/country-addresses/us-address/us-address.component';
import { InvoiceVerificationComponent } from './components/invoice-verification/invoice-verification.component';
import { PulseAppComponent } from './components/pulse-app/pulse-app.component';
import { ReferFriendComponent } from './components/refer-friend/refer-friend.component';
import { ReferralLinkComponent } from './components/referral-link/referral-link.component';
import { CustomerDashboardRoutingModule } from './customer-dashboard-routing.module';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';
import { TrainingCenterComponent } from './training-center/training-center.component';
import { TrainingCenterHomeComponent } from './training-center/home/home.component';
import { TrainingCenterDetailComponent } from './training-center/detail/detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { PaymentCreateComponent } from './payment/payment-create/payment-create.component';
import { PaymentComponent } from './payment/payment.component';
import { TimerPipe } from './pipes/timer.pipe';
import { WebsiteHomeComponent } from './websites/home/home.component';
import { WebsiteSettingsComponent } from './websites/settings/settings.component';
import { WebsitesComponent } from './websites/websites.component';

@NgModule({
  declarations: [
    DashboardComponent,
    OrderHistoryComponent,
    AccountComponent,
    PaymentComponent,
    PaymentCreateComponent,
    AddBillingAddressComponent,
    UsAddressComponent,
    ConfirmAddressComponent,
    NotificationsComponent,
    ReferralLinkComponent,
    PulseAppComponent,
    OrderSuccessComponent,
    ReferFriendComponent,
    WebsitesComponent,
    WebsiteSettingsComponent,
    WebsiteHomeComponent,
    TimerPipe,
    AddressesComponent,
    AccountProfileComponent,
    AccountSettingsComponent,
    InvoiceVerificationComponent,
    DashboardWrapperComponent,
    TrainingCenterComponent,
    TrainingCenterHomeComponent,
    TrainingCenterDetailComponent,
  ],
  imports: [
    CommonModule,
    CustomerDashboardRoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgCircleProgressModule.forRoot({}),
    NgxMaskModule.forRoot(),
    QuillModule.forRoot(),
  ],
})
export class CustomerDashboardModule {}
