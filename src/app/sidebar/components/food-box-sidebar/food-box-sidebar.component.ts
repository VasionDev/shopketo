import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { FoodCart } from 'src/app/foods/models/food-cart.model';
import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { Food } from 'src/app/foods/models/food.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-food-box-sidebar',
  templateUrl: './food-box-sidebar.component.html',
  styleUrls: ['./food-box-sidebar.component.css'],
})
export class FoodBoxSidebarComponent implements OnInit, OnDestroy {
  country = '';
  language = '';
  foods: Food[] = [];
  box = {
    boxNo: 0,
    boxItems: 0,
    boxLimit: 0,
  };
  boxTotalPrice = 0;
  discount = {} as { numberOfBox?: number; discountPercent?: number };
  discountInfo = {} as FoodDiscount;
  discountedItems = 0;
  isEditSelections = false;

  foodOffers: Offer[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private store: Store<AppState>,
    private utilityService: AppUtilityService,
    private dataService: AppDataService,
    private userService: AppUserService,
    private appCheckoutService: AppCheckoutService
  ) {}

  ngOnInit(): void {
    this.getCountry();
    this.getLanguage();
    this.getFoods();
  }

  getCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe(
        (countryCode: string) => {
          this.country = countryCode;
        }
      )
    );
  }

  getLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.language = language;
        }
      )
    );
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.foods = res.foods;
        this.box.boxItems = res.boxes.noOfItems;
        this.box.boxLimit = res.boxes.currentLimit;
        this.box.boxNo = res.boxes.currentlyFilled + 1;
        this.foodOffers = res.offers;

        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          return (
            sum +
            (food.quantity && food.quantity > 0
              ? food.price * food.quantity
              : 0)
          );
        }, 0);

        this.discountInfo = res.discountsInfo;

        if (this.discountInfo.itemsPerBox) {
          this.discountedItems =
            this.box.boxLimit - this.box.boxItems !== 0
              ? this.box.boxLimit - this.box.boxItems
              : this.discountInfo.itemsPerBox;
        }

        if (this.discountInfo.discounts) {
          this.discount =
            this.box.boxLimit - this.box.boxItems !== 0
              ? this.discountInfo.discounts.find(
                  (discount) => discount.numberOfBox === this.box.boxNo
                ) || {}
              : this.discountInfo.discounts.find(
                  (discount) => discount.numberOfBox === this.box.boxNo + 1
                ) || {};
        }

        this.isEditSelections = this.utilityService.getEditSelectionsStatus();
      })
    );
  }

  onCheckoutSelect() {
    const isInvalidSupplement =
      this.utilityService.isIncompatibleCheckout(true);

    const LocalMVUser = sessionStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const validUserSession = this.userService.checkValidUser();

    const isCheckoutAvailable = MVUser?.checkoutCountries.find(
      (countryObj: any) => countryObj.code === this.country
    );

    if (validUserSession && !isCheckoutAvailable) {
      this.dataService.changePostName({ postName: 'restrict-checkout-modal' });
      $('#RestrictCheckoutModal').modal('show');
    } else {
      if (isInvalidSupplement) {
        this.dataService.changePostName({ postName: 'purchase-modal' });
        $('#PurchaseWarningModal').modal('show');
      } else {
        if (this.isEditSelections) {
          let checkoutFoodCarts: FoodCart[] = [];

          this.foods.forEach((food) => {
            if (food.quantity !== 0) {
              checkoutFoodCarts.push({
                country: this.country,
                language: this.language,
                food: food,
              });
            }
          });

          localStorage.setItem(
            'CheckoutFoods',
            JSON.stringify(checkoutFoodCarts)
          );
        }

        if (this.foodOffers.length > 0) {
          this.dataService.setOfferArray(this.foodOffers, 0);

          this.dataService.changePostName({
            postName: 'pruvit-modal-utilities',
          });

          setTimeout(() => {
            $('#special-offer').modal('show');
          }, 0);
        } else {
          if (this.isEditSelections) {
            this.appCheckoutService.checkoutFood();
            $('.drawer').drawer('close');
          } else {
            this.dataService.changePostName({
              postName: 'shipping-options-modal',
            });
            $('#foodShippingOptionsModal').modal('show');
          }
        }
      }
    }
  }

  onClickClose() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
