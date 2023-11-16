import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppState } from 'src/app/store/app.reducer';
import { RemoveAllOneTime, RemoveAllEveryMonth } from 'src/app/sidebar/store/cart.actions';
import { Store } from '@ngrx/store';
import { AppDataService } from 'src/app/shared/services/app-data.service';

declare var $: any;
@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css'],
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public tenant!: string;
  public orderHistory: Array<any> = [];
  public pageSize: number = 2;
  public startIndex: number = 0;
  constructor(
    private userEmitterService: UserEmitterService,
    private newgenService: NewgenApiService,
    private dataService: AppDataService,
    private store: Store<AppState>,
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
      });
    this.getOrderHistory(this.pageSize, this.startIndex);
    window.localStorage.removeItem('isOrderSuccess');
    this.clearCart();
  }

  clearCart() {
    this.dataService.changeCartStatus(false);
    localStorage.removeItem('OneTime');
    localStorage.removeItem('EveryMonth');
    localStorage.removeItem('CartTime');

    this.store.dispatch(RemoveAllOneTime());
    this.store.dispatch(RemoveAllEveryMonth());
  }

  getOrderHistory(pageSize: number, startIndex: number) {
    // this.loader = true;
    this.newgenService
      .getOrderHistory('false', pageSize, startIndex)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        if (x.collection.length == 2) {
          if (x.collection[0].invoiceId == x.collection[1].invoiceId) {
            this.orderHistory = x.collection;
          }
          else {
            this.orderHistory = x.collection;
            this.orderHistory.pop();
          }
        } else {
          this.orderHistory = x.collection;
        }
        // this.loader = false;
        $('body').tooltip({ selector: '[data-toggle="tooltip"]' });
      });
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
