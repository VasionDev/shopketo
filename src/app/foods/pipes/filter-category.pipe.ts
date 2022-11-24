import { Pipe, PipeTransform } from '@angular/core';
import { Food } from '../models/food.model';

@Pipe({
  name: 'filterCategory',
})
export class FilterCategoryPipe implements PipeTransform {
  transform(foods: Food[], selectedCategory: string): Food[] {
    if (selectedCategory === '' || selectedCategory === 'all') {
      return foods;
    }
    return foods.filter((food) => food.mainCategory === selectedCategory);
  }
}
