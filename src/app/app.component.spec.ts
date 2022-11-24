import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { BlogApiService } from './blogs/services/blog-api.service';
import { HeaderComponent } from './core/header/header.component';
import { selectModalId } from './foods/store/foods-list.selectors';
import { ProductCardService } from './products/services/product-card.service';
import { ProductsApiService } from './products/services/products-api.service';
import { ProductsFormService } from './products/services/products-form.service';
import { ProductsTagAndCategoryService } from './products/services/products-tag-and-category.service';
import { ProductsUtilityService } from './products/services/products-utility.service';
import { AppDataService } from './shared/services/app-data.service';
import { Cart } from './shared/models/cart.model';
import { AppOfferService } from './shared/services/app-offer.service';
import { AppUserService } from './shared/services/app-user.service';
import { AppUtilityService } from './shared/services/app-utility.service';
import { setOneTime } from './sidebar/store/cart.actions';
import { CartsState } from './sidebar/store/cart.reducer';
import { appReducer, AppState } from './store/app.reducer';
import { ProductData } from './shared/models/product-data.model';
import { delay } from 'rxjs/operators';
import { FacebookService } from 'ngx-facebook';
import { FacebookServiceStub } from 'src/test/services/facebook-service-mock';
import { BlogApiServiceStub } from 'src/test/services/blog-api-service-mock';
import { AppDataServiceStub } from 'src/test/services/app-data-service-mock';
import { AppUtilityServiceStub } from 'src/test/services/app-utility-service-mock';
import { AppUserServiceStub } from 'src/test/services/app-user-service-mock';
import { OidcSecurityServiceStub } from 'src/test/services/oidc-security-service-mock';
import { fakeInitialFoodState } from 'src/test/data/food-state-mock';
import { fakeInitialCartState } from 'src/test/data/cart-state-mock';
import { FormsModule } from '@angular/forms';
import { FakeTranslateLoader } from 'src/test/services/translate-loader-mock';
import {
  PHRASE_CONFIG,
  PHRASE_CONFIG_TOKEN,
} from './shared/config/phrase-config';

