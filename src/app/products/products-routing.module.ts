import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { LearnComponent } from './components/learn/learn.component';
import { PagesComponent } from './components/pages/pages.component';
import { ProductDetailComponent } from './components/product-details/details.component';
import { HomeComponent } from './components/products-home/home.component';
import { BrandBuilderComponent } from './components/promoter/brand-builder/brand-builder.component';
import { PromoterComponent } from './components/promoter/promoter.component';
import { ReferrerHomeComponent } from './components/referrer-home/referrer-home.component';
import { SearchComponent } from './components/search/search.component';
import { SmartshipAboutComponent } from './components/smartship/smartship-about/smartship-about.component';
import { SmartshipComponent } from './components/smartship/smartship.component';
import { TagsAndCategoriesComponent } from './components/tags-and-categories/tags-and-categories.component';
import { VipComponent } from './components/vip/vip.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: ':id/search', component: SearchComponent },
  {
    path: 'category/keto-os-pro',
    redirectTo: 'category/ketoos-pro',
    pathMatch: 'full',
  },
  {
    path: ':id/category/keto-os-pro',
    redirectTo: ':id/category/ketoos-pro',
    pathMatch: 'full',
  },
  { path: 'category/:id', component: TagsAndCategoriesComponent },
  { path: ':id/category/:id', component: TagsAndCategoriesComponent },
  { path: 'tag/:id', component: TagsAndCategoriesComponent },
  { path: ':id/tag/:id', component: TagsAndCategoriesComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: ':id/product/:id', component: ProductDetailComponent },
  { path: 'page/:id', component: PagesComponent },
  { path: ':id/page/:id', component: PagesComponent },
  { path: 'smartship', component: SmartshipComponent },
  { path: ':id/smartship', component: SmartshipComponent },
  { path: 'smartship/about', component: SmartshipAboutComponent },
  { path: ':id/smartship/about', component: SmartshipAboutComponent },
  { path: 'promoter', component: PromoterComponent },
  { path: ':id/promoter', component: PromoterComponent },
  { path: 'promoter/:id', component: BrandBuilderComponent },
  { path: ':id/promoter/:id', component: BrandBuilderComponent },
  {
    path: 'systems',
    redirectTo: 'category/systems',
    pathMatch: 'full',
  },
  {
    path: ':id/systems',
    redirectTo: ':id/category/systems',
    pathMatch: 'full',
  },
  {
    path: 'vip',
    component: VipComponent,
  },
  {
    path: ':id/vip',
    component: VipComponent,
  },
  {
    path: 'learn',
    component: LearnComponent,
  },
  {
    path: ':id/learn',
    component: LearnComponent,
  },
  {
    path: 'me',
    component: ReferrerHomeComponent,
  },
  {
    path: ':id/me',
    component: ReferrerHomeComponent,
  },
  {
    path: 'me/approve',
    component: ReferrerHomeComponent,
  },
  {
    path: ':id/me/approve',
    component: ReferrerHomeComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: ':id/cart',
    component: CartComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
