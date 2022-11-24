import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { ProductCardService } from './product-card.service';

import { ProductsApiService } from './products-api.service';
import { ProductsFormService } from './products-form.service';
import { ProductsTagAndCategoryService } from './products-tag-and-category.service';
import { ProductsUtilityService } from './products-utility.service';

class AppUtilityServiceStub {
  everyMonth() {
    return of();
  }

  oneTime() {
    return of();
  }

  checkoutFoods() {}
}
class AppUserServiceStub {
  everyMonth() {
    return of();
  }

  oneTime() {
    return of();
  }

  checkoutFoods() {}
}

fdescribe('ProductsApiService', () => {
  let service: ProductsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        provideMockStore(),
        ProductsApiService,
        ProductsFormService,
        ProductsTagAndCategoryService,
        ProductsUtilityService,
        ProductCardService,
        AppOfferService,
        { provide: AppUserService, useClass: AppUserServiceStub },
        { provide: AppUtilityService, useClass: AppUtilityServiceStub },
      ],
    });
    service = TestBed.inject(ProductsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
