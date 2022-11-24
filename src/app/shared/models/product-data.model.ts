import { Offer } from 'src/app/shared/models/offer.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { Product } from 'src/app/products/models/product.model';
import { DiscountBanner } from './discount-banner.model';

export interface ProductData {
  products: Product[];
  productsData: any;
  productSettings: ProductSettings;
  offers: Offer[];
  discountBanners: DiscountBanner[];
}
