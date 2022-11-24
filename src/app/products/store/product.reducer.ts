import { createReducer, on } from '@ngrx/store';
import { Product } from '../models/product.model';
import { setProducts } from './product.actions';

const initState: Product[] = [];

export const setFoodReducer = createReducer(
  initState,
  on(setProducts, (state, { products }) => products)
);
