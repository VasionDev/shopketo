import { Pipe, PipeTransform } from '@angular/core';
import { Food } from '../models/food.model';

@Pipe({
  name: 'filterDiet',
})
export class FilterDietPipe implements PipeTransform {
  transform(foods: Food[], selectedDiets: string[]): Food[] {
    if (selectedDiets.length === 0) {
      return foods;
    }
    return foods.filter((food) =>
      selectedDiets.every(
        (diet) => food.dietTypes && food.dietTypes.includes(diet)
      )
    );
  }
}
