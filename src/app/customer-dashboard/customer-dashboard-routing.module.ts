import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutoLoginGuard } from 'angular-auth-oidc-client';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { AccountComponent } from './account/account.component';
import { AddressesComponent } from './addresses/addresses.component';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeadsComponent } from './leads/leads.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { PaymentComponent } from './payment/payment.component';
import { RewardsComponent } from './rewards/rewards.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { TrainingCenterDetailComponent } from './training-center/detail/detail.component';
import { TrainingCenterHomeComponent } from './training-center/home/home.component';
import { TrainingCenterComponent } from './training-center/training-center.component';
import { WalletComponent } from './wallet/wallet.component';
import { WebsiteHomeComponent } from './websites/home/home.component';
import { WebsiteSettingsComponent } from './websites/settings/settings.component';
import { WebsitesComponent } from './websites/websites.component';
const routes: Routes = [
  {
    path: '',
    component: DashboardWrapperComponent,
    canActivate: [AutoLoginGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'subscriptions',
        component: SubscriptionsComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'leads',
        component: LeadsComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'order-history',
        component: OrderHistoryComponent,
        canActivate: [AutoLoginGuard],
      },
      /*{
        path: 'account',
        component: AccountComponent,
        canActivate: [AutoLoginGuard],
      },*/
      {
        path: 'payment',
        component: PaymentComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'account',
        component: AccountSettingsComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'order-success',
        component: OrderSuccessComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'profile',
        component: AccountProfileComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'wallet',
        component: WalletComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'addresses',
        component: AddressesComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'websites',
        component: WebsitesComponent,
        canActivate: [AutoLoginGuard],
        children: [
          { path: '', component: WebsiteHomeComponent },
          { path: ':site', component: WebsiteSettingsComponent },
        ],
      },
      {
        path: 'training-center',
        component: TrainingCenterComponent,
        canActivate: [AutoLoginGuard],
        children: [
          { path: '', component: TrainingCenterHomeComponent },
          { path: ':slug', component: TrainingCenterDetailComponent },
        ],
      },
      {
        path: 'rewards',
        component: RewardsComponent,
        canActivate: [AutoLoginGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerDashboardRoutingModule {}
