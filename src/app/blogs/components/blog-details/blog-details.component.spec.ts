import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { doesNotReject } from 'assert';
import { Observable, of } from 'rxjs';
import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { QuickAddMenus } from 'src/app/foods/models/food-quickadd-menus.model';
import { ProductCardService } from 'src/app/products/services/product-card.service';
import { ProductsApiService } from 'src/app/products/services/products-api.service';
import { ProductsFormService } from 'src/app/products/services/products-form.service';
import { ProductsTagAndCategoryService } from 'src/app/products/services/products-tag-and-category.service';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { TextSanitizerPipe } from 'src/app/shared/pipes/text-sanitizer.pipe';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { BlogApiServiceStub } from 'src/test/services/blog-api-service-mock';
import { BlogApiService } from '../../services/blog-api.service';
import { BlogState } from '../../store/blogs.reducer';

import { BlogDetailsComponent } from './blog-details.component';

const initialState = {
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
  blogs: {
    blogsList: {
      id: 1,
      title: 'test',
      description: [],
      content: 'test',
      imageUrl: 'sfa',
      slug: 'res',
      authorId: 'sa',
      categoryIds: [],
      tags: [],
    },
  },
};

fdescribe('BlogDetailsComponent', () => {
  let component: BlogDetailsComponent;
  let fixture: ComponentFixture<BlogDetailsComponent>;
  let blogApiService: BlogApiService;
  let httpClient: HttpClient;
  let fetchData: any;
  let fetchList: any;

  const fakeActivatedRoute = {
    snapshot: { data: {} },
    queryParamMap: of({
      get() {
        return 'challenge-pack';
      },
    }),
    params: of({ id: 'challenge-pack' }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [BlogDetailsComponent, TextSanitizerPipe],
      providers: [
        Renderer2,
        ProductsApiService,
        ProductsFormService,
        ProductsTagAndCategoryService,
        ProductsUtilityService,
        ProductCardService,
        AppOfferService,
        provideMockStore({ initialState }),
        AppDataService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: BlogApiService, useClass: BlogApiServiceStub },
        AppUtilityService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogDetailsComponent);
    blogApiService = TestBed.inject(BlogApiService);
    httpClient = TestBed.inject(HttpClient);

    fetchData = jasmine.createSpy('fetchData');
    fetchData('some dummy data');

    fetchList = jasmine.createSpyObj('fetchList', ['add', 'remove', 'update']);
    fetchList.add(1);
    fetchList.remove();
    fetchList.update();

    component = fixture.componentInstance;
    component.blog = {
      id: 1,
      title: 'test',
      description: [],
      content: 'test',
      imageUrl: 'sfa',
      slug: 'res',
      authorId: 1,
      categoryIds: [],
      tags: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return `Thank you` message after form submit', () => {
    component.commentForm.controls['authorName'].setValue('abc');
    component.commentForm.controls['authorEmail'].setValue('abc@acb.com');
    component.commentForm.controls['authorResponse'].setValue('test');

    const postCommentSpy = spyOn(blogApiService, 'postComment').and.returnValue(
      of({})
    );

    component.onSubmitComment();

    expect(component.commentSuccessMessage).toEqual(
      'Thank you, your comment has been submitted for approval.'
    );

    expect(postCommentSpy).toHaveBeenCalled();
  });

  it('should create spy', () => {
    expect(fetchData).toBeDefined();
    expect(fetchList.add).toBeDefined();
    expect(fetchList.remove).toBeDefined();
    expect(fetchList.update).toBeDefined();
  });

  it('should be called', () => {
    expect(fetchData).toHaveBeenCalledWith('some dummy data');
    expect(fetchList.add).toHaveBeenCalledWith(1);
    expect(fetchList.remove).toHaveBeenCalled();
    expect(fetchList.update).toHaveBeenCalled();
  });

  it('should be called once', () => {
    expect(fetchData.calls.count()).toBe(1);
    expect(fetchList.add.calls.count()).toBe(1);
    expect(fetchList.remove.calls.count()).toBe(1);
    expect(fetchList.update.calls.count()).toBe(1);
  });

  it('should check authorName is invalid, then valid when entering some characters', () => {
    const authorName = component.commentForm.controls['authorName'];

    expect(authorName.valid).toBeFalse();
    expect(authorName.pristine).toBeTrue();
    if (authorName.errors) expect(authorName.errors['required']).toBeTrue();

    authorName.setValue('ABC');

    expect(authorName.errors).toBeNull();
  });

  it('should check email is valid or not', () => {
    const authorEmail = component.commentForm.controls['authorEmail'];

    expect(authorEmail.valid).toBeFalse();
    if (authorEmail.errors) expect(authorEmail.errors['required']).toBeTrue();

    authorEmail.setValue('abc');
    if (authorEmail.errors)
      expect(authorEmail.errors['pattern'].actualValue).not.toMatch(
        authorEmail.errors['pattern'].requiredPattern
      );

    authorEmail.setValue('abc@das.com');
    expect(authorEmail.errors).toBeNull();
  });

  it('should check commentForm is invalid and submit button disabled', () => {
    component.isInputFocused = true;
    component.commentSuccessMessage = '';
    fixture.detectChanges();

    expect(component.commentForm.invalid).toBeTrue();

    fixture.whenStable().then(() => {
      const btn = fixture.debugElement.query(By.css('button[type=submit]'));

      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  it('should check commentForm is valid and submit button enabled', () => {
    component.isInputFocused = true;
    component.commentSuccessMessage = '';
    fixture.detectChanges();

    component.commentForm.controls['authorName'].setValue('abc');
    component.commentForm.controls['authorEmail'].setValue('abc@acb.com');
    component.commentForm.controls['authorResponse'].setValue('test');
    expect(component.commentForm.valid).toBeTrue();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const btn = fixture.debugElement.query(By.css('button[type=submit]'));

      expect(btn.nativeElement.disabled).toBeFalse();
    });
  });
});
