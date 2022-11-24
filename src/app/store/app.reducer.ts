import { ActionReducerMap } from '@ngrx/store';
import {
  foodsListReducer,
  FoodsState,
} from '../foods/store/foods-list.reducer';
import { cartListReducer, CartsState } from '../sidebar/store/cart.reducer';

export interface AppState {
  foodsList: FoodsState;
  cartList: CartsState;
}

export const appReducer: ActionReducerMap<AppState> = {
  foodsList: foodsListReducer,
  cartList: cartListReducer,
};
