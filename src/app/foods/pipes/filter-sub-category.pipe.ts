import { Pipe, PipeTransform } from '@angular/core';
import { Food } from '../models/food.model';

@Pipe({
  name: 'filterSubCategory',
})
export class FilterSubCategoryPipe implements PipeTransform {
  transform(foods: Food[], selectedSubCategory: string): Food[] {
    if (selectedSubCategory === '' || selectedSubCategory === 'all') {
      return foods;
    }
    return foods.filter((food) => food.subCategory === selectedSubCategory);
  }
}
