import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { FormatPipe } from 'src/app/shared/pipes/format-string.pipe';
import { AppState } from 'src/app/store/app.reducer';
import { Food } from '../../models/food.model';
import { FoodUtilityService } from '../../services/food-utility.service';
import { FoodNutrition } from '../../models/food-nutrition.model';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-modal-foods',
  templateUrl: './modal-foods.component.html',
  styleUrls: ['./modal-foods.component.css'],
  providers: [FormatPipe],
})
export class ModalFoodsComponent implements OnInit, OnDestroy {
  @Input() foodId!: string;
  food = {} as Food;
  country = '';
  language = '';
  eligibleNoOfItems = 0;
  noOfItems = 0;
  isTooltipShown = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private foodUtilityService: FoodUtilityService,
    private dataService: AppDataService,
    private format: FormatPipe,
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
        this.noOfItems = res.boxes.noOfItems;

        const discountInfo = res.discountsInfo;

        this.eligibleNoOfItems =
          discountInfo.itemsPerBox && discountInfo.maxBoxes
            ? discountInfo.itemsPerBox * discountInfo.maxBoxes
            : 0;

        this.food =
          res.foods.find((food: Food) => food.id === this.foodId) ||
          ({} as Food);

        $(document).ready(() => {
          tooltipJS();
        });
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

  onClickMinus() {
    this.foodUtilityService.removeFromBox(
      this.food,
      this.country,
      this.language
    );
  }

  onClickPlus() {
    if (
      this.food.limitedTimeAvailability.isSet &&
      !this.food.limitedTimeAvailability.isModalShown
    ) {
      $('#foodDetailsModal').modal('hide');

      this.dataService.changePostName({ postName: 'limited-time-modal' });
      $('#limitedTimeModal').modal('show');
    } else {
      this.foodUtilityService.addToBox(
        this.food,
        this.country,
        this.language,
        this.noOfItems,
        this.eligibleNoOfItems
      );
    }
  }

  concateNutritions(
    nutritions: {
      name: string;
      unitSize: number;
      quantity: string;
    }[]
  ): string {
    return nutritions
      .map((nutrition) => {
        return (
          this.format.transform(nutrition.name, false) +
          ' ' +
          nutrition.quantity
        );
      })
      .join(', ');
  }

  concateAllergens(allergens: string[]) {
    return allergens
      .map((allergen) => this.format.transform(allergen, false))
      .join(', ');
  }

  removeSBText(text: string) {
    return text.replace(/Sunbasket/g, 'Prüvit');
  }

  netCarbs(food: Food) {
    return food.nutritions
      ? food.nutritions.find((item) => item.name === 'NET_CARBOHYDRATES')
      : ({} as FoodNutrition);
  }

  protein(food: Food) {
    return food.nutritions
      ? food.nutritions.find((item) => item.name === 'PROTEIN')
      : ({} as FoodNutrition);
  }

  fat(food: Food) {
    return food.nutritions
      ? food.nutritions.find((item) => item.name === 'TOTAL_FAT')
      : ({} as FoodNutrition);
  }

  calories(food: Food) {
    return food.nutritions
      ? food.nutritions.find((item) => item.name === 'CALORIES')
      : ({} as FoodNutrition);
  }

  toggleTooltip(foodId: string, i: number) {
    this.isTooltipShown = !this.isTooltipShown;

    if (this.isTooltipShown) {
      $('[data-toggle="tooltip"]#modal' + foodId + i).tooltip('show');
    } else {
      $('[data-toggle="tooltip"]#modal' + foodId + i).tooltip('hide');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
