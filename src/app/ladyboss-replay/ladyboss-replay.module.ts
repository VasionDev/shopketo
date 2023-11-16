import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ReplayComponent } from './replay/replay.component';

const routes: Routes = [{ path: '', component: ReplayComponent }];

@NgModule({
  declarations: [ReplayComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class LadybossReplayModule {}
