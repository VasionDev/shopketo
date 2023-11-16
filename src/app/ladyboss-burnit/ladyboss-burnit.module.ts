import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { BurnitComponent } from './burnit/burnit.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';

const routes: Routes = [
  { path: '', component: BurnitComponent },
  { path: 'confirmation', component: ConfirmationComponent },
];

@NgModule({
  declarations: [
    BurnitComponent,
    ConfirmationComponent
  ],
  imports:[
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
})
export class LadybossBurnitModule { }
