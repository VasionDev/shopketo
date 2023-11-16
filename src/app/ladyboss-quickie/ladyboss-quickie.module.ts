import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickieComponent } from './quickie/quickie.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: '', component: QuickieComponent }
];

@NgModule({
  declarations: [
    QuickieComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ]
})
export class LadybossQuickieModule { }
