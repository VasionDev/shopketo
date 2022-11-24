import { Product } from '../../products/models/product.model';
import { ProductAccess } from './product-access.model';

export interface Offer {
  type: 'SKU_PURCHASE' | 'CART_TOTAL' | 'FOOD' | '';
  accessLevels: ProductAccess;
  customUsers: number[];
  title: string;
  description: string;
  condition: string;
  additionalDescription: string;
  tag: string;
  qualifiedSkus: {
    oneTime: string[];
    everyMonth: string[];
  };
  product: Product;
  discount: {
    oneTime: { sku: string; amount: number }[];
    everyMonth: { sku: string; amount: number }[];
  };
  isSmartshipDiscount: boolean;
  includeRegularDiscount: boolean;
  offerAppliedFor: 'ONE_TIME' | 'SMARTSHIP' | 'ONE_TIME_SMARTSHIP';
  priceOver: number;
  priceUnder: number;
}
