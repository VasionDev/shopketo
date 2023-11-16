import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { Product } from 'src/app/products/models/product.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { DiscountBanner } from './discount-banner.model';

export interface ProductData {
  challengeSettings: any;
  generalSettings: any;
  products: Product[];
  productsData: any;
  hiddenProducts: Product[];
  productSettings: ProductSettings;
  offers: Offer[];
  discountBanners: DiscountBanner[];
}
