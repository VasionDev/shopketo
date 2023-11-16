import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { LadybossInviteRoutingModule } from './ladyboss-invite-routing.module';

@NgModule({
  declarations: [HomeComponent, RegisterComponent, ThankYouComponent],
  imports: [
    CommonModule,
    SharedModule,
    LadybossInviteRoutingModule,
    ReactiveFormsModule,
  ],
})
export class LadybossInviteModule {
  constructor(@Optional() @SkipSelf() parentModule: LadybossInviteModule) {
    if (parentModule) {
      throw new Error(
        'LadybossModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
