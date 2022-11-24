import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FoodTypes } from './foods-list.actions';
import * as foodsActions from './foods-list.actions';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { FoodApiService } from '../services/food-api.service';

@Injectable()
export class FoodsListEffects {
  constructor(
    private actions$: Actions,
    private toastr: ToastrService,
    private foodApiService: FoodApiService
  ) {}

  updateAutoship$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(FoodTypes.UPDATE_NEXT_SHIPMENT_START),
      switchMap(
        (
          nextShipmentStartAction: foodsActions.UpdateNextShipmentStartActon
        ) => {
          const { autoshipId, accessToken, nextRun, tokenType } =
            nextShipmentStartAction.payload;

          return this.foodApiService
            .setNextRunDate(autoshipId, tokenType, accessToken, nextRun)
            .pipe(
              map((res) => {
                if (res.isSuccess) {
                  this.toastr.success('Shipping date change saved');

                  return new foodsActions.UpdateNextShipmentStatusActon(true);
                } else {
                  this.toastr.error(
                    'Shipping date could not be set. Try again later.'
                  );

                  return new foodsActions.UpdateNextShipmentStatusActon(false);
                }
              }),
              catchError(() => {
                this.toastr.error(
                  'Shipping date could not be set. Try again later.'
                );

                return of(
                  new foodsActions.UpdateNextShipmentStatusActon(false)
                );
              })
            );
        }
      )
    );
  });
}
