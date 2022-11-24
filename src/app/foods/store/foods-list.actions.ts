import { Action } from '@ngrx/store';
import { Offer } from 'src/app/shared/models/offer.model';
import { FoodDelivery } from '../models/food-delivery.model';
import { FoodDiscount } from '../models/food-discount.model';
import { PreloadedMenus } from '../models/food-preloaded-menus.model';
import { QuickAddMenus } from '../models/food-quickadd-menus.model';
import { Food } from '../models/food.model';

export enum FoodTypes {
  SET_FOODS = 'SET_FOODS',
  UPDATE_FOOD = 'UPDATE_FOOD',
  SET_FOOD_MODAL_ID = 'SET_FOOD_MODAL_ID',
  SET_FOOD_TYPES = 'SET_FOOD_TYPES',
  SET_FOOD_CATEGORIES = 'SET_FOOD_CATEGORIES',
  SET_FOOD_SUB_CATEGORIES = 'SET_FOOD_SUB_CATEGORIES',
  SET_FOOD_DIET_TYPES = 'SET_FOOD_DIET_TYPES',
  SET_FOOD_DISCOUNT_INFO = 'SET_FOOD_DISCOUNT_INFO',
  SET_SELECTED_CATEGORY = 'SET_SELECTED_CATEGORY',
  SET_SELECTED_DIETS = 'SET_SELECTED_DIETS',
  SET_SELECTED_SORT = 'SET_SELECTED_SORT',
  SET_PRELOADED_MENUS = 'SET_PRELOADED_MENUS',
  SET_QUICKADD_MENUS = 'SET_QUICKADD_MENUS',
  SET_FOOD_DELIVERY = 'SET_FOOD_DELIVERY',
  SET_CHECKOUT_ORDER = 'SET_CHECKOUT_ORDER',
  UPDATE_NEXT_SHIPMENT = 'UPDATE_NEXT_SHIPMENT',
  UPDATE_NEXT_SHIPMENT_START = 'UPDATE_NEXT_SHIPMENT_START',
  UPDATE_NEXT_SHIPMENT_STATUS = 'UPDATE_NEXT_SHIPMENT_STATUS',
  SET_FOOD_OFFER_ACTION = 'SET_FOOD_OFFER_ACTION',
  SET_CHECKOUT_FOODS = 'SET_CHECKOUT_FOODS',
}

export class SetFoodsAction implements Action {
  readonly type = FoodTypes.SET_FOODS;

  constructor(public payload: Food[]) {}
}

export class UpdateFoodAction implements Action {
  readonly type = FoodTypes.UPDATE_FOOD;

  constructor(public payload: Food) {}
}

export class SetFoodModalNameActon implements Action {
  readonly type = FoodTypes.SET_FOOD_MODAL_ID;

  constructor(public payload: string) {}
}

export class SetFoodTypesActon implements Action {
  readonly type = FoodTypes.SET_FOOD_TYPES;

  constructor(public payload: string[]) {}
}

export class SetFoodCategoriesActon implements Action {
  readonly type = FoodTypes.SET_FOOD_CATEGORIES;

  constructor(public payload: string[]) {}
}

export class SetFoodSubCategoriesActon implements Action {
  readonly type = FoodTypes.SET_FOOD_SUB_CATEGORIES;

  constructor(public payload: string[]) {}
}

export class SetFoodDietTypesActon implements Action {
  readonly type = FoodTypes.SET_FOOD_DIET_TYPES;

  constructor(public payload: string[]) {}
}

export class SetFoodDiscountInfoAction implements Action {
  readonly type = FoodTypes.SET_FOOD_DISCOUNT_INFO;

  constructor(public payload: FoodDiscount) {}
}

export class SetFoodSelectedCategoryActon implements Action {
  readonly type = FoodTypes.SET_SELECTED_CATEGORY;

  constructor(public payload: string) {}
}

export class SetFoodSelectedDietsActon implements Action {
  readonly type = FoodTypes.SET_SELECTED_DIETS;

  constructor(public payload: string[]) {}
}

export class SetFoodSelectedSortActon implements Action {
  readonly type = FoodTypes.SET_SELECTED_SORT;

  constructor(public payload: string) {}
}

export class SetPreloadedMenusActon implements Action {
  readonly type = FoodTypes.SET_PRELOADED_MENUS;

  constructor(public payload: PreloadedMenus) {}
}

export class SetQuickAddMenusActon implements Action {
  readonly type = FoodTypes.SET_QUICKADD_MENUS;

  constructor(public payload: QuickAddMenus) {}
}

export class SetFoodDeliveryActon implements Action {
  readonly type = FoodTypes.SET_FOOD_DELIVERY;

  constructor(public payload: FoodDelivery | null) {}
}

export class SetCheckoutOrderActon implements Action {
  readonly type = FoodTypes.SET_CHECKOUT_ORDER;

  constructor(public payload: string) {}
}

export class UpdateNextShipmentActon implements Action {
  readonly type = FoodTypes.UPDATE_NEXT_SHIPMENT;

  constructor(
    public payload: { nextRun: string; shippingDate: string; isSet: boolean }
  ) {}
}

export class SetFoodOfferActon implements Action {
  readonly type = FoodTypes.SET_FOOD_OFFER_ACTION;

  constructor(public payload: Offer[]) {}
}

export class UpdateNextShipmentStartActon implements Action {
  readonly type = FoodTypes.UPDATE_NEXT_SHIPMENT_START;

  constructor(
    public payload: {
      autoshipId: number;
      tokenType: string;
      accessToken: string;
      nextRun: string;
    }
  ) {}
}

export class UpdateNextShipmentStatusActon implements Action {
  readonly type = FoodTypes.UPDATE_NEXT_SHIPMENT_STATUS;

  constructor(public payload: boolean) {}
}

export class SetCheckoutFoodsAction implements Action {
  readonly type = FoodTypes.SET_CHECKOUT_FOODS;

  constructor(public payload: Food[]) {}
}

export type FoodActions =
  | SetFoodsAction
  | UpdateFoodAction
  | SetFoodModalNameActon
  | SetFoodTypesActon
  | SetFoodCategoriesActon
  | SetFoodSubCategoriesActon
  | SetFoodDiscountInfoAction
  | SetFoodDietTypesActon
  | SetFoodSelectedCategoryActon
  | SetFoodSelectedDietsActon
  | SetFoodSelectedSortActon
  | SetPreloadedMenusActon
  | SetQuickAddMenusActon
  | SetFoodDeliveryActon
  | SetCheckoutOrderActon
  | UpdateNextShipmentActon
  | UpdateNextShipmentStartActon
  | UpdateNextShipmentStatusActon
  | SetCheckoutFoodsAction;
