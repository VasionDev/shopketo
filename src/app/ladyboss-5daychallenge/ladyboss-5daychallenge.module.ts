import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './components/home/home.component';
import { ThankYouNoComponent } from './components/thank-you-no/thank-you-no.component';
import { ThankYouYesComponent } from './components/thank-you-yes/thank-you-yes.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upgrade', component: UpgradeComponent },
  {
    path: 'prepare',
    component: ThankYouYesComponent,
  },
  {
    path: 'confirmation',
    component: ThankYouNoComponent,
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    UpgradeComponent,
    ThankYouYesComponent,
    ThankYouNoComponent
  ],
  imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
})
export class Ladyboss5daychallengeModule { }
