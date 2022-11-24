import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public pageSize: number = 10;
  public startIndex: number = 0;
  public orderHistory: Array<any> = [];
  public pendingPaymentOrders: Array<any> = [];
  public loader: boolean = false;
  public loadMoreLoading: boolean = false;
  public loadMoreButton: string = 'Older orders';
  public newgenPath = environment.newgenUrl;
  constructor(
    private newgenService: NewgenApiService,
    private userEmitterService: UserEmitterService
  ) { }

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
      this.getCartPendingPayment(this.user.id);
    });
    this.getOrderHistory(this.pageSize, this.startIndex);
  }

  getOrderHistory(pageSize: number, startIndex: number) {
    this.loader = true;
    this.newgenService
      .getOrderHistory(
        'false',
        pageSize,
        startIndex,
        '{"and":[{"ne":["payStatus","1"]}]}'
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.orderHistory = x.collection;
        this.loader = false;

      });
  }

  getPendingPaymentOrders() {
    this.newgenService
      .getOrderHistory('false', 100, 0, '{"and":[{"eq":["payStatus","1"]}]}')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.pendingPaymentOrders = x.collection;
      });
  }

  loadMore() {
    this.startIndex += 10;
    this.loadMoreLoading = true;
    this.newgenService
      .getOrderHistory(
        'false',
        this.pageSize,
        this.startIndex,
        '{"and":[{"ne":["payStatus","1"]}]}'
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        if (x.collection.length == 0) {
          this.loadMoreButton = 'No more orders can be found';
          return;
        }
        if (x.collection.length < 10) {
          this.orderHistory = [...this.orderHistory, ...x.collection];
          this.loadMoreButton = 'No more orders can be found';
          this.loadMoreLoading = true;
        } else {
          this.orderHistory = [...this.orderHistory, ...x.collection];
          this.loadMoreLoading = false;
        }
      });
  }

  getCartPendingPayment(id: string) {
    this.newgenService
      .cartPendingPaymentGet(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.pendingPaymentOrders = x.collection;
      });
  }

  pay(cartId: number) {
    window.open(environment.userURL + '#/checkout?cart_id=' + cartId, '_blank');
  }

  goToTracking(url: string) {
    window.open(url, '_blank');
  }

  printReceipt(invoice: string) {
    window.open(this.newgenPath + '#/invoice/' + invoice, "_blank");
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
