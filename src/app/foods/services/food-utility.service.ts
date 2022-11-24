import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { FoodCart } from '../models/food-cart.model';
import { Food } from '../models/food.model';
import { UpdateFoodAction } from '../store/foods-list.actions';

@Injectable()
export class FoodUtilityService {
  constructor(private store: Store<AppState>) {}

  getShippingDate(
    shippingDate: Date,
    is3Letters?: boolean
  ): {
    dayName: string;
    dayOfTheMonth: string;
    monthName: string;
  } {
    const day = shippingDate.getDay();
    const month = shippingDate.getMonth();
    const date = shippingDate.getDate();

    return {
      dayName: this.getDayOfTheWeekName(day, is3Letters),
      monthName: this.getMonthName(month, is3Letters),
      dayOfTheMonth: this.getDayWithOrdinalSuffix(date),
    };
  }

  getDayOfTheWeekName(dayNumber: number, is3Letters?: boolean) {
    const weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const weekDayIn3Letters = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return is3Letters ? weekDayIn3Letters[dayNumber] : weekday[dayNumber];
  }

  getMonthName(monthNumber: number, is3Letters?: boolean) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthNames3Lettes = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return is3Letters
      ? monthNames3Lettes[monthNumber]
      : monthNames[monthNumber];
  }

  getDayWithOrdinalSuffix(dayNumber: number) {
    const j = dayNumber % 10,
      k = dayNumber % 100;

    if (j == 1 && k != 11) {
      return dayNumber + 'st';
    }
    if (j == 2 && k != 12) {
      return dayNumber + 'nd';
    }
    if (j == 3 && k != 13) {
      return dayNumber + 'rd';
    }

    return dayNumber + 'th';
  }

  removeDayFromFullDate(date: string) {
    const splitedDate = date.split(',');

    return splitedDate.length > 1 ? splitedDate[1] : '';
  }

  removeFromBox(food: Food, country: string, language: string) {
    if (typeof food.quantity !== 'undefined' && food.quantity > 0) {
      const tempFood = Object.assign({}, food);

      if (typeof tempFood.quantity !== 'undefined') {
        tempFood.quantity--;

        food = tempFood;
      }

      this.store.dispatch(new UpdateFoodAction(food));
      this.saveFoodToLocalStorage(food, country, language);
    }
  }

  addToBox(
    food: Food,
    country: string,
    language: string,
    noOfItems: number,
    eligibleNoOfItems: number
  ) {
    if (
      typeof food.quantity !== 'undefined' &&
      food.quantity < food.maxQuantity &&
      noOfItems < eligibleNoOfItems
    ) {
      const tempFood = Object.assign({}, food);

      if (typeof tempFood.quantity !== 'undefined') {
        tempFood.quantity++;

        food = tempFood;
      }

      this.store.dispatch(new UpdateFoodAction(food));
      this.saveFoodToLocalStorage(food, country, language);
    }
  }

  private saveFoodToLocalStorage(
    updatedFood: Food,
    country: string,
    language: string
  ) {
    const localFoods = localStorage.getItem('Foods');
    let Foods: FoodCart[] = localFoods ? JSON.parse(localFoods) : null;

    if (!Foods) {
      Foods = [];
    }

    if (Foods.length !== 0) {
      const foodIndex = Foods.findIndex((food: FoodCart) => {
        return (
          food.country === country &&
          food.language === language &&
          food.food.id === updatedFood.id
        );
      });
      if (foodIndex !== -1) {
        Foods[foodIndex].food = updatedFood;
      } else {
        Foods.push({
          country: country,
          language: language,
          food: updatedFood,
        });
      }
    } else {
      Foods.push({
        country: country,
        language: language,
        food: updatedFood,
      });
    }

    if (updatedFood.quantity === 0) {
      Foods = Foods.filter((food: FoodCart) => food.food.id !== updatedFood.id);
    }

    localStorage.setItem('Foods', JSON.stringify(Foods));
  }

  saveFoodsToLocalStorage(
    updatedFoods: Food[],
    country: string,
    language: string
  ) {
    let Foods: FoodCart[] = [];

    updatedFoods.forEach((food) => {
      if (food.quantity !== 0) {
        Foods.push({
          country: country,
          language: language,
          food: food,
        });
      }
    });

    localStorage.setItem('Foods', JSON.stringify(Foods));
  }
}
