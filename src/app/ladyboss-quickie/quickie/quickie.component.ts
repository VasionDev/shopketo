import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { Cart } from 'src/app/shared/models/cart.model';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { isEuropeanCountry } from 'src/app/shared/utils/country-list';
import { environment } from '../../../environments/environment';
declare var $: any;

@Component({
  selector: 'app-quickie',
  templateUrl: './quickie.component.html',
  styleUrls: ['./quickie.component.css'],
})
export class QuickieComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  discountHeight = 0;
  selectedLanguage: string = '';
  selectedCountry: string = '';
  isOfferChecked: boolean = false;
  productSettings = {} as ProductSettings;
  everyMonthCart: Cart[] = [];
  timer!: string;
  referrer: any = {};
  user: any;

  isUserLoggedIn = false;
  userAvatar = '';
  impersonationPresent: boolean = false;
  tenant = '';
  isStaging!: boolean;
  userRedirectURL = '';

  offerProduct = {
    id: 1,
    title: 'LEAN Brownie Batter',
    servings: '1 Box',
    orderType: 'ordertype_1',
    thumb: '/assets/ladyboss/images/side_2.png',
    price: { oneTime: 77, everyMonth: 0 },
    quantity: 1,
    sku: {
      everyMonth: '',
      oneTime: 'LBH-500-017',
    },
  };

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private userService: AppUserService,
    private router: Router,
    private appCheckoutService: AppCheckoutService,
    private utilityService: AppUtilityService
  ) {
    this.timer = moment(new Date()).add(15, 'minutes').toISOString();
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    this.userRedirectURL = environment.userURL;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getUser();
    this.getReferrer();
  }

  onClickAvatar() {
    this.dataService.changeSidebarName('account');
    $('.drawer').drawer('open');
  }

  onlogin() {
    this.router.navigateByUrl('/dashboard');
  }

  getUser() {
    this.dataService.currentUserWithScopes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        this.user = user;
      });
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
      });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country: string) => {
        this.selectedCountry = country;
      });
  }

  onClickBuyNowOfferProduct() {
    const product = this.offerProduct;
    let cartDataWithLanguages: Cart[];

    cartDataWithLanguages = this.generateCartWithLanguages(product);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    const localContact = sessionStorage.getItem('Contact');
    const contact = localContact ? JSON.parse(localContact) : null;

    if (contact !== null) {
      let refCode = this.user
        ? this.user.mvuser_refCode
        : this.referrer.hasOwnProperty('code')
        ? this.referrer.code
        : contact.referrer;
      this.appCheckoutService.setSupplementsCheckoutUrl(
        refCode,
        'false',
        '',
        '',
        contact.firstName,
        contact.lastName,
        contact.email,
        '',
        '',
        contact.phone
      );
    } else if (!this.user) {
      this.appCheckoutService.setModals();
    } else {
      let refCode = this.user
        ? this.user.mvuser_refCode
        : this.referrer.hasOwnProperty('code')
        ? this.referrer.code
        : '';

      this.appCheckoutService.setSupplementsCheckoutUrl(refCode, 'true', '');
    }
  }

  private generateCartWithLanguages(product: any) {
    const cartDataWithLanguages: Cart[] = [];
    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: product.orderType,
      isCurrent: true,
      isPromoter: false,
      hasUserRestriction: false,
      cart: {
        productID: product?.id,
        productName: product?.title,
        productImageUrl: product?.thumb,
        servingsName: product.servings,
        caffeineState: '',
        totalQuantity: product.quantity,
        quantity: 1,
        price: product.price,
        discountPrice: product.price.everyMonth,
        productSku: product.sku,
        discountPercent: 0,
        smartshipDiscountPrice: 0,
        smartshipDiscountPercent: 0,
        isUserCanAccess: true,
        discountType: 'SKU_PURCHASE',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: false,
      },
      finalPrice: 0,
    });

    return cartDataWithLanguages;
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
