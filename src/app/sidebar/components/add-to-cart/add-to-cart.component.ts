import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { Product } from 'src/app/products/models/product.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { Cart } from 'src/app/shared/models/cart.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
declare var $: any;

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.css'],
})
export class AddToCartComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  products: Product[] = [];
  product = {} as Product;
  cartProduct = {} as Cart['cart'];
  productSettings = {} as ProductSettings;
  isFromSmartship = false;
  offers: Offer[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    public utilityService: AppUtilityService,
    private offerService: AppOfferService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCurrentCartData();
    this.getIsFromSmartshipStatus();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  getIsFromSmartshipStatus() {
    this.subscriptions.push(
      this.dataService.currentIsFromSmartship$.subscribe((status: boolean) => {
        this.isFromSmartship = status;
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

        this.productSettings = data.productSettings;
        this.products = data.products;
        this.offers = data.offers;
      })
    );
  }

  getCurrentCartData() {
    this.subscriptions.push(
      this.store.select('cartList').subscribe((res) => {
        if (res.oneTime.length > 0 || res.everyMonth.length > 0) {
          const currentOneTime = res.oneTime.find((item) => item.isCurrent);
          const currentEveryMonth = res.everyMonth.find(
            (item) => item.isCurrent
          );

          this.cartProduct = currentOneTime
            ? currentOneTime.cart
            : currentEveryMonth
            ? currentEveryMonth.cart
            : ({} as Cart['cart']);

          this.product = this.getProductFromCart(this.cartProduct);
        }
      })
    );
  }

  private getProductFromCart(cartData: Cart['cart']) {
    let tempProduct = {} as Product;

    this.products.forEach((product) => {
      if (product.id === cartData.productID) {
        tempProduct = product;
      }
    });

    return tempProduct;
  }

  onClickCloseAddToCart() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }

  onClickGoToCart() {
    if (this.isFromSmartship) {
      const cartOneTime = this.utilityService.getOneTimeStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const cartEveryMonth = this.utilityService.getEveryMonthStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const availableOffers = this.offerService.getAvailableOffers(
        this.offers,
        [],
        cartOneTime,
        cartEveryMonth
      );

      if (availableOffers.length > 0) {
        this.dataService.setOfferArray(availableOffers, 0);

        this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });

        setTimeout(() => {
          $('#special-offer').modal('show');
        }, 0);
      } else {
        this.dataService.changeSidebarName('checkout-cart');
      }
    } else {
      this.dataService.changeSidebarName('checkout-cart');
    }
  }

  onClickBuyNow(postName: string) {
    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: postName },
    });
    $('.drawer').drawer('close');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
