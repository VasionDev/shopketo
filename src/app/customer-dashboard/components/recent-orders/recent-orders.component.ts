import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'recent-orders',
  templateUrl: './recent-orders.component.html',
  styleUrls: ['./recent-orders.component.css']
})
export class RecentOrdersComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public loaderHistory: boolean = false;
  public orderHistory: Array<any> = [];
  public newgenPath = environment.newgenUrl;
  public tenant!: string;
  public orderId!: number;
  public loading: boolean = false;
  @Input('isOrderSuccess')
  public isOrderSuccess: boolean = false;
  constructor(private newgenSvc: NewgenApiService, private userEmitterService: UserEmitterService) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    if (!this.isOrderSuccess) {
      this.getOrderHistory(1, 0);
    } else {
      this.getOrderHistorySuccessPage(2, 0)
    }

    this.userEmitterService.getProfileObs().pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.user = x;
    });
  }

  getOrderHistory(pageSize: number, startIndex: number) {
    this.loaderHistory = true;
    this.newgenSvc
      .getOrderHistory(
        'false',
        pageSize,
        startIndex,
        '{"and":[{"ne":["payStatus","1"]}]}'
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.orderHistory = x.collection;
        this.loaderHistory = false;

      });
  }

  getOrderHistorySuccessPage(pageSize: number, startIndex: number) {
    this.loaderHistory = true;
    this.newgenSvc
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
        this.loaderHistory = false;
        $('body').tooltip({ selector: '[data-toggle="tooltip"]' });
      });
  }

  printReceipt(invoice: string) {
    window.open(this.newgenPath + '#/invoice/' + invoice + '?userId=' + this.user.id, "_blank");
  }

  showCancelationPop(orderId: number, cancelStatus: number) {
    if (cancelStatus == 1) {
      return;
    } else {
      this.orderId = 0;
      this.orderId = orderId;
      $('#cancelationModal').modal('show');
    }

  }

  requestCancel() {
    this.loading = true;
    this.newgenSvc.requestCancel(this.orderId, this.user.id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $('#cancelationModal').modal('hide');
      this.loading = false;
      this.getOrderHistory(1, 0);
    })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
