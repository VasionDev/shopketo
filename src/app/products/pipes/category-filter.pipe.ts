import { Pipe, PipeTransform } from '@angular/core';
import { ProductTagOrCategory } from '../models/product-tag-or-category.model';

@Pipe({
  name: 'categoryFilter',
})
export class CategoryFilterPipe implements PipeTransform {
  transform(
    categories: ProductTagOrCategory[],
    searchFilter: string
  ): ProductTagOrCategory[] {
    return categories
      .map((c) => ({
        ...c,
        products: c.products.filter((x) =>
          x.title.toLowerCase().includes(searchFilter.toLowerCase())
        ),
      }))
      .filter((c) => c.products.length !== 0);
  }
}
