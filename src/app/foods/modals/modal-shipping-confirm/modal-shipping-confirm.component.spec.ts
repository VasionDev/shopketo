import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { cold, hot } from 'jasmine-marbles';
import { ToastrModule } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { FoodApiServiceStub } from 'src/test/services/food-api-service-mock';
import { FakeTranslateLoader } from 'src/test/services/translate-loader-mock';
import { FoodApiService } from '../../services/food-api.service';
import {
  UpdateNextShipmentStartActon,
  UpdateNextShipmentStatusActon,
} from '../../store/foods-list.actions';
import { FoodsListEffects } from '../../store/foods-list.effects';

import { ModalShippingConfirmComponent } from './modal-shipping-confirm.component';

fdescribe('ModalShippingConfirmComponent', () => {
  let component: ModalShippingConfirmComponent;
  let fixture: ComponentFixture<ModalShippingConfirmComponent>;

  let actions$: Observable<Action>;
  let effects: FoodsListEffects;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-center',
        }),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      declarations: [ModalShippingConfirmComponent],
      providers: [
        provideMockStore(),
        provideMockActions(() => actions$),
        FoodsListEffects,
        { provide: FoodApiService, useClass: FoodApiServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingConfirmComponent);
    component = fixture.componentInstance;

    effects = TestBed.inject(FoodsListEffects);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test update shipment effect when response isSuccess returns false', () => {
    actions$ = hot('-a', {
      a: new UpdateNextShipmentStartActon({
        autoshipId: 1,
        tokenType: 'test',
        accessToken: 'test token',
        nextRun: 'test',
      }),
    });

    const foodApiService = fixture.debugElement.injector.get(FoodApiService);

    const nextRunSpy = spyOn(foodApiService, 'setNextRunDate').and.returnValue(
      cold('-a|', { a: { isSuccess: false } })
    );

    const expected = hot('--a', {
      a: new UpdateNextShipmentStatusActon(false),
    });

    expect(effects.updateAutoship$).toBeObservable(expected);

    expect(nextRunSpy).toHaveBeenCalled();
  });

  it('should test update shipment effect when response isSuccess returns true', () => {
    actions$ = hot('--a', {
      a: new UpdateNextShipmentStartActon({
        autoshipId: 1,
        tokenType: 'test',
        accessToken: 'test token',
        nextRun: 'test',
      }),
    });

    const foodApiService = fixture.debugElement.injector.get(FoodApiService);

    const nextRunSpy = spyOn(foodApiService, 'setNextRunDate').and.returnValue(
      cold('-a|', { a: { isSuccess: true } })
    );

    const expected = hot('---a', {
      a: new UpdateNextShipmentStatusActon(true),
    });

    expect(effects.updateAutoship$).toBeObservable(expected);

    expect(nextRunSpy).toHaveBeenCalled();
  });

  it('should test update shipment effect when response returns error', () => {
    actions$ = hot('--a', {
      a: new UpdateNextShipmentStartActon({
        autoshipId: 1,
        tokenType: 'test',
        accessToken: 'test token',
        nextRun: 'test',
      }),
    });

    const foodApiService = fixture.debugElement.injector.get(FoodApiService);

    const nextRunSpy = spyOn(foodApiService, 'setNextRunDate').and.returnValue(
      cold('-a-#', {}, new Error('Failed'))
    );

    // -a ignored because no value emitted
    const expected = hot(
      '---a',
      {
        a: new UpdateNextShipmentStatusActon(false),
      },
      new Error('Failed')
    );

    expect(effects.updateAutoship$).toBeObservable(expected);

    expect(nextRunSpy).toHaveBeenCalled();
  });
});
