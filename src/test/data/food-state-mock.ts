import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { QuickAddMenus } from 'src/app/foods/models/food-quickadd-menus.model';
import { FoodsState } from 'src/app/foods/store/foods-list.reducer';

export const fakeInitialFoodState: FoodsState = {
  foods: [],
  modalId: 'testModalId',
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
  quickAddMenus: {
    title: 'test',
    description: 'test',
    image: 'testImage',
    bGColor: 'test',
    menus: [],
    quantity: 1,
  } as QuickAddMenus,
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
