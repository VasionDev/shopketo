import { Pipe, PipeTransform } from '@angular/core';
import { Food } from '../models/food.model';

@Pipe({
  name: 'filterType',
})
export class FilterTypePipe implements PipeTransform {
  transform(foods: Food[], selectedType: string): Food[] {
    if (selectedType === '' || selectedType === 'all') {
      return foods;
    }
    return foods.filter((food) => food.subType === selectedType);
  }
}
