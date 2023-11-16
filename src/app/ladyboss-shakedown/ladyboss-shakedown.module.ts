import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShakedownComponent } from './shakedown/shakedown.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: ShakedownComponent },
  { path: 'thankyou', component: ConfirmationComponent },
];


@NgModule({
  declarations: [
    ShakedownComponent,
    ConfirmationComponent
  ],
  imports:[
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
})
export class LadybossShakedownModule { }
