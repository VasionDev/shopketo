import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ProductCardService } from 'src/app/products/services/product-card.service';
import { ProductsFormService } from 'src/app/products/services/products-form.service';
import { ProductsTagAndCategoryService } from 'src/app/products/services/products-tag-and-category.service';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { activatedRouteStub } from 'src/test/services/activated-route-mock';
import { AppDataServiceStub } from 'src/test/services/app-data-service-mock';
import { AppUserServiceStub } from 'src/test/services/app-user-service-mock';
import { AppUtilityServiceStub } from 'src/test/services/app-utility-service-mock';
import { HeaderComponent } from './header.component';

fdescribe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  class FakeLoader implements TranslateLoader {
    getTranslation(): Observable<any> {
      return of({});
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      declarations: [HeaderComponent],
      providers: [
        provideMockStore(),
        ProductsUtilityService,
        AppOfferService,
        ProductCardService,
        ProductsFormService,
        ProductsTagAndCategoryService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AppUserService, useClass: AppUserServiceStub },
        { provide: AppUtilityService, useClass: AppUtilityServiceStub },
        { provide: AppDataService, useClass: AppDataServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
