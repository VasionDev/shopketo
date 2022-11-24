import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  async,
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ProductsUtilityService } from '../../services/products-utility.service';
import { PromoterService } from '../../services/promoter.service';
import { AppState } from '../../../store/app.reducer';

import { PromoterComponent } from './promoter.component';
import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { QuickAddMenus } from 'src/app/foods/models/food-quickadd-menus.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import('@lottiefiles/lottie-player');

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

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

fdescribe('PromoterComponent', () => {
  let component: PromoterComponent;
  let fixture: ComponentFixture<PromoterComponent>;
  let store: MockStore<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      declarations: [PromoterComponent],
      providers: [
        provideMockStore({ initialState }),
        ProductsUtilityService,
        PromoterService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoterComponent);
    store = TestBed.inject(MockStore);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect mouseenter event on hovering on lotte icons', waitForAsync(() => {
    const firstIconDiv = fixture.debugElement.queryAll(
      By.css('.col-sm-12.col-md-4.pr-pack')
    )[0];

    firstIconDiv.triggerEventHandler('mouseenter', null);

    fixture.detectChanges();

    const firstIconsPlayer = firstIconDiv.children[0].nativeElement;

    spyOn(firstIconsPlayer, 'play');

    fixture.whenStable().then(() => {
      expect(firstIconsPlayer.play).toHaveBeenCalled();
    });
  }));
});
