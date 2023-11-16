import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';
import { NewgenApiService } from '../../shared/services/newgen-api.service';
import { UserEmitterService } from '../../shared/services/user-emitter.service';
declare var $: any;
@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public orderHistory: Array<any> = [];
  public user: any;
  public pendingPaymentOrders: Array<any> = [];
  public loader: boolean = false;
  public hideTitle: boolean = true;
  public newgenPath = environment.newgenUrl;
  public scheduleCount!: number;
  public loaderHistory: boolean = false;
  public loaderPending: boolean = false;
  public scheduleLoaded: boolean = false;
  public tenant!: string;
  constructor(
    private newgenSvc: NewgenApiService,
    private userEmitterService: UserEmitterService,
    private dataService: AppDataService,
    private router: Router
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
      this.getCartPendingPayment(this.user.id);
    });
    this.getAutoshipHistory();
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
      },
        err => {
          this.loaderHistory = false;
        });
  }

  getAutoshipHistory() {
    this.loaderHistory = true;
    this.newgenSvc.getAutoshipHistory('false', 10, 0).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if(x?.isSuccess) {
        this.orderHistory = x.collection;
      }
      this.loaderHistory = false;
    },
      err => {
        this.loaderHistory = false;
      })
  }

  getCartPendingPayment(id: string) {
    this.loaderPending = true;
    this.newgenSvc
      .cartPendingPaymentGet(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.pendingPaymentOrders = x.collection;
        this.loaderPending = false;
      },
        err => {
          this.loaderPending = false;
        });
  }

  printReceipt(invoice: string) {
    window.open(this.newgenPath + '#/invoice/' + invoice + '?userId=' + this.user.id, "_blank");
  }

  pay(cartId: number) {
    window.open(environment.userURL + '#/checkout?cart_id=' + cartId, '_blank');
  }

  getScheduleCount($event: any) {
    this.scheduleCount = $event;
    this.scheduleLoaded = true;
  }

  updateProducts(order: any) {
    $('#smartShipModal').modal('hide');
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: { key: 'bundleBuilder', value: {autoshipOrder: order, modalTitle: ''} },
    });
    $('#bundleBuilderModal').modal('show');
  }

  onClickLearnMore() {
    this.router.navigate(['/smartship/about']);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
