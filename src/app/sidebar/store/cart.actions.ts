import { createAction, props } from '@ngrx/store';
import { Cart } from 'src/app/shared/models/cart.model';

export const setOneTime = createAction(
  '[Cart] Set One Time',
  props<{ oneTimeCart: ReadonlyArray<Cart> }>()
);

export const setEveryMonth = createAction(
  '[Cart] Set Every Month',
  props<{ everyMonthCart: ReadonlyArray<Cart> }>()
);

export const UpdateOneTime = createAction(
  '[Cart] Update One Time',
  props<{ oneTimeCart: Readonly<Cart> }>()
);

export const UpdateEveryMonth = createAction(
  '[Cart] Update Every Month',
  props<{ everyMonthCart: Readonly<Cart> }>()
);

export const DeleteOneTime = createAction(
  '[Cart] Delete One Time',
  props<{ oneTimeCart: Readonly<Cart> }>()
);

export const DeleteEveryMonth = createAction(
  '[Cart] Delete Every Month',
  props<{ everyMonthCart: Readonly<Cart> }>()
);

export const DeleteAllPromotersOneTime = createAction(
  '[Cart] Delete All Promoters One Time'
);

export const RemoveAllOneTime = createAction(
  '[Cart] Remove All One Time'
);

export const RemoveAllEveryMonth = createAction(
  '[Cart] Remove All Every Month'
);