import { ProductVariationBase } from 'src/app/products/models/product-variation.model';
import { Offer } from './offer.model';

export interface Cart {
  country: string;
  language: string;
  orderType: ProductVariationBase['orderType'];
  isPromoter: boolean;
  isCurrent: boolean;
  finalPrice: number;
  isDiscountable?: boolean;
  hasUserRestriction?: boolean;
  cart: {
    productID: number;
    productName: string;
    productImageUrl: string;
    servingsName: string;
    caffeineState: string;
    totalQuantity: number;
    quantity: number;
    price: ProductVariationBase['priceObj'];
    discountPrice: number;
    productSku: ProductVariationBase['skuObj'];
    discountPercent: number;
    smartshipDiscountPrice: number;
    smartshipDiscountPercent: number;
    isUserCanAccess: boolean;
    discountType: Offer['type'];
    offerDiscountPrice: number;
    isSmartshipDiscountOn: boolean;
  };
}
