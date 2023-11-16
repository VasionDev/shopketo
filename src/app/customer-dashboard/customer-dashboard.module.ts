import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxMaskModule } from 'ngx-mask';
import { QuillModule } from 'ngx-quill';
import { SlickCarouselModule } from 'ngx-slick-carousel';
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
import { RecentOrdersComponent } from './components/recent-orders/recent-orders.component';
import { ReferFriendComponent } from './components/refer-friend/refer-friend.component';
import { ReferralLinkComponent } from './components/referral-link/referral-link.component';
import { UpcomingSmartshipsComponent } from './components/upcoming-smartships/upcoming-smartships.component';
import { CustomerDashboardRoutingModule } from './customer-dashboard-routing.module';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeadsComponent } from './leads/leads.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { PaymentCreateComponent } from './payment/payment-create/payment-create.component';
import { PaymentComponent } from './payment/payment.component';
import { TimerPipe } from './pipes/timer.pipe';
import { RewardsComponent } from './rewards/rewards.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { TrainingCenterDetailComponent } from './training-center/detail/detail.component';
import { TrainingCenterHomeComponent } from './training-center/home/home.component';
import { TrainingCenterComponent } from './training-center/training-center.component';
import { WalletComponent } from './wallet/wallet.component';
import { WebsiteHomeComponent } from './websites/home/home.component';
import { WebsiteSettingsComponent } from './websites/settings/settings.component';
import { WebsitesComponent } from './websites/websites.component';
import { CaAddressComponent } from './components/country-addresses/ca-address/ca-address.component';
import { AuAddressComponent } from './components/country-addresses/au-address/au-address.component';
import { NzAddressComponent } from './components/country-addresses/nz-address/nz-address.component';
import { MxAddressComponent } from './components/country-addresses/mx-address/mx-address.component';
import { CnAddressComponent } from './components/country-addresses/cn-address/cn-address.component';
import { AlAddressComponent } from './components/country-addresses/al-address/al-address.component';
import { AtAddressComponent } from './components/country-addresses/at-address/at-address.component';
import { BgAddressComponent } from './components/country-addresses/bg-address/bg-address.component';
import { BeAddressComponent } from './components/country-addresses/be-address/be-address.component';
import { ChAddressComponent } from './components/country-addresses/ch-address/ch-address.component';
import { CyAddressComponent } from './components/country-addresses/cy-address/cy-address.component';
import { CzAddressComponent } from './components/country-addresses/cz-address/cz-address.component';
import { DeAddressComponent } from './components/country-addresses/de-address/de-address.component';
import { DkAddressComponent } from './components/country-addresses/dk-address/dk-address.component';
import { EeAddressComponent } from './components/country-addresses/ee-address/ee-address.component';
import { EsAddressComponent } from './components/country-addresses/es-address/es-address.component';
import { FiAddressComponent } from './components/country-addresses/fi-address/fi-address.component';
import { FrAddressComponent } from './components/country-addresses/fr-address/fr-address.component';
import { GrAddressComponent } from './components/country-addresses/gr-address/gr-address.component';
import { HrAddressComponent } from './components/country-addresses/hr-address/hr-address.component';
import { HuAddressComponent } from './components/country-addresses/hu-address/hu-address.component';
import { LtAddressComponent } from './components/country-addresses/lt-address/lt-address.component';
import { LuAddressComponent } from './components/country-addresses/lu-address/lu-address.component';
import { RoAddressComponent } from './components/country-addresses/ro-address/ro-address.component';
import { SiAddressComponent } from './components/country-addresses/si-address/si-address.component';
import { SkAddressComponent } from './components/country-addresses/sk-address/sk-address.component';
import { GbAddressComponent } from './components/country-addresses/gb-address/gb-address.component';
import { IeAddressComponent } from './components/country-addresses/ie-address/ie-address.component';
import { ItAddressComponent } from './components/country-addresses/it-address/it-address.component';
import { LvAddressComponent } from './components/country-addresses/lv-address/lv-address.component';
import { MtAddressComponent } from './components/country-addresses/mt-address/mt-address.component';
import { NlAddressComponent } from './components/country-addresses/nl-address/nl-address.component';
import { PlAddressComponent } from './components/country-addresses/pl-address/pl-address.component';
import { PtAddressComponent } from './components/country-addresses/pt-address/pt-address.component';
import { SeAddressComponent } from './components/country-addresses/se-address/se-address.component';
import { HkAddressComponent } from './components/country-addresses/hk-address/hk-address.component';
import { MoAddressComponent } from './components/country-addresses/mo-address/mo-address.component';
import { MyAddressComponent } from './components/country-addresses/my-address/my-address.component';
import { SgAddressComponent } from './components/country-addresses/sg-address/sg-address.component';
import { TwAddressComponent } from './components/country-addresses/tw-address/tw-address.component';
import { TimerComponent } from './components/timer/timer.component';
import { JpAddressComponent } from './components/country-addresses/jp-address/jp-address.component';
import { PaymentStatusBannerComponent } from './components/payment-status-banner/payment-status-banner.component';

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
    LeadsComponent,
    DashboardWrapperComponent,
    TrainingCenterComponent,
    TrainingCenterHomeComponent,
    TrainingCenterDetailComponent,
    UpcomingSmartshipsComponent,
    SubscriptionsComponent,
    RecentOrdersComponent,
    RewardsComponent,
    WalletComponent,
    CaAddressComponent,
    AuAddressComponent,
    NzAddressComponent,
    MxAddressComponent,
    CnAddressComponent,
    AlAddressComponent,
    AtAddressComponent,
    BgAddressComponent,
    BeAddressComponent,
    ChAddressComponent,
    CyAddressComponent,
    CzAddressComponent,
    DeAddressComponent,
    DkAddressComponent,
    EeAddressComponent,
    EsAddressComponent,
    FiAddressComponent,
    FrAddressComponent,
    GrAddressComponent,
    HrAddressComponent,
    HuAddressComponent,
    LtAddressComponent,
    LuAddressComponent,
    RoAddressComponent,
    SiAddressComponent,
    SkAddressComponent,
    GbAddressComponent,
    IeAddressComponent,
    ItAddressComponent,
    LvAddressComponent,
    MtAddressComponent,
    NlAddressComponent,
    PlAddressComponent,
    PtAddressComponent,
    SeAddressComponent,
    HkAddressComponent,
    MoAddressComponent,
    MyAddressComponent,
    SgAddressComponent,
    TwAddressComponent,
    TimerComponent,
    JpAddressComponent,
    PaymentStatusBannerComponent,
  ],
  imports: [
    CommonModule,
    CustomerDashboardRoutingModule,
    ClipboardModule,
    SharedModule,
    SlickCarouselModule,
    NgCircleProgressModule.forRoot({}),
    NgxMaskModule.forRoot(),
    QuillModule.forRoot(),
    A11yModule
  ],
})
export class CustomerDashboardModule { }
