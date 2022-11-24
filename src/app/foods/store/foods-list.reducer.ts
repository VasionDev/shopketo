import { Offer } from 'src/app/shared/models/offer.model';
import { FoodDelivery } from '../models/food-delivery.model';
import { FoodDiscount } from '../models/food-discount.model';
import { PreloadedMenus } from '../models/food-preloaded-menus.model';
import { QuickAddMenus } from '../models/food-quickadd-menus.model';
import { Food } from '../models/food.model';
import { FoodTypes } from '../store/foods-list.actions';

export interface FoodsState {
  foods: Food[];
  modalId: string;
  types: string[];
  categories: string[];
  subCategories: string[];
  dietTypes: string[];
  discountsInfo: FoodDiscount;
  boxes: {
    noOfItems: number;
    currentLimit: number;
    currentlyFilled: number;
  };
  preloadedMenus: PreloadedMenus;
  quickAddMenus: QuickAddMenus;
  selectedCategory: string;
  selectedDiets: string[];
  selectedSort: string;
  foodDelivery: FoodDelivery | null;
  checkoutOrder: string;
  nextShipment: { nextRun: string; shippingDate: string; isSet: boolean };
  offers: Offer[];
  checkoutFoods: Food[];
}

const initialFoods: FoodsState = {
  foods: [],
  modalId: '',
  types: [],
  categories: [],
  subCategories: [],
  dietTypes: [],
  discountsInfo: {} as FoodDiscount,
  boxes: {
    noOfItems: 0,
    currentLimit: 0,
    currentlyFilled: 0,
  },
  preloadedMenus: {
    text: '',
    menus: [],
  },
  quickAddMenus: {} as QuickAddMenus,
  selectedCategory: 'all',
  selectedDiets: [],
  selectedSort: 'default',
  foodDelivery: null,
  checkoutOrder: '',
  nextShipment: {
    nextRun: '',
    shippingDate: '',
    isSet: false,
  },
  offers: [],
  checkoutFoods: [],
};

export function foodsListReducer(state = initialFoods, action: any) {
  switch (action.type) {
    case FoodTypes.SET_FOODS:
      const noOfItemsInBoxes = action.payload.reduce(
        (sum: number, food: Food) => sum + (food.quantity ? food.quantity : 0),
        0
      );
      const currentlyFilledBoxes =
        noOfItemsInBoxes > 0 && state.discountsInfo.itemsPerBox
          ? Math.floor((noOfItemsInBoxes - 1) / state.discountsInfo.itemsPerBox)
          : 0;

      const currentBoxLimit = state.discountsInfo.itemsPerBox
        ? (currentlyFilledBoxes + 1) * state.discountsInfo.itemsPerBox
        : 0;

      return {
        ...state,
        foods: [...action.payload],
        boxes: {
          ...state.boxes,
          noOfItems: noOfItemsInBoxes,
          currentLimit: currentBoxLimit,
          currentlyFilled: currentlyFilledBoxes,
        },
      };

    case FoodTypes.UPDATE_FOOD:
      const updatedFoods: Food[] = state.foods.map((food) =>
        food.id === action.payload.id ? action.payload : food
      );
      const updatedNoOfItemsInBoxes = updatedFoods.reduce(
        (sum, food) => sum + (food.quantity ? food.quantity : 0),
        0
      );
      const updatedCurrentlyFilledBoxes =
        updatedNoOfItemsInBoxes > 0 && state.discountsInfo.itemsPerBox
          ? Math.floor(
              (updatedNoOfItemsInBoxes - 1) / state.discountsInfo.itemsPerBox
            )
          : 0;

      const updatedCurrentBoxLimit = state.discountsInfo.itemsPerBox
        ? (updatedCurrentlyFilledBoxes + 1) * state.discountsInfo.itemsPerBox
        : 0;

      return {
        ...state,
        foods: updatedFoods,
        boxes: {
          ...state.boxes,
          noOfItems: updatedNoOfItemsInBoxes,
          currentLimit: updatedCurrentBoxLimit,
          currentlyFilled: updatedCurrentlyFilledBoxes,
        },
      };

    case FoodTypes.SET_FOOD_MODAL_ID:
      return {
        ...state,
        modalId: action.payload,
      };

    case FoodTypes.SET_FOOD_CATEGORIES:
      return {
        ...state,
        categories: [...action.payload],
      };

    case FoodTypes.SET_FOOD_SUB_CATEGORIES:
      return {
        ...state,
        subCategories: [...action.payload],
      };

    case FoodTypes.SET_FOOD_TYPES:
      return {
        ...state,
        types: [...action.payload],
      };

    case FoodTypes.SET_FOOD_DIET_TYPES:
      return {
        ...state,
        dietTypes: [...action.payload],
      };

    case FoodTypes.SET_FOOD_DISCOUNT_INFO:
      return { ...state, discountsInfo: { ...action.payload } };

    case FoodTypes.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case FoodTypes.SET_SELECTED_SORT:
      return {
        ...state,
        selectedSort: action.payload,
      };

    case FoodTypes.SET_SELECTED_DIETS:
      return {
        ...state,
        selectedDiets: [...action.payload],
      };

    case FoodTypes.SET_PRELOADED_MENUS:
      return {
        ...state,
        preloadedMenus: {
          text: action.payload.text,
          menus: [...action.payload.menus],
        },
      };

    case FoodTypes.SET_QUICKADD_MENUS:
      return {
        ...state,
        quickAddMenus: {
          ...state.quickAddMenus,
          ...action.payload,
        },
      };

    case FoodTypes.SET_FOOD_DELIVERY:
      return {
        ...state,
        foodDelivery: action.payload
          ? {
              ...state.foodDelivery,
              ...action.payload,
            }
          : null,
      };

    case FoodTypes.SET_CHECKOUT_ORDER:
      return {
        ...state,
        checkoutOrder: action.payload,
      };

    case FoodTypes.UPDATE_NEXT_SHIPMENT:
      return {
        ...state,
        nextShipment: {
          ...state.nextShipment,
          ...action.payload,
        },
      };

    case FoodTypes.UPDATE_NEXT_SHIPMENT_STATUS:
      return {
        ...state,
        nextShipment: {
          ...state.nextShipment,
          isSet: action.payload,
        },
      };

    case FoodTypes.SET_FOOD_OFFER_ACTION:
      return {
        ...state,
        offers: [...action.payload],
      };

    case FoodTypes.SET_CHECKOUT_FOODS:
      return {
        ...state,
        checkoutFoods: [...action.payload],
      };

    default:
      return state;
  }
}
