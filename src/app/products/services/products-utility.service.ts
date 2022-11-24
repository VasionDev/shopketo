import { Injectable } from '@angular/core';
import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { Product } from '../models/product.model';
import { ProductCardService } from './product-card.service';

@Injectable()
export class ProductsUtilityService {
  constructor(private productCardService: ProductCardService) {}

  sortByAlphabet(products: Product[]) {
    return products.sort((a, b) => (a.title > b.title ? 1 : -1));
  }

  sortByPrice(products: Product[]) {
    return products.sort((a, b) => {
      const priceA = a.finalPrice !== 0 ? a.finalPrice : a.originalPrice;

      const priceB = b.finalPrice !== 0 ? b.finalPrice : b.originalPrice;

      if (priceA < priceB) {
        return -1;
      }
      if (priceA > priceB) {
        return 1;
      }
      return 0;
    });
  }

  sortBySmartshipDiscount(products: Product[]) {
    return products.sort((a, b) => {
      const priceA = this.productCardService.getSmartshipDiscountPrice(
        a.variations
      );

      const priceB = this.productCardService.getSmartshipDiscountPrice(
        b.variations
      );

      if (priceA < priceB) {
        return -1;
      }
      if (priceA > priceB) {
        return 1;
      }
      return 0;
    });
  }

  getAccessLevels(availability: string): ProductAccess {
    const accessLevels: ProductAccess = {
      isHidden: {
        on: availability === 'hidden',
        title: 'Hidden',
      },
      isEveryone: {
        on: availability === 'everyone' || availability === 'all',
        title: 'Everyone',
      },
      isVisitor: {
        on: availability === 'visitor',
        title: 'Visitors',
      },
      isLoggedUser: {
        on: availability === 'logged_user',
        title: 'Logged in Users',
      },
      isCustomer: {
        on: availability === 'customer',
        title: 'Customers',
      },
      isPromoter: {
        on: availability === 'promoter',
        title: 'Promoters',
      },
      isRank6: {
        on: availability === 'rank_6',
        title: 'Rank 6',
      },
      isRank7: {
        on: availability === 'rank_7',
        title: 'Rank 7',
      },
      isRank8: {
        on: availability === 'rank_8',
        title: 'Rank 8',
      },
      isSmartship: {
        on: availability === 'smartship',
        title: 'Active SmartShip',
      },
      isLoyalSmartship: {
        on: availability === 'loyal_smartship',
        title: 'Loyal Active Smartship',
      },
      isVip: {
        on: availability === 'vip',
        title: 'VIP',
      },
      isCustom: {
        on: availability === 'custom_user',
        title: 'Custom users',
      },
    };

    return accessLevels;
  }
}
