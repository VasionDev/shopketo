import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShippingRedirectComponent } from './shipping-redirect.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: ShippingRedirectComponent }];

@NgModule({
  declarations: [ShippingRedirectComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class ShippingRedirectModule {}
