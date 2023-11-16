import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { AppDataService } from '../../../shared/services/app-data.service';
import { Product } from '../../models/product.model';
declare var $: any;

@Component({
  selector: 'app-referrer-home',
  templateUrl: './referrer-home.component.html',
  styleUrls: ['./referrer-home.component.css'],
})
export class ReferrerHomeComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  discountHeight = 0;
  referrer: any = {};
  referrerVideoId: string = '';
  customizeData: any = null;
  countries: any = [];
  products: any = [];
  favProducts: any = [];
  isLoaded: boolean = false;
  previewData: any = {};
  productCountryCode: string = 'US';
  isReadMore: boolean = true;
  shortBio: string = '';

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private websiteService: WebsiteService,
    private renderer: Renderer2
  ) {
    const data = localStorage.getItem('customizePreviewData');
    if (data) {
      this.customizeData = JSON.parse(data);
      this.setCustomizePreviewData();
    }
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedCountry();
    this.getSelectedLanguage();
    this.getReferrer();
    // if (this.customizeData === null) {
    //   this.getUserCustomizeData();
    // } else this.setCustomizePreviewData();
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country: string) => {
        this.productCountryCode = country;
      });
  }

  setCustomizePreviewData() {
    this.isLoaded = true;
    if(this.customizeData?.introVideo && 
      this.customizeData.introVideo?.videoId && 
      this.customizeData.introVideo?.status === 'approved'
    ) {
      this.referrerVideoId = this.customizeData.introVideo?.videoId
    }

    if(this.customizeData?.shortBio && 
      this.customizeData.shortBio?.bioData && 
      this.customizeData.shortBio?.status === 'approved'
    ) {
      this.shortBio = this.customizeData.shortBio?.bioData;
    } else if(this.customizeData?.oldShortBio && 
      this.customizeData.oldShortBio?.bioData && 
      this.customizeData.oldShortBio?.status === 'approved'
    ) {
      this.shortBio = this.customizeData.oldShortBio?.bioData;
    }
    
    if (Object.entries(this.customizeData.favoriteProducts).length) {
      this.favProducts = this.products.filter((product: any) => {
        return this.customizeData.favoriteProducts[this.productCountryCode].includes(product.uniqueId);
      });
    }
  
    if(this.customizeData?.introVideo && 
      this.customizeData.introVideo?.videoId && 
      this.customizeData.introVideo?.status === 'approved'
    ) {
      this.referrerVideoId = this.customizeData.introVideo?.videoId
    }

    $(document).ready(() => {
      var styleSheet = document.styleSheets[0];
      if (this.customizeData.theme.color !== '') {
        styleSheet.insertRule(
          `.referrer-profile .watch-now, .referrer-profile .buy-now { background-color: ${this.customizeData.theme.color} !important; }`,
          styleSheet.cssRules.length
        );
        styleSheet.insertRule(
          `.referrer-profile .my-link-list li a { color: ${this.customizeData.theme.color} !important; }`,
          styleSheet.cssRules.length
        );
      }
    });
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
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

        const soldOutItems: Product[] = [];
        const inSaleItems: Product[] = [];
        data.products.forEach((product, ind) => {
          if (product.isSoldOut || product.isAllVariationOutOfStock) {
            soldOutItems.push(product);
          } else {
            inSaleItems.push(product);
          }
        });

        this.products = [...inSaleItems, ...soldOutItems].sort(
          (a, b) => b.productOrder - a.productOrder
        );
      });
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
          if (this.customizeData === null) this.getUserCustomizeData();
        }
      });
  }

  getUserCustomizeData() {
    this.websiteService
      .getCustomizeData(this.referrer?.userId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isLoaded = true;
          this.websiteService.setUserCustomizeData(res);
          if (typeof res.success && res.success === true) {
            this.customizeData = res.data; 
          } 

          if (this.customizeData !== null) {
            
            if(this.customizeData?.introVideo && 
              this.customizeData.introVideo?.videoId && 
              this.customizeData.introVideo?.status === 'approved'
            ) {
              this.referrerVideoId = this.customizeData.introVideo?.videoId
            }

            if(this.customizeData?.shortBio && 
              this.customizeData.shortBio?.bioData && 
              this.customizeData.shortBio?.status === 'approved'
            ) {
              this.shortBio = this.customizeData.shortBio?.bioData;
            } else if(this.customizeData?.oldShortBio && 
              this.customizeData.oldShortBio?.bioData && 
              this.customizeData.oldShortBio?.status === 'approved'
            ) {
              this.shortBio = this.customizeData.oldShortBio?.bioData;
            }

            if (
              Object.entries(this.customizeData.favoriteProducts).length &&
              this.customizeData.favoriteProducts[this.productCountryCode]
            ) {
              this.favProducts = this.products.filter((product: any) => {
                return this.customizeData.favoriteProducts[
                  this.productCountryCode
                ].includes(product.uniqueId);
              });
            }

            $(document).ready(() => {
              var styleSheet = document.styleSheets[0];
              if (this.customizeData.theme.color !== '') {
                styleSheet.insertRule(
                  `.referrer-profile .watch-now, .referrer-profile .buy-now { background-color: ${this.customizeData.theme.color} !important; }`,
                  styleSheet.cssRules.length
                );
                styleSheet.insertRule(
                  `.referrer-profile .my-link-list li a { color: ${this.customizeData.theme.color} !important; }`,
                  styleSheet.cssRules.length
                );
              }
            });
          }
         
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onClickMyLink(link: string) {
    if (!link.match(/^https?:\/\//i)) {
      link = 'https://' + link;
    }
    window.open(link);
  }

  sendSMS(number: string) {
    window.open('sms:' + number);
  }

  sendEmail(email: string) {
    window.open('mailTo:' + email);
  }

  sendCall(number: string) {
    window.open('tel:' + number);
  }

  onClickReferrerImage() {
    if (this.referrerVideoId && $('.watch-now').length) {
      $('button.watch-now span').trigger('click');
    }
  }

  ScrollIntoView() {
    const getInTouchElement = document.getElementById('getInTouch');
    const getInTouchElementDistance = getInTouchElement
      ? getInTouchElement?.getBoundingClientRect().top -
        this.discountHeight -
        20
      : 0;
    window.scroll(0, getInTouchElementDistance);
    return false;
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange($event: Event) {
    if (document.visibilityState === 'hidden') {
      localStorage.removeItem('customizePreviewData');
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.renderer.removeAttribute(document.body, 'style');
    localStorage.removeItem('customizePreviewData');
  }
}
