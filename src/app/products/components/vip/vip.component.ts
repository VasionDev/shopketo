import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;
declare var vipAosJS: any;
declare var viLimitedProdSliderJs: any;

@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  styleUrls: ['./vip.component.css'],
})
export class VipComponent implements OnInit, OnDestroy {
  discountHeight = 0;
  language = '';
  country = '';
  defaultLanguage = '';
  generalSettings: any;
  isLoggedUserExist: boolean = false;
  subscriptions: SubscriptionLike[] = [];
  tenant = '';

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private seoService: AppSeoService,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    //this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.animationLoaded();
    this.setSeo();
  }

  animationLoaded() {
    $(document).ready(() => {
      viLimitedProdSliderJs();
      vipAosJS();
    });
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = height;
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.language = language;

          this.getProducts();
        }
      )
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.country = country;
        this.setRedirectURL();
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

        this.generalSettings = data.productsData.general_settings;
        this.defaultLanguage = data.productsData.default_lang;
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.country);
  }

  onVipLogin() {
    this.utilityService.navigateToRoute('/category/vip');
  }

  onSubscribeSavePage() {
    const routeURL = '/smartship';
    this.utilityService.navigateToRoute(routeURL);
  }

  setSeo() {
    this.seoService.updateTitle('VIP');
    this.meta.updateTag( { property: 'og:title', content: 'VIP' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
