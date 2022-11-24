import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsRedirectComponent } from './terms-redirect.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: TermsRedirectComponent }];

@NgModule({
  declarations: [TermsRedirectComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class TermsRedirectModule {}
