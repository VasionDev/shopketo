import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { Product } from 'src/app/products/models/product.model';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-product-buy',
  templateUrl: './product-buy.component.html',
  styleUrls: ['./product-buy.component.css'],
})
export class ProductBuyComponent implements OnInit, OnDestroy {
  @Input() product = {} as Product;
  @Input() isPromoter = false;
  selectedLanguage = '';
  selectedCountry = '';
  productSettings = {} as ProductSettings;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private promoterService: PromoterService,
    private utilityService: AppUtilityService,
    private dataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getSelectedLanguage();
    this.getSelectedCountry();
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
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

        this.productSettings = data.productSettings;
      })
    );
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);
    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: postName },
    });
  }

  onClickPromoter(product: Product) {
    const oneTimeVariations = this.promoterService.getVariations(
      product.variations
    );

    if (oneTimeVariations.length === 1) {
      const isInvalidSupplement =
        this.utilityService.isIncompatibleCheckout(false);

      if (isInvalidSupplement) {
        this.dataService.changePostName({
          postName: 'purchase-modal',
        });

        $('#PurchaseWarningModal').modal('show');
      } else {
        this.promoterService.onPromoterAddToCart(
          this.selectedCountry,
          this.selectedLanguage,
          product,
          oneTimeVariations[0],
          this.productSettings
        );

        this.dataService.setOfferFlowStatus(true);

        const routeURL = '/smartship';

        this.utilityService.navigateToRoute(routeURL);
      }
    } else {
      const routeURL = '/promoter/' + product.name;

      this.utilityService.navigateToRoute(routeURL);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
