import { Observable } from 'rxjs';
import { ProductAccess } from './product-access.model';

export interface DiscountBanner {
  bannerText: string;
  backgroundColor: string;
  textColor: string;
  countDown$: Observable<string>;
  accessLevels: ProductAccess;
  customUsers: number[];
}
