import { Pipe, PipeTransform } from '@angular/core';
import { Product } from 'src/app/products/models/product.model';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  transform(products: Product[], term: string, pageType: string) {
    if (pageType === 'search-modal') {
      if (term === '') {
        return [];
      }
    }
    if (pageType === 'search-page') {
      if (term === '') {
        return products;
      }
    }
    return products.filter((x) =>
      x.title.toLowerCase().includes(term.toLowerCase())
    );
  }
}
