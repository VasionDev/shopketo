import { Pipe, PipeTransform } from '@angular/core';
import { FoodNutrition } from '../models/food-nutrition.model';
import { Food } from '../models/food.model';

@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform(foods: Food[], selectedSort: string): Food[] {
    if (selectedSort === '' || selectedSort === 'default') {
      return foods;
    }
    const tempFoods = Object.assign([], [...foods]);

    return tempFoods.sort((a: Food, b: Food) => {
      const calA =
        (a.nutritions &&
          a.nutritions.find((item) => item.name === selectedSort)) ||
        ({} as FoodNutrition);
      const calB =
        (b.nutritions &&
          b.nutritions.find((item) => item.name === selectedSort)) ||
        ({} as FoodNutrition);

      if (calA.unitSize > calB.unitSize) {
        return 1;
      } else if (calA.unitSize < calB.unitSize) {
        return -1;
      } else {
        return 0;
      }
    });
  }
}
