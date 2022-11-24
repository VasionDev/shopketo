import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefundRedirectComponent } from './refund-redirect.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: RefundRedirectComponent }];

@NgModule({
  declarations: [RefundRedirectComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class RefundRedirectModule {}
