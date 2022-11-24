import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { Product } from './product.model';

export interface ProductTagOrCategory {
  termId: number;
  name: string;
  description: string;
  slug: string;
  parentTermId: number;
  backgroundColor: string;
  imageUrl: string;
  isNew: boolean;
  order: number;
  childs: ProductTagOrCategory[];
  products: Product[];
  accessLevels: ProductAccess;
  customUsers: number[];
  isUserCanAccess: boolean;
  isEveryoneCanAccess: boolean;
  accessLevelTitle: string;
}
