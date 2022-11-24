import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { Food } from 'src/app/foods/models/food.model';
import { FoodUtilityService } from 'src/app/foods/services/food-utility.service';
import { SetFoodsAction } from 'src/app/foods/store/foods-list.actions';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-food-summary',
  templateUrl: './food-summary.component.html',
  styleUrls: ['./food-summary.component.css'],
})
export class FoodSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  country = '';
  language = '';
  box = {
    boxNo: 0,
    boxItems: 0,
    boxLimit: 0,
  };
  shippingDate = '';
  foods: Food[] = [];
  foodsInBoxes: Food[] = [];
  emptyFoods: number[] = [];
  boxTotalPrice = 0;
  eligibleNoOfItems = 0;
  noOfItems = 0;
  discount = {} as { numberOfBox?: number; discountPercent?: number };
  discountInfo = {} as FoodDiscount;
  discountedItems = 0;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private foodUtilityService: FoodUtilityService,
    private dataService: AppDataService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getCountry();
    this.getLanguage();
    this.getFoods();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
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

        const tempFoods: Food[] = [];
        res.foods.forEach((food) => {
          if (typeof food.quantity !== 'undefined') {
            for (let i = 0; i < food.quantity; i++) {
              tempFoods.push(food);
            }
          }
        });
        this.foodsInBoxes = tempFoods;

        this.box.boxItems = res.boxes.noOfItems;
        this.box.boxLimit = res.boxes.currentLimit;
        this.box.boxNo = res.boxes.currentlyFilled + 1;
        this.emptyFoods = new Array(this.box.boxLimit - this.box.boxItems);
        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          return (
            sum +
            (food.quantity && food.quantity > 0
              ? food.price * food.quantity
              : 0)
          );
        }, 0);
        this.noOfItems = res.boxes.noOfItems;
        this.eligibleNoOfItems =
          res.discountsInfo.itemsPerBox && res.discountsInfo.maxBoxes
            ? res.discountsInfo.itemsPerBox * res.discountsInfo.maxBoxes
            : 0;

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

        const LocalMVUser = sessionStorage.getItem('MVUser');
        const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

        const autoshipFoods: { sku: string; quantity: number }[] =
          FoodUser === null ||
          (Object.keys(FoodUser).length === 0 &&
            FoodUser.constructor === Object)
            ? []
            : FoodUser.food_autoship_data;

        this.shippingDate =
          FoodUser !== null && autoshipFoods.length > 0
            ? this.discountInfo.autoshipShippingDateShort
            : this.discountInfo.shippingDateShort;
      })
    );
  }

  onClickPlus(food: Food) {
    this.foodUtilityService.addToBox(
      food,
      this.country,
      this.language,
      this.noOfItems,
      this.eligibleNoOfItems
    );

    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  onClickMinus(food: Food) {
    this.foodUtilityService.removeFromBox(food, this.country, this.language);

    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  onClickClearAll() {
    const updatedFoods = this.foods.map((food) => {
      const tempFood = Object.assign({}, food);
      tempFood.quantity = 0;
      return tempFood;
    });

    this.store.dispatch(new SetFoodsAction(updatedFoods));
    localStorage.setItem('Foods', JSON.stringify([]));

    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  onClickClose() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }

  shareSelections() {
    // do something
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
