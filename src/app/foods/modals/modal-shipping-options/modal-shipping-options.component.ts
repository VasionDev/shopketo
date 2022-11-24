import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { FoodCart } from '../../models/food-cart.model';
import { FoodDelivery } from '../../models/food-delivery.model';
import { FoodDiscount } from '../../models/food-discount.model';
import { QuickAddMenus } from '../../models/food-quickadd-menus.model';
import { Food } from '../../models/food.model';
import {
  SetCheckoutFoodsAction,
  SetCheckoutOrderActon,
  SetFoodDeliveryActon,
} from '../../store/foods-list.actions';
declare var $: any;

@Component({
  selector: 'app-modal-shipping-options',
  templateUrl: './modal-shipping-options.component.html',
  styleUrls: ['./modal-shipping-options.component.css'],
})
export class ModalShippingOptionsComponent implements OnInit, OnDestroy {
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
  quickAddMenus = {} as QuickAddMenus;
  selectedOrder = 'weekly';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
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
        this.box.boxItems = res.boxes.noOfItems;
        this.box.boxLimit = res.boxes.currentLimit;
        this.box.boxNo = res.boxes.currentlyFilled + 1;
        this.discountInfo = res.discountsInfo;

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
      })
    );
  }

  onOrderSelect(event: any) {
    this.selectedOrder = event.target.value;
  }

  onClickAddToCart() {
    let appliedDiscount = 0;

    const noOfBoxes = this.discountInfo.itemsPerBox
      ? this.box.boxItems / this.discountInfo.itemsPerBox
      : 0;

    if (this.discountInfo.discounts) {
      this.discountInfo.discounts.forEach((discount) => {
        for (let i = 1; i <= noOfBoxes; i++) {
          if (discount.numberOfBox === i) {
            appliedDiscount = discount.discountPercent
              ? discount.discountPercent
              : 0;
          }
        }
      });
    }

    const deliveryInfo: FoodDelivery = {
      totalItems: this.box.boxItems,
      totalPrice: this.boxTotalPrice,
      appliedDiscount: appliedDiscount,
      shippingDateShort: this.discountInfo.shippingDateShort
        ? this.discountInfo.shippingDateShort
        : '',
      autoshipShippingDateShort: this.discountInfo.autoshipShippingDateShort
        ? this.discountInfo.autoshipShippingDateShort
        : '',
      editDate: this.discountInfo.editDate ? this.discountInfo.editDate : '',
      itemsPerBox: this.discountInfo.itemsPerBox,
      maxBoxes: this.discountInfo.maxBoxes,
    };

    let checkoutFoodCarts: FoodCart[] = [];
    let checkoutFoods: Food[] = [];

    this.foods.forEach((food) => {
      if (food.quantity !== 0) {
        checkoutFoodCarts.push({
          country: this.country,
          language: this.language,
          food: food,
        });
        checkoutFoods.push(food);
      }
    });

    localStorage.setItem(
      'FoodDeliveryType',
      JSON.stringify(this.selectedOrder)
    );
    this.store.dispatch(new SetCheckoutOrderActon(this.selectedOrder));

    localStorage.setItem('CheckoutFoods', JSON.stringify(checkoutFoodCarts));
    this.store.dispatch(new SetCheckoutFoodsAction(checkoutFoods));

    localStorage.setItem('FoodDelivery', JSON.stringify(deliveryInfo));
    this.store.dispatch(new SetFoodDeliveryActon(deliveryInfo));

    this.dataService.changeCartStatus(true);

    const currentTime = new Date().getTime();
    localStorage.setItem('CartTime', JSON.stringify(currentTime));

    this.dataService.changeSidebarName('checkout-cart');
    $('.drawer').drawer('open');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
