import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProceduresRedirectComponent } from './procedures-redirect.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: ProceduresRedirectComponent }];

@NgModule({
  declarations: [ProceduresRedirectComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class ProceduresRedirectModule {}
