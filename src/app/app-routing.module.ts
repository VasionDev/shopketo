import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ImplicitModule } from './implicit/implicit.module';
import { HomeComponent } from './products/components/products-home/home.component';
import { ProductsModule } from './products/products.module';
import { Error404Component } from './shared/components/error404/error404.component';
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module';

const routes: Routes = [
  {
    path: 'blog',
    data: { name: 'blog', roles: ['pruvit'] },
    loadChildren: () => import('./blogs/blogs.module').then(m => m.BlogsModule),
  },
  {
    path: 'ca/blog',
    data: { name: 'blog', roles: ['pruvit'] },
    loadChildren: () => import('./blogs/blogs.module').then(m => m.BlogsModule),
  },
  {
    path: '',
    data: { name: 'pruvitHome', roles: ['all'] },
    loadChildren: () => ProductsModule,
  },
  {
    path: 'lean',
    data: { name: 'ladybossLean', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-lean/ladyboss-lean.module').then(m => m.LadybossLeanModule),
  },
  {
    path: 'champion',
    data: { name: 'champion', roles: ['ladyboss'] },
    redirectTo: 'makecake',
    pathMatch: 'full',
  },
  {
    path: 'makecake',
    data: { name: 'makecake', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-champion/ladyboss-champion.module').then(m => m.LadybossChampionModule)
  },
  {
    path: '5servings',
    data: { name: '5servings', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-5servings/ladyboss-5servings.module').then(m => m.Ladyboss5servingsModule)
  },
  {
    path: 'quickie',
    data: { name: 'quickie', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-quickie/ladyboss-quickie.module').then(m => m.LadybossQuickieModule)
  },
  {
    path: '30day-slimdown',
    data: { name: '30day-slimdown', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-shakedown/ladyboss-shakedown.module').then(m => m.LadybossShakedownModule)
  },
  {
    path: 'challenge/upgrade',
    data: { name: 'ladybossChallenge', roles: ['ladyboss'] },
    redirectTo: '5daycakechallenge/upgrade',
  },
  {
    path: 'challenge/thank-you-yes',
    data: { name: 'ladybossChallenge', roles: ['ladyboss'] },
    redirectTo: '5daycakechallenge/prepare',
  },
  {
    path: 'challenge/thank-you-no',
    data: { name: 'ladybossChallenge', roles: ['ladyboss'] },
    redirectTo: '5daycakechallenge/confirmation',
  },
  {
    path: 'challenge',
    data: { name: 'ladybossChallenge', roles: ['ladyboss'] },
    redirectTo: '5daycakechallenge',
  },
  {
    path: '5daycakechallenge',
    data: { name: 'ladyboss5DayChallenge', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-5daychallenge/ladyboss-5daychallenge.module').then(m => m.Ladyboss5daychallengeModule)
  },
  {
    path: 'replay',
    data: { name: 'ladybossReplay', roles: ['ladyboss'] },
    loadChildren: () => import('./ladyboss-replay/ladyboss-replay.module').then(m => m.LadybossReplayModule)
  },
  {
    path: 'cloud',
    data: { name: 'cloud', roles: ['pruvit'] },
    loadChildren: () => CustomerDashboardModule,
  },
  {
    path: 'dashboard',
    data: { name: 'dashboard', roles: ['ladyboss'] },
    loadChildren: () => CustomerDashboardModule,
  },
  {
    path: 'research',
    data: { name: 'research', roles: ['pruvit'] },
    loadChildren: () => import('./research/research.module').then(m => m.ResearchModule)
  },
  {
    path: 'press',
    data: { name: 'press', roles: ['pruvit'] },
    redirectTo: 'blog/category/press',
    pathMatch: 'full',
  },
  {
    path: 'ca/press',
    data: { name: 'press', roles: ['pruvit'] },
    redirectTo: 'ca/blog/category/press',
    pathMatch: 'full',
  },
  {
    path: 'ca/research',
    data: { name: 'research', roles: ['pruvit'] },
    loadChildren: () => import('./research/research.module').then(m => m.ResearchModule)
  },
  {
    path: 'ingredients',
    data: { name: 'ingredients', roles: ['pruvit'] },
    loadChildren: () => import('./ingredients/ingredient.module').then(m => m.IngredientModule)
  },
  {
    path: ':id/ingredients',
    data: { name: 'ingredients', roles: ['pruvit'] },
    loadChildren: () => import('./ingredients/ingredient.module').then(m => m.IngredientModule),
  },

  {
    path: 'shipping',
    data: { name: 'shipping', roles: ['pruvit'] },
    loadChildren: () => import('./shipping-redirect/shipping-redirect.module').then(m => m.ShippingRedirectModule)
  },
  {
    path: ':id/shipping',
    data: { name: 'shipping', roles: ['pruvit'] },
    loadChildren: () => import('./shipping-redirect/shipping-redirect.module').then(m => m.ShippingRedirectModule),
  },
  {
    path: 'shipping-policy',
    data: { name: 'home', roles: ['pruvit'] },
    loadChildren: () => import('./shipping-redirect/shipping-redirect.module').then(m => m.ShippingRedirectModule),
  },
  {
    path: ':id/shipping-policy',
    data: { name: 'shipping-policy', roles: ['pruvit'] },
    loadChildren: () => import('./shipping-redirect/shipping-redirect.module').then(m => m.ShippingRedirectModule),
  },
  {
    path: 'terms',
    data: { name: 'terms', roles: ['pruvit'] },
    loadChildren: () => import('./terms-redirect/terms-redirect.module').then(m => m.TermsRedirectModule),
  },
  {
    path: ':id/terms',
    data: { name: 'terms', roles: ['pruvit'] },
    loadChildren: () => import('./terms-redirect/terms-redirect.module').then(m => m.TermsRedirectModule),
  },
  {
    path: 'social',
    data: {name: 'social', roles: ['pruvit']},
    loadChildren: () => import('./social/social.module').then(m => m.SocialModule),  
  },
  {
    path: ':id/social',
    data: {name: 'social', roles: ['pruvit']},
    loadChildren: () => import('./social/social.module').then(m => m.SocialModule),  
  },
  {
    path: 'privacy',
    data: { name: 'privacy', roles: ['pruvit'] },
    loadChildren: () => import('./privacy-redirect/privacy-redirect.module').then(m => m.PrivacyRedirectModule)
  },
  {
    path: ':id/privacy',
    data: { name: 'privacy', roles: ['pruvit'] },
    loadChildren: () => import('./privacy-redirect/privacy-redirect.module').then(m => m.PrivacyRedirectModule)
  },
  {
    path: 'refund',
    data: { name: 'refund', roles: ['pruvit'] },
    loadChildren: () => import('./refund-redirect/refund-redirect.module').then(m => m.RefundRedirectModule)
  },
  {
    path: ':id/refund',
    data: { name: 'refund', roles: ['pruvit'] },
    loadChildren: () => import('./refund-redirect/refund-redirect.module').then(m => m.RefundRedirectModule)
  },
  {
    path: 'refunds',
    data: { name: 'refunds', roles: ['pruvit'] },
    loadChildren: () => import('./refund-redirect/refund-redirect.module').then(m => m.RefundRedirectModule)
  },
  {
    path: ':id/refunds',
    data: { name: 'refunds', roles: ['pruvit'] },
    loadChildren: () => import('./refund-redirect/refund-redirect.module').then(m => m.RefundRedirectModule)
  },
  {
    path: 'policies',
    data: { name: 'policies', roles: ['pruvit'] },
    loadChildren: () => import('./procedures-redirect/procedures-redirect.module').then(m => m.ProceduresRedirectModule)
  },
  {
    path: 'implicit',
    data: { name: 'implicit', roles: ['all'] },
    loadChildren: () => ImplicitModule,
  },
  {
    path: ':id/policies',
    data: { name: 'policies', roles: ['pruvit'] },
    loadChildren: () => import('./procedures-redirect/procedures-redirect.module').then(m => m.ProceduresRedirectModule),
  },
  {
    path: 'policies-and-procedures',
    data: { name: 'policies-and-procedures', roles: ['pruvit'] },
    loadChildren: () => import('./procedures-redirect/procedures-redirect.module').then(m => m.ProceduresRedirectModule),
  },
  {
    path: ':id/policies-and-procedures',
    data: { name: 'policies-and-procedures', roles: ['pruvit'] },
    loadChildren: () => import('./procedures-redirect/procedures-redirect.module').then(m => m.ProceduresRedirectModule),
  },
  {
    path: 'income-disclaimer',
    data: { name: 'income-disclaimer', roles: ['pruvit'] },
    loadChildren: () => import('./income-redirect/income-redirect.module').then(m => m.IncomeRedirectModule),
  },
  {
    path: ':id/income-disclaimer',
    data: { name: 'income-disclaimer', roles: ['pruvit'] },
    loadChildren: () => import('./income-redirect/income-redirect.module').then(m => m.IncomeRedirectModule),
  },
  {
    path: 'better-trips',
    data: { name: 'better-trips', roles: ['pruvit'] },
    loadChildren: () => import('./better-trips/better-trips.module').then(m => m.BetterTripsModule)
  },
  {
    path: ':id/better-trips',
    data: { name: 'better-trips', roles: ['pruvit'] },
    loadChildren: () => import('./better-trips/better-trips.module').then(m => m.BetterTripsModule)
  },
  {
    path: 'about',
    data: { name: 'about', roles: ['pruvit'] },
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
  },
  {
    path: ':id/about',
    data: { name: 'team', roles: ['pruvit'] },
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'team',
    data: { name: 'team', roles: ['pruvit'] },
    loadChildren: () => import('./team/team.module').then(m => m.TeamModule)
  },
  {
    path: ':id/team',
    data: { name: 'team', roles: ['pruvit'] },
    loadChildren: () => import('./team/team.module').then(m => m.TeamModule),
  },
  {
    path: ':country',
    data: { name: 'multisite-home', roles: ['pruvit'] },
    component: HomeComponent,
  },
  {
    path: 'facts',
    data: { name: 'ingredients', roles: ['pruvit'] },
    redirectTo: 'ingredients',
    pathMatch: 'full',
  },
  {
    path: ':id/facts',
    data: { name: 'ingredients', roles: ['pruvit'] },
    redirectTo: ':id/ingredients',
    pathMatch: 'full',
  },
  {
    path: 'ifast',
    data: { name: 'press', roles: ['pruvit'] },
    redirectTo: 'product/5-day-i-fast',
    pathMatch: 'full',
  },
  {
    path: ':id/ifast',
    data: { name: 'press', roles: ['pruvit'] },
    redirectTo: ':id/product/5-day-i-fast',
    pathMatch: 'full',
  },
  {
    path: 'reboot',
    data: { name: 'reboot', roles: ['pruvit'] },
    redirectTo: 'product/keto-reboot',
    pathMatch: 'full',
  },
  {
    path: ':id/reboot',
    data: { name: 'reboot', roles: ['pruvit'] },
    redirectTo: ':id/product/keto-reboot',
    pathMatch: 'full',
  },
  {
    path: '**',
    data: { name: 'error-404', roles: ['all'] },
    component: Error404Component,
  },
];

export function initApp(injector: Injector) {
  return () => {
    return new Promise<boolean>((resolve) => {
      const tenant = environment.tenant;
      console.log('tenant:', tenant);
      const filteredRoutes = routes.filter(
        (r: any) =>
          r.data['roles'].indexOf('all') !== -1 ||
          r.data['roles'].indexOf(tenant) !== -1
      );
      const router: Router = injector.get(Router);
      router.resetConfig(filteredRoutes);
      resolve(true);
    });
  };
}

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
    }),
  ],
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
export class AppRoutingModule {}
