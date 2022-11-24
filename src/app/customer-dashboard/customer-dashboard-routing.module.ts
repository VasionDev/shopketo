import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { AccountComponent } from './account/account.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PaymentComponent } from './payment/payment.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { AutoLoginGuard } from 'angular-auth-oidc-client';
import { WebsitesComponent } from './websites/websites.component';
import { WebsiteSettingsComponent } from './websites/settings/settings.component';
import { WebsiteHomeComponent } from './websites/home/home.component';
import { AddressesComponent } from './addresses/addresses.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';
import { TrainingCenterComponent } from './training-center/training-center.component';
import { TrainingCenterHomeComponent } from './training-center/home/home.component';
import { TrainingCenterDetailComponent } from './training-center/detail/detail.component';
const routes: Routes = [
  {
    path: '',
    component: DashboardWrapperComponent,
    canActivate: [AutoLoginGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AutoLoginGuard],
      },
      {
        path: 'dashboard/order-history',
        component: OrderHistoryComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/account',
        component: AccountComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/payment',
        component: PaymentComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/settings',
        component: AccountSettingsComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/notifications',
        component: NotificationsComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/order-success',
        component: OrderSuccessComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/profile',
        component: AccountProfileComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/addresses',
        component: AddressesComponent,
        canActivate: [AutoLoginGuard]
      },
      {
        path: 'dashboard/websites',
        component: WebsitesComponent,
        canActivate: [AutoLoginGuard],
        children: [
          { path: '', component: WebsiteHomeComponent },
          { path: ':site', component: WebsiteSettingsComponent },
        ],
      },
      {
        path: 'dashboard/training-center',
        component: TrainingCenterComponent,
        canActivate: [AutoLoginGuard],
        children: [
          { path: '', component: TrainingCenterHomeComponent },
          { path: ':slug', component: TrainingCenterDetailComponent },
        ],
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerDashboardRoutingModule { }
