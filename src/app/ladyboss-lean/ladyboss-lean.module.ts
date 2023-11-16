import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LeanComponent } from './lean/lean.component';

const routes: Routes = [
  { path: '', component: LeanComponent },
];

@NgModule({
  declarations: [
    LeanComponent
  ],
  imports: [RouterModule.forChild(routes), CommonModule, SharedModule]
})
export class LadybossLeanModule { }
