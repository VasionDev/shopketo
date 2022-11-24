import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { BetterTripsComponent } from './better-trips.component';

const routes: Routes = [{ path: '', component: BetterTripsComponent }];

@NgModule({
  declarations: [BetterTripsComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class BetterTripsModule {}
