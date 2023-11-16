import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutoLoginGuard } from 'angular-auth-oidc-client';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './components/home/home.component';
import { ThankYouNoComponent } from './components/thank-you-no/thank-you-no.component';
import { ThankYouYesComponent } from './components/thank-you-yes/thank-you-yes.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upgrade', component: UpgradeComponent },
  {
    path: 'thank-you-yes',
    canActivate: [AutoLoginGuard],
    component: ThankYouYesComponent,
  },
  {
    path: 'thank-you-no',
    component: ThankYouNoComponent,
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    UpgradeComponent,
    ThankYouYesComponent,
    ThankYouNoComponent,
  ],
  imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
})
export class LadybossChallengeModule {}
