import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutModule } from './about/about.module';
import { BetterTripsModule } from './better-trips/better-trips.module';
import { BlogsModule } from './blogs/blogs.module';
import { ImplicitModule } from './implicit/implicit.module';
import { IncomeRedirectModule } from './income-redirect/income-redirect.module';
import { IngredientModule } from './ingredients/ingredient.module';
import { PrivacyRedirectModule } from './privacy-redirect/privacy-redirect.module';
import { ProceduresRedirectModule } from './procedures-redirect/procedures-redirect.module';
import { RefundRedirectModule } from './refund-redirect/refund-redirect.module';
import { ResearchModule } from './research/research.module';
import { ShippingRedirectModule } from './shipping-redirect/shipping-redirect.module';
import { TeamModule } from './team/team.module';
import { TermsRedirectModule } from './terms-redirect/terms-redirect.module';

const routes: Routes = [
  {
    path: 'research',
    loadChildren: () => ResearchModule,
  },
  {
    path: 'press',
    redirectTo: 'blog/category/press',
    pathMatch: 'full',
  },
  {
    path: 'ca/press',
    redirectTo: 'ca/blog/category/press',
    pathMatch: 'full',
  },
  {
    path: 'ca/research',
    loadChildren: () => ResearchModule,
  },

  {
    path: 'blog',
    loadChildren: () => BlogsModule,
  },
  {
    path: 'ca/blog',
    loadChildren: () => BlogsModule,
  },

  {
    path: 'ingredients',
    loadChildren: () => IngredientModule,
  },
  {
    path: ':id/ingredients',
    loadChildren: () => IngredientModule,
  },

  {
    path: 'shipping',
    loadChildren: () => ShippingRedirectModule,
  },
  {
    path: ':id/shipping',
    loadChildren: () => ShippingRedirectModule,
  },
  {
    path: 'shipping-policy',
    loadChildren: () => ShippingRedirectModule,
  },
  {
    path: ':id/shipping-policy',
    loadChildren: () => ShippingRedirectModule,
  },

  {
    path: 'terms',
    loadChildren: () => TermsRedirectModule,
  },
  {
    path: ':id/terms',
    loadChildren: () => TermsRedirectModule,
  },

  {
    path: 'privacy',
    loadChildren: () => PrivacyRedirectModule,
  },
  {
    path: ':id/privacy',
    loadChildren: () => PrivacyRedirectModule,
  },

  {
    path: 'refund',
    loadChildren: () => RefundRedirectModule,
  },
  {
    path: ':id/refund',
    loadChildren: () => RefundRedirectModule,
  },
  {
    path: 'refunds',
    loadChildren: () => RefundRedirectModule,
  },
  {
    path: ':id/refunds',
    loadChildren: () => RefundRedirectModule,
  },

  {
    path: 'policies',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: 'implicit',
    loadChildren: () => ImplicitModule,
  },
  {
    path: ':id/policies',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: 'policies-and-procedures',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: ':id/policies-and-procedures',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: 'income-disclaimer',
    loadChildren: () => IncomeRedirectModule,
  },
  {
    path: ':id/income-disclaimer',
    loadChildren: () => IncomeRedirectModule,
  },
  {
    path: 'better-trips',
    loadChildren: () => BetterTripsModule,
  },
  {
    path: ':id/better-trips',
    loadChildren: () => BetterTripsModule,
  },
  {
    path: 'team',
    loadChildren: () => TeamModule,
  },
  {
    path: ':id/team',
    loadChildren: () => TeamModule,
  },
  {
    path: 'about',
    loadChildren: () => AboutModule,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
