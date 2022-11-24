import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;
declare var smartshipFlipCardJS: any;

@Component({
  selector: 'app-smartship-about',
  templateUrl: './smartship-about.component.html',
  styleUrls: ['./smartship-about.component.css'],
})
export class SmartshipAboutComponent implements OnInit, OnDestroy {
  discountHeight = 0;
  selectedCountry = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    smartshipFlipCardJS();

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

  ScrollIntoView() {
    const smartshipElement = document.getElementById('smartship-products');

    const smartshipProductsElementDistance = smartshipElement
      ? smartshipElement.offsetTop - this.discountHeight - 20
      : 0;

    window.scroll(0, smartshipProductsElementDistance);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
