import { Injectable } from '@angular/core';
import { ProductVariation } from '../models/product-variation.model';

@Injectable()
export class ProductCardService {
  getSmartshipDiscountPrice(variations: ProductVariation[]) {
    let minPrice = Number.MAX_SAFE_INTEGER;

    variations.forEach((variation) => {
      if (variation.orderType === 'ordertype_2') {
        if (variation.price < minPrice) {
          minPrice = variation.price;
        }
      }
    });

    if (minPrice === Number.MAX_SAFE_INTEGER) {
      minPrice = 0;
    }

    return minPrice;
  }
}
