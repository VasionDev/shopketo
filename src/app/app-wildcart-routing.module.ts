import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './products/components/products-home/home.component';
import { Error404Component } from './shared/components/error404/error404.component';

const routes: Routes = [
  { path: ':country', component: HomeComponent },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WildcartRoutingModule {}
