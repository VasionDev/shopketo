import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { TeamComponent } from './team.component';

const routes: Routes = [{ path: '', component: TeamComponent }];

@NgModule({
  declarations: [TeamComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class TeamModule {}
