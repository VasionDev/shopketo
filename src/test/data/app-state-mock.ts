import { AppState } from 'src/app/store/app.reducer';
import { fakeInitialCartState } from './cart-state-mock';
import { fakeInitialFoodState } from './food-state-mock';

export const fakeInitialAppState: AppState = {
  cartList: fakeInitialCartState,
  foodsList: fakeInitialFoodState,
};
