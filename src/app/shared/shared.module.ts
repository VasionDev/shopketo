import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Component } from './components/error404/error404.component';
import { TranslateModule } from '@ngx-translate/core';
import { TextSanitizerPipe } from './pipes/text-sanitizer.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { LoaderComponent } from './components/loader/loader.component';
import { SearchBlogPipe } from './pipes/search-blog.pipe';
import { LottiePlayerDirective } from './directives/lottie-player.directive';
import { FormatPipe } from './pipes/format-string.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { AccessRestrictedComponent } from './components/access-restricted/access-restricted.component';
import { ModalPurchaseWarningComponent } from './modals/modal-purchase-warning/modal-purchase-warning.component';
import { ModalCookieComponent } from './modals/modal-cookie/modal-cookie.component';
import { CookieDialogComponent } from './components/cookie-dialog/cookie-dialog.component';
import { SpecialLoginComponent } from './components/special-login/special-login.component';
import { ModalRestrictCheckoutComponent } from './modals/modal-restrict-checkout/modal-restrict-checkout.component';
import { ModalUtilitiesComponent } from './modals/modal-utilities/modal-utilities.component';
import { ModalCheckoutComponent } from './modals/modal-checkout/modal-checkout.component';
import { SmartshipDiscountTextPipe } from './pipes/smartship-discount-text.pipe';
import { ClipboardModule } from 'ngx-clipboard';
import { CurrencyPipe } from './pipes/currency.pipe';
import { ModalViComponent } from './modals/modal-vi/modal-vi.component';
import { FormatTimerPipe } from './pipes/format-timer.pipe';
import { ViOfferComponent } from './components/vi-offer/vi-offer.component';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';
import { RouterModule } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ModalRestrictShareCartComponent } from './modals/modal-restrict-share-cart/modal-restrict-share-cart.component';
import { ModalImpersonationComponent } from './modals/modal-impersonation/modal-impersonation.component';

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
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatMenuModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SlickCarouselModule
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
    ViOfferComponent,
    SideNavigationComponent,
  ],
})
export class SharedModule { }
