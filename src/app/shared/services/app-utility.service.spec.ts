import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { QuickAddMenus } from 'src/app/foods/models/food-quickadd-menus.model';
import { AppState } from 'src/app/store/app.reducer';

import { AppUtilityService } from './app-utility.service';

const initialState: AppState = {
  cartList: {
    oneTime: [],
    everyMonth: [],
  },
  foodsList: {
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
  },
};

fdescribe('AppUtilityService', () => {
  let service: AppUtilityService;
  let store: MockStore<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(AppUtilityService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should display initial store values', () => {
    expect(service.oneTimeCart.length).toBe(0);
    expect(service.everyMonthCart.length).toBe(0);
    expect(service.foodsCart.length).toBe(0);
  });

  it('should reflect the updated change store values', () => {
    const updatedState: AppState = {
      ...initialState,
      cartList: {
        oneTime: [
          {
            country: 'us',
            language: 'en',
            orderType: 'ordertype_3',
            isCurrent: true,
            isPromoter: false,
            cart: {
              productID: 2086,
              productName: 'Challenge Pack',
              productImageUrl:
                'https://api.shopketo.com/wp-content/uploads/2021/06/challenge_pack_6_22149.png',
              servingsName: '10 Day',
              caffeineState: '',
              totalQuantity: 3,
              quantity: 1,
              price: {
                oneTime: 130,
                everyMonth: 99,
              },
              discountPrice: 99.0015,
              productSku: {
                oneTime: 'PRU-5-086-1-20-T1-ONCE',
                everyMonth: 'PRU-5-086-1-20-T1-RENEW',
              },
              discountPercent: 23.845,
              smartshipDiscountPrice: 0,
              smartshipDiscountPercent: 0,
              isUserCanAccess: false,
              discountType: '',
              offerDiscountPrice: 0,
              isSmartshipDiscountOn: false,
            },
            finalPrice: 0,
          },
        ],
        everyMonth: [],
      },
    };
    store.setState(updatedState);

    expect(service.oneTimeCart.length).toBe(1);
    expect(service.everyMonthCart.length).toBe(0);
    expect(service.foodsCart.length).toBe(0);
  });
});
