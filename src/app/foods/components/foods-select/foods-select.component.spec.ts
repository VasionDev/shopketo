import {
  async,
  ComponentFixture,
  getTestBed,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { FoodApiService } from '../../services/food-api.service';
import { FoodUtilityService } from '../../services/food-utility.service';

import { FoodsSelectComponent } from './foods-select.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, Injector } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SortPipe } from 'src/app/products/pipes/sort.pipe';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { FilterCategoryPipe } from '../../pipes/filter-category.pipe';
import { FilterSubCategoryPipe } from '../../pipes/filter-sub-category.pipe';
import { FilterDietPipe } from '../../pipes/filter-diet.pipe';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { ProductsFormService } from 'src/app/products/services/products-form.service';
import { ProductsTagAndCategoryService } from 'src/app/products/services/products-tag-and-category.service';
import { FoodCardComponent } from '../common/food-card/food-card.component';
import { ProductCardService } from 'src/app/products/services/product-card.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUserServiceStub } from 'src/test/services/app-user-service-mock';
import { FoodApiServiceStub } from 'src/test/services/food-api-service-mock';
import { AppUtilityServiceStub } from 'src/test/services/app-utility-service-mock';
import { FakeTranslateLoader } from 'src/test/services/translate-loader-mock';
import { fakeInitialAppState } from 'src/test/data/app-state-mock';

fdescribe('FoodsSelectComponent', () => {
  let component: FoodsSelectComponent;
  let cardComponent: FoodCardComponent;

  let fixture: ComponentFixture<FoodsSelectComponent>;
  let cardFixture: ComponentFixture<FoodCardComponent>;

  let translateService: TranslateService;
  let foodUtilityService: FoodUtilityService;
  let injector: Injector;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      declarations: [
        FoodsSelectComponent,
        FoodCardComponent,
        SortPipe,
        FilterCategoryPipe,
        FilterSubCategoryPipe,
        FilterDietPipe,
      ],
      providers: [
        provideMockStore({ initialState: fakeInitialAppState }),
        FoodUtilityService,
        ProductsFormService,
        ProductsTagAndCategoryService,
        AppOfferService,
        ProductCardService,
        TranslateService,
        ProductsUtilityService,
        { provide: AppUserService, useClass: AppUserServiceStub },
        { provide: FoodApiService, useClass: FoodApiServiceStub },
        { provide: AppUtilityService, useClass: AppUtilityServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // alternative
    // TestBed.overrideComponent(FoodsSelectComponent, {
    //   set: {
    //     providers: [
    //       { provide: FoodApiService, useClass: FoodApiServiceStub },
    //       { provide: AppUtilityService, useClass: AppUtilityServiceStub },
    //     ],
    //   },
    // });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodsSelectComponent);
    component = fixture.componentInstance;

    cardFixture = TestBed.createComponent(FoodCardComponent);
    cardComponent = cardFixture.componentInstance;

    foodUtilityService = TestBed.inject(FoodUtilityService);

    component.foods = [
      {
        id: '20',
        description: 'first description',
        imageUrl: 'test imageUrl',
        slug: 'our-favorite-keto-podcasts-what-you-need-to-listen-to-no',
        type: 'calorie',
        name: '',
        sku: '',
        price: 100,
        quantity: 0,
        maxQuantity: 10,
        instructions: [],
        nutritionDisclaimer: '',
        limitedTimeAvailability: {
          isSet: false,
          isModalShown: false,
          availableUntil: '',
        },
      },
    ];

    // singeleton instance
    injector = getTestBed();
    translateService = injector.get(TranslateService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should check foodutilityService', () => {
    fixture.detectChanges();
    expect(foodUtilityService instanceof FoodUtilityService).toBeTruthy();
  });

  it('should create injected foodUtilityService', inject(
    [FoodUtilityService],
    (injectedFoodUtilityService: FoodUtilityService) => {
      fixture.detectChanges();
      expect(injectedFoodUtilityService).toBeTruthy();
      expect(
        injectedFoodUtilityService instanceof FoodUtilityService
      ).toBeTruthy();
    }
  ));

  it('should create overriden foodAPiService', () => {
    fixture.detectChanges();
    const overridenFoodApiService =
      fixture.debugElement.injector.get(FoodApiService);
    expect(overridenFoodApiService instanceof FoodApiServiceStub).toBeTruthy();
  });

  it('should include translation `Fill 1 or more boxes`', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.debugElement.query(
      By.css('.color-gray.sub-text')
    ).nativeElement;

    translateService.use('en');
    fixture.detectChanges();

    expect(el.textContent).toBe(
      ' Fill 1 or more boxes with 8 items each to continue. '
    );
  });

  it('should return week name `Thursday`', () => {
    fixture.detectChanges();
    const weekday = component.getOrderProcessDay(
      '2022-04-28T00:00:00.000-05:00'
    );

    expect(weekday).toBe('Thursday');
  });

  it('should call `foodUtilityService` when `getDayOfTheWeekName` called', () => {
    fixture.detectChanges();
    spyOn(foodUtilityService, 'getDayOfTheWeekName');
    component.getOrderProcessDay('2022-04-28T00:00:00.000-05:00');

    expect(foodUtilityService.getDayOfTheWeekName).toHaveBeenCalled();
  });

  it('should return week name `Thursday` when `foodUtilityService` return `Thursday`', () => {
    fixture.detectChanges();
    spyOn(foodUtilityService, 'getDayOfTheWeekName').and.returnValue(
      'Thursday'
    );
    const weekday = component.getOrderProcessDay(
      '2022-04-28T00:00:00.000-05:00'
    );

    expect(weekday).toBe('Thursday');
  });

  it('should detect input changes', () => {
    fixture.detectChanges();

    const cardDe: HTMLElement = fixture.debugElement.query(
      By.css('.food-img')
    ).nativeElement;

    expect(cardDe.getAttribute('style')).toContain(
      'background-image: url("testImage")'
    );
  });
});
