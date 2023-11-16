import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SocialComponent } from './social/social.component';

const routes: Routes = [
  { path: '', component: SocialComponent }
];

@NgModule({
  declarations: [
    SocialComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ]
})
export class SocialModule { }
