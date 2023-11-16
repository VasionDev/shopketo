import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { Cart } from 'src/app/shared/models/cart.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-champion',
  templateUrl: './champion.component.html',
  styleUrls: ['./champion.component.css']
})
export class ChampionComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  discountHeight = 0;
  offers: Offer[] = [];
  selectedLanguage: string = '';
  selectedCountry: string = '';
  isContactSuccess: boolean = false;
  productSettings = {} as ProductSettings;
  everyMonthCart: Cart[] = [];

  oneTimeProducts = [
    {
      id: 1,
      title: 'Champion Pack',
      servings: '2 Pack',
      orderType: 'ordertype_1',
      thumb: 'assets/ladyboss/images/image-2Pack.png',
      price: { oneTime: 147, everyMonth: 0 },
      quantity: 1,
      sku: { everyMonth: '', oneTime: 'LBH-500-001-CAM2' },
      isForPromoter: true,
      promoterSku: 'CHAMPION-ENROLL-T1'
    },
    {
      id: 2,
      title: 'Champion Pack',
      servings: '4 Pack',
      orderType: 'ordertype_1',
      thumb: 'assets/ladyboss/images/image-4Pack.png',
      price: { oneTime: 277, everyMonth: 0 },
      quantity: 1,
      sku: { everyMonth: '', oneTime: 'LBH-500-001-CAM2-4PACK' },
      isForPromoter: true,
      promoterSku: 'CHAMPION-ENROLL-T1'
    },
    {
      id: 3,
      title: 'Champion Pack',
      servings: '6 Pack',
      orderType: 'ordertype_1',
      thumb: 'assets/ladyboss/images/image-6Pack.png',
      price: { oneTime: 397, everyMonth: 0 },
      quantity: 1,
      sku: { everyMonth: '', oneTime: 'LBH-500-001-CAM2-6PACK' },
      isForPromoter: true,
      promoterSku: 'CHAMPION-ENROLL-T1'
    },
  ];

  constructor(private promoterService: PromoterService,
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private offerService: AppOfferService,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
        this.getProducts();
      });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country: string) => {
        this.selectedCountry = country;
      });
  }

  getProducts() {
    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }
        this.productSettings = data.productSettings;
        this.offers = data.offers;
      });
  }

  onClickAddToCart(ind: number) {
    
    const product = this.oneTimeProducts[ind];

    const cartDataWithLanguages: Cart[] = this.generateCartWithLanguages(product);

    if (
      product?.isForPromoter &&
      this.productSettings.isPromoterEnabled &&
      this.productSettings.promoterSku
    ) {
      cartDataWithLanguages.forEach((cartData) => {
        cartData.isPromoter = true;
      });
      if (product.promoterSku !== '') {
        const promoterFee: Cart =
          this.promoterService.getPromoterFeeCartLadyboss(
            this.selectedCountry,
            this.selectedLanguage,
            this.productSettings,
            product.promoterSku
          );
        cartDataWithLanguages.push(promoterFee);
      }
    }

      this.dataService.setPromoterCartData(cartDataWithLanguages);

      this.utilityService.setCarts(
        cartDataWithLanguages,
        this.selectedCountry,
        this.selectedLanguage
      );

      this.dataService.changeSidebarName('checkout-cart');
      
      const cartOneTime = this.utilityService.getCartIfAdded(
        cartDataWithLanguages
      ).oneTime;
      const cartEveryMonth = this.utilityService.getCartIfAdded(
        cartDataWithLanguages
      ).everyMonth;
      
      const availableOffers = this.offerService.getAvailableOffers(
        this.offers,
        cartDataWithLanguages,
        cartOneTime,
        cartEveryMonth
      );

      if (availableOffers.length > 0) {
        this.dataService.setOfferArray(availableOffers, 0);

        this.dataService.changePostName({
          postName: 'pruvit-modal-utilities',
        });

        setTimeout(() => {
          $('#special-offer').modal('show');
        }, 0);
      } else {
        $('.drawer').drawer('open');
      }
    
  }

  ScrollIntoView() {
    const scrollToElement = document.getElementById('howToBecomechampion');
    const scrollToElementDistance = scrollToElement
      ? scrollToElement.offsetTop + (this.discountHeight) + 25
      : 0;
    window.scroll(0, scrollToElementDistance);
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

  onClickPromoterFee() {
    this.promoterService.onPromoterAddToCart(
      this.selectedCountry,
      this.selectedLanguage,
      null,
      [],
      this.productSettings
    );
    this.dataService.changeSidebarName('checkout-cart');
    $('.drawer').drawer('open');
  }
  
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
