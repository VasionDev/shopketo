import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ProductCardService } from 'src/app/products/services/product-card.service';
import { ProductsApiService } from 'src/app/products/services/products-api.service';
import { ProductsFormService } from 'src/app/products/services/products-form.service';
import { ProductsTagAndCategoryService } from 'src/app/products/services/products-tag-and-category.service';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { SezzleDarkComponent } from 'src/app/products/svgs/sezzle-dark/sezzle-dark.component';
import { SezzleLightComponent } from 'src/app/products/svgs/sezzle-light/sezzle-light.component';
import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { CurrencyPipe } from 'src/app/shared/pipes/currency.pipe';
import { TextSanitizerPipe } from 'src/app/shared/pipes/text-sanitizer.pipe';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppState } from 'src/app/store/app.reducer';

import { FormComponent } from './form.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

const fakeActivatedRoute = {
  queryParamMap: of({
    get() {
      return 'challenge-pack';
    },
  }),
  params: of(convertToParamMap({ id: 'challenge-pack' })),
};

fdescribe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let activatedRoute: ActivatedRoute;
  let location: Location;
  let router: Router;
  let store: MockStore<AppState>;
  let dataService: AppDataService;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      declarations: [
        FormComponent,
        SezzleLightComponent,
        SezzleDarkComponent,
        TextSanitizerPipe,
        CurrencyPipe,
      ],
      providers: [
        provideMockStore(),
        ProductsTagAndCategoryService,
        ProductsApiService,
        AppOfferService,
        ProductsFormService,
        ProductCardService,
        ProductsUtilityService,
        AppDataService,
        PromoterService,
        CurrencyPipe,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture = TestBed.createComponent(FormComponent);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);
    dataService = TestBed.inject(AppDataService);

    component = fixture.componentInstance;
    component.subscriptions = [];
    component.productQuantity = 5;
    component.orderTypes = ['ordertype_1', 'ordertype_3'];
    component.selectedOrdertype = 'ordertype_3';
    component.product = {
      id: 10,
      title: 'Challenge pack',
      content: 'test content',
      name: 'test name',
      thumbUrl: 'test url',
      customGallery: [],
      mediumThumbUrl: 'test url',
      homeThumbUrl: 'test url',
      homeThumbRetinaUrl: 'test url',
      categories: [],
      isForPromoter: false,
      variations: [],
      servings: [],
      defaultAttribute1: 'test',
      defaultAttribute2: 'test',
      availableAttribute1s: [],
      availableAttribute2s: [],
      availableOrderType: [],
      bannerLink: 'test',
      wistiaVideoLink: 'test',
      bannerDiscription: 'test',
      isSoldOut: false,
      sellingClosedText: '',
      shippingNote: '',
      showRelatedProducts: false,
      relatedProducts: [],
      bannerStartTime: '',
      bannerStartDate: '',
      bannerEndTime: '',
      bannerEndDate: '',
      bannerImage: '',
      bannerFeatureImage: '',
      bannerBgColor1: '',
      bannerBgColor2: '',
      bannerHeadline: '',
      bannerLinkTitle: '',
      bannerStartUnixTime: 0,
      bannerEndUnixTime: 0,
      tags: [],
      isForLimitedPromoter: false,
      promoterOrder: 0,
      promoterPageImageUrl: '',
      promoterTooltipNote: '',
      isMostPopular: true,
      accessLevels: {} as ProductAccess,
      customUsers: [],
      originalPrice: 0,
      finalPrice: 0,
      isAllVariationOutOfStock: false,
    };
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should decrement quantity to 4', () => {
    fixture.detectChanges();
    const plusBtn = fixture.debugElement.queryAll(By.css('.pack-qty-btn'))[0];
    plusBtn.triggerEventHandler('click', {});
    fixture.detectChanges();

    const quantityElement = fixture.debugElement.query(
      By.css('.text-center.qty-width.p-small.font-bold')
    );

    expect(component.productQuantity).toEqual(
      parseInt(quantityElement.nativeElement.innerText)
    );
  });

  it('should select `every-month` delivery option', () => {
    fixture.detectChanges();
    const hostElement: HTMLElement = fixture.nativeElement;

    const deliveryInputs: NodeListOf<HTMLInputElement> =
      hostElement.querySelectorAll('input[name=delivery]');

    const everyMonthSelection = deliveryInputs[deliveryInputs.length - 1];

    expect(everyMonthSelection.checked).toBeTrue();
  });

  it('should change select `one-time` delivery option', () => {
    fixture.detectChanges();
    const hostElement: HTMLElement = fixture.nativeElement;

    const deliveryInputs: NodeListOf<HTMLInputElement> =
      hostElement.querySelectorAll('input[name=delivery]');

    const oneTimeSelection = deliveryInputs[0];

    oneTimeSelection.click();

    expect(component.selectedOrdertype).toBe('ordertype_1');
  });

  it('should navigate to challenge pack page', () => {
    fixture.detectChanges();

    const de = fixture.debugElement.query(
      By.css('.sk-product__title.color-black')
    );

    expect(de.nativeElement.innerText).toEqual('Challenge pack');
  });

  it('should test behavioursubject country change', () => {
    dataService.changeSelectedCountry('CA');
    fixture.detectChanges();
    expect(component.country).toEqual('CA');
  });
});
