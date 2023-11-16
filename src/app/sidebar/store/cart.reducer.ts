import { createReducer, on } from '@ngrx/store';
import { Cart } from 'src/app/shared/models/cart.model';
import {
  DeleteAllPromotersOneTime,
  DeleteEveryMonth,
  DeleteOneTime,
  setEveryMonth,
  setOneTime,
  UpdateEveryMonth,
  UpdateOneTime,
  RemoveAllOneTime,
  RemoveAllEveryMonth
} from './cart.actions';

export interface CartsState {
  oneTime: Cart[];
  everyMonth: Cart[];
}

const initialCartState: CartsState = {
  oneTime: [],
  everyMonth: [],
};

export const cartListReducer = createReducer(
  initialCartState,

  on(setOneTime, (state, { oneTimeCart }) => ({
    ...state,
    oneTime: [...oneTimeCart],
  })),

  on(setEveryMonth, (state, { everyMonthCart }) => ({
    ...state,
    everyMonth: [...everyMonthCart],
  })),

  on(UpdateOneTime, (state, { oneTimeCart }) => {
    const updatedOneTime: Cart[] = state.oneTime.map((item) => {
      if (oneTimeCart.cart.caffeineState === '') {
        if (
          item.cart.productID === oneTimeCart.cart.productID &&
          item.cart.servingsName === oneTimeCart.cart.servingsName
        ) {
          return oneTimeCart;
        } else {
          return item;
        }
      } else {
        if (
          item.cart.productID === oneTimeCart.cart.productID &&
          item.cart.servingsName === oneTimeCart.cart.servingsName &&
          item.cart.caffeineState === oneTimeCart.cart.caffeineState
        ) {
          return oneTimeCart;
        } else {
          return item;
        }
      }
    });
    return {
      ...state,
      oneTime: updatedOneTime,
    };
  }),

  on(UpdateEveryMonth, (state, { everyMonthCart }) => {
    const updatedEveryMonth: Cart[] = state.everyMonth.map((item) => {
      if (everyMonthCart.cart.caffeineState === '') {
        if (
          item.cart.productID === everyMonthCart.cart.productID &&
          item.cart.servingsName === everyMonthCart.cart.servingsName
        ) {
          return everyMonthCart;
        } else {
          return item;
        }
      } else {
        if (
          item.cart.productID === everyMonthCart.cart.productID &&
          item.cart.servingsName === everyMonthCart.cart.servingsName &&
          item.cart.caffeineState === everyMonthCart.cart.caffeineState
        ) {
          return everyMonthCart;
        } else {
          return item;
        }
      }
    });

    return {
      ...state,
      everyMonth: updatedEveryMonth,
    };
  }),

  on(DeleteOneTime, (state, { oneTimeCart }) => {
    const filteredOneTime: Cart[] =
      oneTimeCart.cart.caffeineState === ''
        ? state.oneTime.filter(
            (item) =>
              !(
                item.cart.productID === oneTimeCart.cart.productID &&
                item.cart.servingsName === oneTimeCart.cart.servingsName
              )
          )
        : state.oneTime.filter(
            (item) =>
              !(
                item.cart.productID === oneTimeCart.cart.productID &&
                item.cart.servingsName === oneTimeCart.cart.servingsName &&
                item.cart.caffeineState === oneTimeCart.cart.caffeineState
              )
          );

    return {
      ...state,
      oneTime: filteredOneTime,
    };
  }),

  on(DeleteEveryMonth, (state, { everyMonthCart }) => {
    const filteredEveryMonth: Cart[] =
      everyMonthCart.cart.caffeineState === ''
        ? state.everyMonth.filter(
            (item) =>
              !(
                item.cart.productID === everyMonthCart.cart.productID &&
                item.cart.servingsName === everyMonthCart.cart.servingsName
              )
          )
        : state.everyMonth.filter(
            (item) =>
              !(
                item.cart.productID === everyMonthCart.cart.productID &&
                item.cart.servingsName === everyMonthCart.cart.servingsName &&
                item.cart.caffeineState === everyMonthCart.cart.caffeineState
              )
          );

    return {
      ...state,
      everyMonth: filteredEveryMonth,
    };
  }),

  on(DeleteAllPromotersOneTime, (state) => {
    const filteredPromoters: Cart[] = state.oneTime.filter(
      (item) => !item.isPromoter
    );

    return {
      ...state,
      oneTime: filteredPromoters,
    };
  }),

  on(RemoveAllOneTime, (state) => {
    const cartData: Cart[] = []

    return {
      ...state,
      oneTime: cartData,
    };
  }),

  on(RemoveAllEveryMonth, (state) => {
    const cartData: Cart[] = []

    return {
      ...state,
      everyMonth: cartData,
    };
  })

);