fdescribe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let blogApiService: BlogApiService;

  let mockStore: MockStore<AppState>;
  let mockModalIdSelector: MemoizedSelector<AppState, string>;

  let headerFixture: ComponentFixture<HeaderComponent>;
  let headerComponent: HeaderComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      declarations: [AppComponent, HeaderComponent],
      providers: [
        provideMockStore(),

        ProductsApiService,
        ProductsFormService,
        ProductsTagAndCategoryService,
        ProductCardService,
        AppOfferService,
        ProductsUtilityService,

        { provide: PHRASE_CONFIG_TOKEN, useValue: PHRASE_CONFIG },
        { provide: FacebookService, useClass: FacebookServiceStub },
        { provide: BlogApiService, useClass: BlogApiServiceStub },
        { provide: AppDataService, useClass: AppDataServiceStub },
        { provide: AppUtilityService, useClass: AppUtilityServiceStub },
        { provide: AppUserService, useClass: AppUserServiceStub },
        { provide: OidcSecurityService, useClass: OidcSecurityServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    blogApiService = TestBed.inject(BlogApiService);
    mockStore = TestBed.inject(MockStore);

    mockModalIdSelector = mockStore.overrideSelector(selectModalId, '');
    component = fixture.componentInstance;

    headerFixture = TestBed.createComponent(HeaderComponent);
    headerComponent = headerFixture.componentInstance;
  }));

  afterEach(() => {
    mockStore.resetSelectors();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should show country sidebar on clicking onClickCountry', () => {
    let currentSidebarName = '';

    headerComponent.messageEvent.subscribe((res) => {
      currentSidebarName = res;
    });

    headerComponent.onClickCountry();

    expect(currentSidebarName).toBe('country-bar');
  });

  it('should test subscribe method blogApiService', () => {
    const getBlogSpy = spyOn(blogApiService, 'getBlogs').and.returnValue(
      of([
        {
          id: 1,
          title: 'test',
          description: [],
          content: 'test',
          imageUrl: 'sfa',
          slug: 'res',
          authorId: 1,
          categoryIds: [],
          tags: [],
        },
      ])
    );
    const subscribeSpy = spyOn(blogApiService.getBlogs('US'), 'subscribe');
    //const setBlogsSpy = spyOn(dataService, 'setBlogsData');

    fixture.detectChanges();

    expect(getBlogSpy).toHaveBeenCalledBefore(subscribeSpy);
    expect(subscribeSpy).toHaveBeenCalled();

    // expect(setBlogsSpy).toHaveBeenCalled();
  });

  xit('should test private subscribe method in getUserCheckoutCountries', () => {
    const getCheckoutCountriesSpy = spyOn<any>(
      component,
      'getUserCheckoutCountries'
    ).withArgs({ mvuser_country: 'US' });

    component['getUserCheckoutCountries']({ mvuser_country: 'US' });

    expect(getCheckoutCountriesSpy).toHaveBeenCalled();
  });

  it('should display the modalId', () => {
    fixture.detectChanges();

    expect(component.currentModalId).toBe('');

    mockModalIdSelector.setResult('modalId1');

    mockStore.refreshState();
    fixture.detectChanges();

    expect(component.currentModalId).toBe('modalId1');
  });

  it('should test initial state of reducer', () => {
    const action = {
      type: 'Unknown',
    };

    const state = appReducer.cartList(fakeInitialCartState, action);

    expect(state).toBe(fakeInitialCartState);
    expect(state).toEqual(fakeInitialCartState);
  });

  it('should update oneTime cart with reducer', () => {
    const cart: Cart[] = [
      {
        country: 'us',
        language: 'en',
        orderType: 'ordertype_1',
        isPromoter: false,
        isCurrent: true,
        finalPrice: 0,
        isDiscountable: false,
        cart: {
          productID: 1,
          productName: 'test product',
          productImageUrl: 'url',
          servingsName: 'no',
          caffeineState: 'no',
          totalQuantity: 10,
          quantity: 1,
          price: { oneTime: 20, everyMonth: 10 },
          discountPrice: 10,
          productSku: { oneTime: 'xxx', everyMonth: 'yyy' },
          discountPercent: 40,
          smartshipDiscountPrice: 0,
          smartshipDiscountPercent: 0,
          isUserCanAccess: true,
          discountType: 'FOOD',
          offerDiscountPrice: 10,
          isSmartshipDiscountOn: false,
        },
      },
    ];
    const cartState: CartsState = { oneTime: cart, everyMonth: [] };

    const action = setOneTime({ oneTimeCart: cart });
    const state = appReducer.cartList(fakeInitialCartState, action);

    expect(state).toEqual(cartState);
    expect(state).not.toBe(cartState);
    expect(state.oneTime.length).toBe(1);
    expect(state.everyMonth.length).toBe(0);

    const secondAction = setOneTime({ oneTimeCart: cart });
    const secondState = appReducer.cartList(fakeInitialCartState, secondAction);

    expect(secondState).toEqual(cartState);
    expect(secondState.oneTime.length).toBe(1);
  });

  it('should test select the initial modalId and nextShipment', () => {
    const selectedModalId = selectModalId.projector(fakeInitialFoodState);

    expect(selectedModalId).toBe('testModalId');
  });

  it('should test productApiService', fakeAsync(() => {
    const productApiService =
      fixture.debugElement.injector.get(ProductsApiService);

    const spy = spyOn(productApiService, 'getProductsWithLanguage')
      .withArgs('US', 'en')
      .and.callFake(() => of({} as ProductData).pipe(delay(200)));

    component.getProducts('US', 'en');
    component.isCodePresent = false;

    expect(component.isLoaded).toBeFalse();

    tick(200);

    expect(component.isLoaded).toBeTrue();
    expect(spy).toHaveBeenCalled();
  }));
});
