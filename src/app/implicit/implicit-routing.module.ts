import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImplicitComponent } from './implicit/implicit.component';
const routes: Routes = [
  {
    path: '',
    component: ImplicitComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImplicitRoutingModule {}
