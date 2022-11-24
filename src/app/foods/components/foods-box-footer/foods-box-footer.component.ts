import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { FoodCart } from '../../models/food-cart.model';
import { FoodDiscount } from '../../models/food-discount.model';
import { PreloadedMenus } from '../../models/food-preloaded-menus.model';
import { QuickAddMenus } from '../../models/food-quickadd-menus.model';
import { Food } from '../../models/food.model';
import { FoodUtilityService } from '../../services/food-utility.service';
import {
  SetFoodsAction,
  SetQuickAddMenusActon,
} from '../../store/foods-list.actions';
declare var $: any;

@Component({
  selector: 'app-foods-box',
  templateUrl: './foods-box-footer.component.html',
  styleUrls: ['./foods-box-footer.component.css'],
})
export class FoodsBoxFooterComponent implements OnInit, OnDestroy {
  country = '';
  language = '';
  foods: Food[] = [];
  box = {
    boxNo: 0,
    boxItems: 0,
    boxLimit: 0,
  };
  boxTotalPrice = 0;
  preloadedMenus = {} as PreloadedMenus;
  discount = {} as { numberOfBox?: number; discountPercent?: number };
  discountInfo = {} as FoodDiscount;
  discountedItems = 0;
  quickAddMenus = {} as QuickAddMenus;
  isEditSelections = false;
  foodOffers: Offer[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private foodUtilityService: FoodUtilityService,
    private dataService: AppDataService,
    private appUtilityService: AppUtilityService,
    private appCheckoutService: AppCheckoutService,
    private userService: AppUserService,
    private store: Store<AppState>
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
        this.preloadedMenus = res.preloadedMenus;
        this.box.boxItems = res.boxes.noOfItems;
        this.box.boxLimit = res.boxes.currentLimit;
        this.box.boxNo = res.boxes.currentlyFilled + 1;
        this.discountInfo = res.discountsInfo;
        this.foodOffers = res.offers;

        this.quickAddMenus = res.quickAddMenus;

        if (this.discountInfo.itemsPerBox) {
          this.discountedItems =
            this.box.boxLimit - this.box.boxItems !== 0
              ? this.box.boxLimit - this.box.boxItems
              : this.discountInfo.itemsPerBox;
        }

        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          return (
            sum +
            (food.quantity && food.quantity > 0
              ? food.price * food.quantity
              : 0)
          );
        }, 0);

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

        this.isEditSelections =
          this.appUtilityService.getEditSelectionsStatus();
      })
    );
  }

  onCheckoutSelect() {
    const isInvalidSupplement =
      this.appUtilityService.isIncompatibleCheckout(true);

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
        const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);
        tempQuickAddMenus.quantity = 0;

        this.store.dispatch(new SetQuickAddMenusActon(tempQuickAddMenus));

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

  preloadRyansMenu() {
    const updatedFoods = this.foods.map((food) => {
      const tempFood = Object.assign({}, food);
      this.preloadedMenus.menus.forEach((item) => {
        if (item.id === food.id && !food.isOutOfStock) {
          tempFood.quantity = item.quantity;
        }
      });
      return tempFood;
    });

    this.store.dispatch(new SetFoodsAction(updatedFoods));
    this.foodUtilityService.saveFoodsToLocalStorage(
      updatedFoods,
      this.country,
      this.language
    );

    this.dataService.changeSidebarName('food-summary');
    $('.drawer').drawer('open');
  }

  onClickBox() {
    const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);
    tempQuickAddMenus.quantity = 0;

    this.store.dispatch(new SetQuickAddMenusActon(tempQuickAddMenus));

    this.dataService.changeSidebarName('food-summary');

    setTimeout(() => {
      $('.drawer').drawer('open');
    }, 0);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
