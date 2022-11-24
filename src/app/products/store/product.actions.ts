import { createAction, props } from '@ngrx/store';

import { Product } from '../models/product.model';

export const setProducts = createAction(
  '[Products] Get products',
  props<{ products: Product[] }>()
);
