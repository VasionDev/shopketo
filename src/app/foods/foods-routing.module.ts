import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FoodsComponent } from './foods.component';
import { FoodsHomeComponent } from './components/foods-home/foods-home.component';
import { FoodsSelectComponent } from './components/foods-select/foods-select.component';

const routes: Routes = [
  {
    path: '',
    component: FoodsComponent,
    children: [
      { path: '', component: FoodsHomeComponent },
      { path: 'select', component: FoodsSelectComponent },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodsRoutingModule {}
