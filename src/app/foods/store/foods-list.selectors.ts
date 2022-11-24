import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { FoodsState } from './foods-list.reducer';

const selectFoodList = (state: AppState) => state.foodsList;

export const selectModalId = createSelector(
  selectFoodList,
  (state: FoodsState) => state.modalId
);

export const selectNextShipment = createSelector(
  selectFoodList,
  (state: FoodsState) => state.nextShipment
);

export const selectFoods = createSelector(
  selectFoodList,
  (state: FoodsState) => state.foods
);
