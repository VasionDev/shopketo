import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { Cart } from 'src/app/shared/models/cart.model';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $:any;
@Component({
  selector: 'app-five-servings',
  templateUrl: './five-servings.component.html',
  styleUrls: ['./five-servings.component.css']
})
export class FiveServingsComponent implements OnInit {
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

  offer5DaykitProduct = {
    id: 10,
    title: '5-Day Cake Challenge Kit',
    servings: '5-Day',
    orderType: 'ordertype_1',
    thumb: 'https://statics.myclickfunnels.com/image/564343/file/e2428dfe38508e672e6d3b078496c432.png',
    price: { oneTime: 39, everyMonth: 17 },
    quantity: 1,
    sku: {
      everyMonth: '',
      oneTime: 'LBH-500-015-ONCE',
    },
  };

  offerLeanProduct = {
    id: 11,
    title: 'Vanilla Cake LEAN',
    servings: '1 Box - 20 Servings',
    orderType: 'ordertype_2',
    thumb: 'https://demodashboard.ladyboss.io/wp-content/uploads/2023/01/VCL_Hero.jpg',
    price: { oneTime: 77, everyMonth: 67 },
    quantity: 5,
    sku: {
      everyMonth: 'LBH-5-001-1-20-RENEW',
      oneTime: '',
    },
  };
  
  constructor(
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private translate: TranslateService,
    private appCheckoutService: AppCheckoutService
  ) {
    this.timer = moment(new Date()).add(15, 'minutes').toISOString();
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getUser();
    this.getReferrer();
  }

  getUser() {
    this.dataService.currentUserWithScopes$.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
      this.user = user;
    });
  }

  getReferrer() {
    this.dataService.currentReferrerData$.pipe(takeUntil(this.destroyed$)).subscribe((referrer: any) => {
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

  onClickOfferCheckBox() {
    this.isOfferChecked = !this.isOfferChecked;
  }

  onClickBuyNowOfferProduct() {
    const product = this.offer5DaykitProduct;
    let cartDataWithLanguages: Cart[];

    cartDataWithLanguages = this.generateCartWithLanguages(product);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    cartDataWithLanguages= this.generateCartWithLanguages(this.offerLeanProduct);

    this.utilityService.setCarts(
      cartDataWithLanguages,
      this.selectedCountry,
      this.selectedLanguage
    );

    //this.dataService.changeSidebarName('checkout-cart');
    //$('.drawer').drawer('open');
      
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

      this.appCheckoutService.setSupplementsCheckoutUrl(
        refCode,
        'true',
        ''
      );
    }
    
  }

  /* --------- add to cart section ------------- */
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

  ScrollIntoView() {
    const scrollToElement = document.getElementById('ladyboss5servingsTrial5Pack');
    const scrollToElementDistance = scrollToElement
      ? scrollToElement.offsetTop
      : 0;
    window.scroll(0, scrollToElementDistance);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
