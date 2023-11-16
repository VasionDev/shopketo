import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { Product } from 'src/app/products/models/product.model';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { AppCheckoutService } from '../../services/app-checkout.service';
import { AppUserService } from '../../services/app-user.service';
declare var $: any;

@Component({
  selector: 'app-modal-checkout',
  templateUrl: './modal-checkout.component.html',
  styleUrls: ['./modal-checkout.component.css'],
})
export class ModalCheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('input', { static: false }) input!: ElementRef;
  @Input() modals!: any[];
  @Input() product = {} as Product;
  tenant!: string;
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  refCode = '';
  isReferrerPresent = true;
  referrer: any = {};
  currentOffer = 0;
  isSubmittable = false;
  currencySymbol = '$';
  referrerRedirectModal = '';
  defaultLanguage = '';
  checkoutFullLink = '';
  googleConversionId = '';
  googleConversionLabel = '';
  referrerVideoId = '';
  isCheckoutFromFood = false;
  subscriptions: SubscriptionLike[] = [];
  isEmailValid = false;
  isStaging = false;

  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private router: Router,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private checkoutService: AppCheckoutService,
    private appComponent: AppComponent,
    private userService: AppUserService
  ) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    $(document).on('shown.bs.modal', '#referrerCode', () => {
      if (this.input) {
        this.input.nativeElement.focus();
      }
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getReferrer();
    this.getModals();
    this.getCartOrCheckoutModal();
    this.checkIsCheckoutFromFood();

    $(document).on('shown.bs.modal', '#waitlistModal', () => {
      $('body').addClass('modal-open');
    });

    $(document).on('shown.bs.modal', '#getTheFreeModal', () => {
      $('body').addClass('modal-open');
    });
  }

  checkIsCheckoutFromFood() {
    this.subscriptions.push(
      this.dataService.currentIsCheckoutFromFood$.subscribe((status) => {
        this.isCheckoutFromFood = status;
      })
    );
  }

  getCartOrCheckoutModal() {
    this.subscriptions.push(
      this.dataService.currentCartOrCheckoutModal$.subscribe((name: string) => {
        if (name !== '') {
          this.referrerRedirectModal = name;
        }
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);

          this.getProducts();
        }
      )
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
      })
    );
  }

  getProducts() {
    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }

        this.defaultLanguage = data.productsData.default_lang;

        this.productsData = data.productsData;
        this.getCurrencySymbol();
        this.getCheckoutFullLink();
      })
    );
  }

  getCheckoutFullLink() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;

      this.checkoutFullLink = productsSettings.checkout_url;
    }
  }

  getCurrencySymbol() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';
    }
  }

  getReferrer() {
    this.subscriptions.push(
      this.dataService.currentReferrerData$.subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
          this.refCode = referrer.code;
          this.referrerVideoId = referrer.video_id ? referrer.video_id : '';
        }
      })
    );
  }

  getModals() {
    if (this.modals.length === 1) {
      this.modals.forEach((singleModal: any) => {
        if (singleModal.modalName === 'referrerCode') {
          if (singleModal.hasOwnProperty('product') && singleModal.product) {
            this.product = singleModal.product;
          }
          $('#referrerCode').modal('show');
        }
        if (singleModal.modalName === 'referrerBy') {
          $('#referrerBy').modal('show');
        }
        if (singleModal.modalName === 'independentPruver') {
          $('#independentPruver').modal('show');
        }
      });
      this.modals = [];
    }
  }

  /* --------- referrer modal section ------------- */
  onSubmit() {
    let redirectRoute: string = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;
    this.isSubmittable = true;
    if (this.selectedCountry !== 'US') {
      redirectRoute = redirectRoute.replace(
        '/' + this.selectedCountry.toLowerCase(),
        ' '
      );
    }
    redirectRoute = redirectRoute.trim();
    
    if (this.refCode !== '') {
      this.subscriptions.push(
        this.apiService.getReferrer(this.refCode).subscribe((referrer: any) => {
          if (referrer.length === 0) {
            this.isReferrerPresent = false;
          } else {
            console.log(this.referrerRedirectModal);
            if (this.referrerRedirectModal === 'checkout') {
              this.isReferrerPresent = true;
              this.dataService.setReferrer(referrer);
              if (referrer?.productId) {
                //if (!this.isStaging)
                  this.appComponent.checkGnGOffer(referrer, true);
              } else {
                $('#referrerCode').modal('hide');
                $('#referrerBy').modal('show');
              }
              this.utilityService.navigateToRoute(redirectRoute);
            }
            if (this.referrerRedirectModal === 'waitList') {
              this.isReferrerPresent = true;
              this.dataService.setReferrer(referrer);
              $('#referrerCode').modal('hide');
              this.utilityService.navigateToRoute(redirectRoute);
              this.dataService.changePostName({
                postName: 'waitlist-modal',
                payload: { key: 'product', value: this.product },
              });
              $('#waitlistModal').modal('show');
              this.isSubmittable = false;
            }
            if (this.referrerRedirectModal === 'shareCart') {
              this.isReferrerPresent = true;
              this.dataService.setReferrer(referrer);
              $('#referrerCode').modal('hide');
              this.utilityService.navigateToRoute(redirectRoute);

              const isLocked = this.utilityService.cartHasLockedProduct();
              if (isLocked) {
                this.dataService.changePostName({
                  postName: 'restrict-share-cart-modal',
                });
                $('#restrictShareCartModal').modal('show');
              } else {
                this.dataService.changePostName({
                  postName: 'pruvit-modal-utilities',
                });
                $('#shareCartModal').modal('show');
              }
              this.isSubmittable = false;
            }
            if (this.referrerRedirectModal === 'freeGuideModal') {
              this.isReferrerPresent = true;
              this.dataService.setReferrer(referrer);
              $('#referrerCode').modal('hide');

              $('#getTheFreeModal').modal('show');

              this.utilityService.navigateToRoute(redirectRoute);
              this.isSubmittable = false;
            }
          }
        })
      );
    }
  }

  onEmailChange() {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.isEmailValid = pattern.test(this.refCode);
  }

  onSubmitForLadyboss() {
    console.log('object');
    this.isSubmittable = true;
    if (this.refCode !== '') {
      const email = this.refCode.replace('+', '%2B');
      const height = 760;
      const width = 500;
      const leftPosition = window.innerWidth / 2 - width / 2;
      const topPosition =
        window.innerHeight / 2 -
        height / 2 +
        (window.outerHeight - window.innerHeight);
      const windowReference = window.open(
        '',
        'checkoutWindowRef',
        'status=no,height=' +
          height +
          ',width=' +
          width +
          ',resizable=yes,left=' +
          leftPosition +
          ',top=' +
          topPosition +
          ',screenX=' +
          leftPosition +
          ',screenY=' +
          topPosition +
          ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no'
      );
      //.pipe(catchError((error) => of(error)));
      this.subscriptions.push(
        this.apiService
        .getSponsorIdByEmail(email)
        .pipe(
          switchMap((sponsorId: any) => {
            const id = sponsorId || 668;
            return this.apiService.getReferrerByUserId(id);
          })
        )
        .subscribe(
          (refCode: any) => {
            this.isSubmittable = false;
            let sponsorId = '';
            if (refCode !== null && refCode !== '') {
              sponsorId = refCode;
            } else {
              sponsorId = this.isStaging ? 'FT34Q7' : '76H3PT';
            }
            const checkoutLink =
              this.checkoutService.setLadyboosSupplementsCheckoutUrl(
                sponsorId,
                'false',
                ''
              );
            if (checkoutLink !== '') windowReference!.location = checkoutLink;
            else windowReference!.close();
          },
          (err) => {
            console.log('err', err);
            this.isSubmittable = false;
            const sponsorId = this.isStaging ? 'FT34Q7' : '76H3PT';
            const checkoutLink =
              this.checkoutService.setLadyboosSupplementsCheckoutUrl(
                sponsorId,
                'false',
                ''
              );
            if (checkoutLink !== '') windowReference!.location = checkoutLink;
            else windowReference!.close();
          }
        )
      );
    }
  }

  onClickReferrer() {
    if (this.isCheckoutFromFood) {
      this.checkoutService.setFoodCheckoutUrl(this.refCode, false, 'false', '');
    } else {
      this.checkoutService.setSupplementsCheckoutUrl(this.refCode, 'false', '');
    }
  }

  onClickNotReferrer() {
    $('#referrerBy').modal('hide');
    $('#referrerCode').modal('show');
  }

  getContactText(text: string) {
    return text.replace('{email}', '');
  }

  hasImageUrl(referrer: any) {
    return referrer.hasOwnProperty('imageUrl');
  }

  getContactFormUrl() {
    let contactFormLink = '';

    if (this.selectedLanguage === 'en') {
      contactFormLink =
        'https://support.justpruvit.com/hc/en-us/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'de') {
      contactFormLink =
        'https://support.justpruvit.com/hc/de/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'es-es') {
      contactFormLink =
        'https://support.justpruvit.com/hc/es-es/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'es') {
      contactFormLink =
        'https://support.justpruvit.com/hc/es-mx/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'it') {
      contactFormLink =
        'https://support.justpruvit.com/hc/it/requests/new?ticket_form_id=360001589991';
    } else if (this.selectedLanguage === 'pt-pt') {
      contactFormLink =
        'https://support.justpruvit.com/hc/pt/requests/new?ticket_form_id=360001589991';
    } else if (
      this.selectedLanguage === 'zh-hans' ||
      this.selectedLanguage === 'zh-hant'
    ) {
      contactFormLink =
        'https://support.justpruvit.com/hc/zh-tw/requests/new?ticket_form_id=360001589991';
    } else {
      contactFormLink =
        'https://support.justpruvit.com/hc/en-us/requests/new?ticket_form_id=360001589991';
    }

    return contactFormLink;
  }

  onCheckoutLogin() {
    localStorage.setItem('isCheckoutLogin', 'true');
    this.userService.login();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
