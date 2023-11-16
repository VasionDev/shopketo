import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { ThankYouYesComponent } from 'src/app/ladyboss-5daychallenge/components/thank-you-yes/thank-you-yes.component';
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
  public orderId!: number;
  public loadMoreButton: string = 'Older orders';
  public loading: boolean = false;
  public newgenPath = environment.newgenUrl;
  public tenant!: string;
  productSettings = {} as ProductSettings;
  constructor(
    private newgenService: NewgenApiService,
    private userEmitterService: UserEmitterService,
    private dataService: AppDataService
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.user = x;
      this.getCartPendingPayment(this.user.id);
    });
    this.getOrderHistory(this.pageSize, this.startIndex);
    this.getProductSettings();
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

  showCancelationPop(orderId: number, cancelStatus: number) {
    if (cancelStatus == 1) {
      return;
    } else {
      this.orderId = 0;
      this.orderId = orderId;
      $('#cancelationModal').modal('show');
    }

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
    window.open(this.newgenPath + '#/invoice/' + invoice + '?userId=' + this.user.id, "_blank");
  }

  requestCancel() {
    this.loading = true;
    this.newgenService.requestCancel(this.orderId, this.user.id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $('#cancelationModal').modal('hide');
      this.loading = false;
      this.getOrderHistory(this.pageSize, this.startIndex);
    })
  }

  getProductSettings() {
    this.dataService.currentProductsData$.pipe(takeUntil(this.destroyed$)).subscribe(data => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }
      this.productSettings = data.productSettings;
    })
  }

  onClickNewOrder() {
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: { key: 'bundleBuilder', value: { autoshipOrder: null, onetimeOrder: true, modalTitle: 'New order', modalDescription: 'VIP Points will be calculated and applied at checkout.' } },
    });
    $('#bundleBuilderModal').modal('show');
    return false;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
