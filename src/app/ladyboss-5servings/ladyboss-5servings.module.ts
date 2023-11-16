import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FiveServingsComponent } from './five-servings/five-servings.component';

const routes: Routes = [
  { path: '', component: FiveServingsComponent }
];

@NgModule({
  declarations: [
    FiveServingsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ]
})
export class Ladyboss5servingsModule { }
