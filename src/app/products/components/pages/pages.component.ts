import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var leaderBoardJS: any;
declare var $: any;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  pages = [];
  page = '';
  currentUrl: any;
  discountHeight = 0;
  isStaging: boolean;
  defaultLanguage = '';
  isRedirectionStarted = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilityService: AppUtilityService
  ) {
    this.isStaging = environment.isStaging;

    if (this.router.url === '/de/page/policies-and-procedures') {
      this.isRedirectionStarted = true;

      window.location.href =
        'https://support.justpruvit.com/hc/de/articles/360052783292';
    }

    if (this.router.url === '/it/page/policies-and-procedures') {
      this.isRedirectionStarted = true;

      window.location.href =
        'https://support.justpruvit.com/hc/it/articles/360052783292';
    }
  }

  ngOnInit(): void {
    this.getCurrentRoute();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getDiscountHeight();
  }

  getDiscountHeight() {
    this.subscriptions.push(
      this.dataService.currentDiscountHeight$.subscribe((height: number) => {
        this.discountHeight = height;
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getCurrentRoute() {
    this.currentUrl = this.activatedRoute.snapshot.paramMap.get('id');
    this.getPages();
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.getPages();
        }
      )
    );
  }

  getPages() {
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

        if (data.productsData) {
          this.pages = data.productsData.page;
          if (this.pages) {
            this.getPage(this.pages);
          }
        }
      })
    );
  }

  getPage(pages: any[]) {
    this.page = '';
    this.setRedirectURL();

    pages.forEach((page: any) => {
      if (page.slug === this.currentUrl) {
        let str = page.content.replace(/#/gi, this.router.url + '#');
        if (this.currentUrl === 'shipping-policy') {
          str = str.replace('href="/refunds/"', 'id="refunds-page-id"');
        }
        this.page = str;
        window.scroll(0, 0);

        $(document).ready(() => {
          leaderBoardJS();
        });
      }
    });
  }

  @HostListener('click', ['$event'])
  onClickRefundsPage(event: any): void {
    if (event.target.id === 'refunds-page-id') {
      const routeURL = '/page/refunds';
      this.utilityService.navigateToRoute(routeURL);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
