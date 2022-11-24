import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyRedirectComponent } from './privacy-redirect.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: PrivacyRedirectComponent }];

@NgModule({
  declarations: [PrivacyRedirectComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class PrivacyRedirectModule {}
