import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { Route, Router, RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CartComponent } from './components/cart/cart.component';
import { LearnComponent } from './components/learn/learn.component';
import { PagesComponent } from './components/pages/pages.component';
import { ProductDetailComponent } from './components/product-details/details.component';
import { HomeComponent } from './components/products-home/home.component';
import { BrandBuilderComponent } from './components/promoter/brand-builder/brand-builder.component';
import { PromoterComponent } from './components/promoter/promoter.component';
import { ReferrerHomeComponent } from './components/referrer-home/referrer-home.component';
import { SearchComponent } from './components/search/search.component';
import { SmartshipComponent } from './components/smartship/smartship.component';
import { TagsAndCategoriesComponent } from './components/tags-and-categories/tags-and-categories.component';
import { VipComponent } from './components/vip/vip.component';

const routes: Routes = [
  {
    path: '',
    data: { name: 'productHome', roles: ['pruvit'] },
    component: HomeComponent,
  },
  {
    path: '',
    data: { name: 'productHome', roles: ['ladyboss'] },
    component: PromoterComponent,
  },
  {
    path: 'startup',
    data: { name: 'promoterStartUp', roles: ['ladyboss'] },
    redirectTo: 'makecake',
    pathMatch: 'full',
  },
  {
    path: 'product/start-up-pack',
    data: { name: 'promoterStartUp', roles: ['ladyboss'] },
    redirectTo: 'makecake',
    pathMatch: 'full',
  },
  {
    path: 'search',
    data: { name: 'search', roles: ['pruvit'] },
    component: SearchComponent,
  },
  {
    path: ':id/search',
    data: { name: 'search', roles: ['pruvit'] },
    component: SearchComponent,
  },
  {
    path: 'category/keto-os-pro',
    data: { name: 'category', roles: ['pruvit'] },
    redirectTo: 'category/ketoos-pro',
    pathMatch: 'full',
  },
  {
    path: ':id/category/keto-os-pro',
    data: { name: 'category', roles: ['pruvit'] },
    redirectTo: ':id/category/ketoos-pro',
    pathMatch: 'full',
  },
  {
    path: 'category/champion-pack',
    data: { name: 'category', roles: ['ladyboss'] },
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'category/shop-all',
    data: { name: 'category', roles: ['ladyboss'] },
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'category/:id',
    data: { name: 'category', roles: ['all'] },
    component: TagsAndCategoriesComponent,
  },
  {
    path: ':id/category/:id',
    data: { name: 'category', roles: ['all'] },
    component: TagsAndCategoriesComponent,
  },
  {
    path: 'tag/:id',
    data: { name: 'tag', roles: ['pruvit'] },
    component: TagsAndCategoriesComponent,
  },
  {
    path: ':id/tag/:id',
    data: { name: 'tag', roles: ['pruvit'] },
    component: TagsAndCategoriesComponent,
  },
  {
    path: 'product/:id',
    data: { name: 'product', roles: ['all'] },
    component: ProductDetailComponent,
  },
  {
    path: ':id/product/:id',
    data: { name: 'product', roles: ['all'] },
    component: ProductDetailComponent,
  },
  {
    path: 'page/:id',
    data: { name: 'page', roles: ['pruvit'] },
    component: PagesComponent,
  },
  {
    path: ':id/page/:id',
    data: { name: 'page', roles: ['pruvit'] },
    component: PagesComponent,
  },
  {
    path: 'smartship',
    data: { name: 'smartship', roles: ['pruvit'] },
    component: SmartshipComponent,
  },
  {
    path: ':id/smartship',
    data: { name: 'smartship', roles: ['pruvit'] },
    component: SmartshipComponent,
  },
  {
    path: 'smartship/about',
    data: { name: 'about smartship', roles: ['pruvit'] },
    // component: SmartshipAboutComponent,
    redirectTo: 'vip',
    pathMatch: 'full'
  },
  {
    path: ':id/smartship/about',
    data: { name: 'about smartship', roles: ['pruvit'] },
    // component: SmartshipAboutComponent,
    redirectTo: ':id/vip',
    pathMatch: 'full'
  },
  {
    path: 'promoter',
    data: { name: 'promoter', roles: ['pruvit'] },
    component: PromoterComponent,
  },
  {
    path: ':id/promoter',
    data: { name: 'promoter', roles: ['pruvit'] },
    component: PromoterComponent,
  },
  {
    path: 'promoter/:id',
    data: { name: 'promoter', roles: ['pruvit'] },
    component: BrandBuilderComponent,
  },
  {
    path: ':id/promoter/:id',
    data: { name: 'promoter', roles: ['pruvit'] },
    component: BrandBuilderComponent,
  },
  {
    path: 'systems',
    data: { name: 'systems', roles: ['pruvit'] },
    redirectTo: 'category/systems',
    pathMatch: 'full',
  },
  {
    path: ':id/systems',
    data: { name: 'systems', roles: ['pruvit'] },
    redirectTo: ':id/category/systems',
    pathMatch: 'full',
  },
  {
    path: 'vipclub',
    data: { name: 'vipclub', roles: ['pruvit'] },
    redirectTo: 'vip',
    pathMatch: 'full',
  },
  {
    path: ':id/vipclub',
    data: { name: 'vipclub', roles: ['pruvit'] },
    redirectTo: ':id/vip',
    pathMatch: 'full',
  },
  {
    path: 'vip',
    data: { name: 'vip', roles: ['pruvit'] },
    component: VipComponent,
  },
  {
    path: ':id/vip',
    data: { name: 'vip', roles: ['pruvit'] },
    component: VipComponent,
  },
  {
    path: 'learn',
    data: { name: 'learn', roles: ['pruvit'] },
    component: LearnComponent,
  },
  {
    path: ':id/learn',
    data: { name: 'learn', roles: ['pruvit'] },
    component: LearnComponent,
  },
  {
    path: 'me',
    data: { name: 'me', roles: ['pruvit'] },
    component: ReferrerHomeComponent,
  },
  {
    path: ':id/me',
    data: { name: 'me', roles: ['pruvit'] },
    component: ReferrerHomeComponent,
  },
  {
    path: 'cart',
    data: { name: 'cart', roles: ['pruvit'] },
    component: CartComponent,
  },
  {
    path: ':id/cart',
    data: { name: 'cart', roles: ['pruvit'] },
    component: CartComponent,
  },
];

export function initApp(injector: Injector) {
  return () => {
    return new Promise<boolean>((resolve) => {
      const tenant = environment.tenant;
      const filteredRoutes = routes.filter((route: Route) =>
        route.data
          ? route.data['roles'].indexOf('all') !== -1 ||
            route.data['roles'].indexOf(tenant) !== -1
          : false
      );
      const router: Router = injector.get(Router);
      const existingRouter = router.config.filter(
        (route: Route) => route.path !== ''
      );
      const currentRoutes = [...filteredRoutes, ...existingRouter];
      const startWithstaticRoute = currentRoutes.filter(
        (route: Route) =>
          !route.path?.startsWith(':') && !route.path?.startsWith('**')
      );
      const startWithdynamicRoute = currentRoutes.filter((route: Route) =>
        route.path?.startsWith(':')
      );
      const wildcardRoute = currentRoutes.filter((route: Route) =>
        route.path?.startsWith('**')
      );
      router.resetConfig([
        ...startWithstaticRoute,
        ...startWithdynamicRoute,
        ...wildcardRoute,
      ]);
      resolve(true);
    });
  };
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [Injector],
      multi: true,
    },
  ],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
