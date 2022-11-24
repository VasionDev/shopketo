import { NgModule } from '@angular/core';
import { IncomeRedirectComponent } from './income-redirect.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: IncomeRedirectComponent }];

@NgModule({
  declarations: [IncomeRedirectComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class IncomeRedirectModule {}
