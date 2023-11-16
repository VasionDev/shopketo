import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CartStatusService } from '../../services/cart-status.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'payment-status-banner',
  templateUrl: './payment-status-banner.component.html',
  styleUrls: ['./payment-status-banner.component.css']
})
export class PaymentStatusBannerComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input('statusInfo')
  public statusInfo: any;
  public isVisible: boolean = false;
  public loading: boolean = false;
  constructor(private cartStatusSvc: CartStatusService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['statusInfo'].currentValue ?.numberOfCartsInQueue && !changes['statusInfo'].currentValue ?.lastCartId) {
      this.isVisible = false;
    }
    else {
      this.isVisible = true;
    }

  }
  ngOnInit(): void { }

  dismiss() {
    this.loading = true;
    this.cartStatusSvc.cartStatusAcknowledge(this.statusInfo.lastUniqueKey).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.isVisible = false;
      this.loading = false;
    })
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
