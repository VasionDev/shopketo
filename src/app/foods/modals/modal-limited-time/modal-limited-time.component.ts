import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { Food } from '../../models/food.model';
import { FoodUtilityService } from '../../services/food-utility.service';
import { UpdateFoodAction } from '../../store/foods-list.actions';

@Component({
  selector: 'app-modal-limited-time',
  templateUrl: './modal-limited-time.component.html',
  styleUrls: ['./modal-limited-time.component.css'],
})
export class ModalLimitedTimeComponent implements OnInit, OnDestroy {
  food = {} as Food;
  country = '';
  language = '';
  eligibleNoOfItems = 0;
  noOfItems = 0;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private foodUtilityService: FoodUtilityService,
    private dataService: AppDataService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getCountry();
    this.getLanguage();
    this.getFood();
  }

  getFood() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.food =
          res.foods.find((food: Food) => food.id === res.modalId) ||
          ({} as Food);

        this.noOfItems = res.boxes.noOfItems;

        const discountInfo = res.discountsInfo;

        this.eligibleNoOfItems =
          discountInfo.itemsPerBox && discountInfo.maxBoxes
            ? discountInfo.itemsPerBox * discountInfo.maxBoxes
            : 0;
      })
    );
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

  onClickGotIt() {
    const tempLimitedTime = Object.assign(
      {},
      this.food.limitedTimeAvailability
    );
    const tempFood = Object.assign({}, this.food);

    tempLimitedTime.isModalShown = true;
    tempFood.limitedTimeAvailability = tempLimitedTime;

    this.store.dispatch(new UpdateFoodAction(tempFood));

    this.foodUtilityService.addToBox(
      tempFood,
      this.country,
      this.language,
      this.noOfItems,
      this.eligibleNoOfItems
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
