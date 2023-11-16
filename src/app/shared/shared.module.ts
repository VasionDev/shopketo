import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { AccessRestrictedComponent } from './components/access-restricted/access-restricted.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { CookieDialogComponent } from './components/cookie-dialog/cookie-dialog.component';
import { Error404Component } from './components/error404/error404.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';
import { SpecialLoginComponent } from './components/special-login/special-login.component';
import { ViOfferComponent } from './components/vi-offer/vi-offer.component';
import { LottiePlayerDirective } from './directives/lottie-player.directive';
import { ModalBundleBuilderComponent } from './modals/modal-bundle-builder/modal-bundle-builder.component';
import { ModalCheckoutComponent } from './modals/modal-checkout/modal-checkout.component';
import { ModalCookieComponent } from './modals/modal-cookie/modal-cookie.component';
import { ModalImpersonationComponent } from './modals/modal-impersonation/modal-impersonation.component';
import { ModalPurchaseWarningComponent } from './modals/modal-purchase-warning/modal-purchase-warning.component';
import { ModalRestrictCheckoutComponent } from './modals/modal-restrict-checkout/modal-restrict-checkout.component';
import { ModalRestrictShareCartComponent } from './modals/modal-restrict-share-cart/modal-restrict-share-cart.component';
import { ModalUtilitiesComponent } from './modals/modal-utilities/modal-utilities.component';
import { ModalViComponent } from './modals/modal-vi/modal-vi.component';
import { ModalWaitlistComponent } from './modals/modal-waitlist/modal-waitlist.component';
import { CurrencyPipe } from './pipes/currency.pipe';
import { FormatPipe } from './pipes/format-string.pipe';
import { FormatTimerPipe } from './pipes/format-timer.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { InviteTimerPipe } from './pipes/invite-timer.pipe';
import { SearchBlogPipe } from './pipes/search-blog.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { SmartshipDiscountTextPipe } from './pipes/smartship-discount-text.pipe';
import { TextSanitizerPipe } from './pipes/text-sanitizer.pipe';
import { ModalLoginConfirmationComponent } from './modals/modal-login-confirmation/modal-login-confirmation.component';
import { ProductAvailabilityTooltipComponent } from '../products/components/common/product-card/product-availability-tooltip/product-availability-tooltip.component';

@NgModule({
  declarations: [
    Error404Component,
    TextSanitizerPipe,
    SearchPipe,
    HighlightPipe,
    LoaderComponent,
    SearchBlogPipe,
    LottiePlayerDirective,
    ModalPurchaseWarningComponent,
    ModalCookieComponent,
    FormatPipe,
    AccessRestrictedComponent,
    CookieDialogComponent,
    SpecialLoginComponent,
    ModalRestrictCheckoutComponent,
    ModalUtilitiesComponent,
    ModalCheckoutComponent,
    SmartshipDiscountTextPipe,
    CurrencyPipe,
    ModalViComponent,
    FormatTimerPipe,
    ViOfferComponent,
    SideNavigationComponent,
    ModalRestrictShareCartComponent,
    ModalImpersonationComponent,
    ModalWaitlistComponent,
    ModalBundleBuilderComponent,
    InviteTimerPipe,
    ContactFormComponent,
    ModalLoginConfirmationComponent,
    ProductAvailabilityTooltipComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatMenuModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SlickCarouselModule,
  ],
  exports: [
    Error404Component,
    TextSanitizerPipe,
    SearchPipe,
    HighlightPipe,
    LoaderComponent,
    SearchBlogPipe,
    LottiePlayerDirective,
    AccessRestrictedComponent,
    FormatPipe,
    CookieDialogComponent,
    SpecialLoginComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatMenuModule,
    CurrencyPipe,
    FormatTimerPipe,
    InviteTimerPipe,
    ViOfferComponent,
    SideNavigationComponent,
    ContactFormComponent,
    ProductAvailabilityTooltipComponent
  ],
})
export class SharedModule {}
