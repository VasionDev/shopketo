import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css'],
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public orderHistory: Array<any> = [];
  public pageSize: number = 1;
  public startIndex: number = 0;
  constructor(
    private userEmitterService: UserEmitterService,
    private newgenService: NewgenApiService
  ) {}

  ngOnInit(): void {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
      });
    this.getOrderHistory(this.pageSize, this.startIndex);
    window.localStorage.removeItem('isOrderSuccess');
  }

  getOrderHistory(pageSize: number, startIndex: number) {
    // this.loader = true;
    this.newgenService
      .getOrderHistory('false', pageSize, startIndex)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.orderHistory = x.collection;
        // this.loader = false;
        $('body').tooltip({ selector: '[data-toggle="tooltip"]' });
      });
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
