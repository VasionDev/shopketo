import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductsUtilityService } from '../services/products-utility.service';

@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  constructor(private productsUtilityService: ProductsUtilityService) {}

  transform(
    products: Product[],
    sortOrder: string,
    sortPage?: string
  ): Product[] {
    if (sortOrder === '') {
      return this.productsUtilityService.sortByAlphabet(products);
    } else if (sortOrder === 'price') {
      if (sortPage === 'smartship') {
        return this.productsUtilityService.sortBySmartshipDiscount(products);
      } else {
        return this.productsUtilityService.sortByPrice(products);
      }
    } else if (sortOrder === 'alphabetic') {
      return this.productsUtilityService.sortByAlphabet(products);
    } else {
      return [];
    }
  }
}
