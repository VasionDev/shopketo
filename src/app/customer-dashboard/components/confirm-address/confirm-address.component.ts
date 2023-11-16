import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BillingAddress } from '../../models/billingAddress';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-confirm-address',
  templateUrl: './confirm-address.component.html',
  styleUrls: ['./confirm-address.component.css']
})
export class ConfirmAddressComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input('address')
  public address: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '',
    country: ''
  };
  public confirmedAddresses: Array<any> = []
  public loading: boolean = false;
  public loader: boolean = false;
  @Output() saveAddressId = new EventEmitter<number>();
  @Output() hideConfirm = new EventEmitter<boolean>();
  constructor(private newgenSvc: NewgenApiService) { }

  ngOnInit(): void {
    this.verifyAddress();
  }

  verifyAddress() {
    this.loader = true;
    this.newgenSvc.verifyAddress(this.address).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.confirmedAddresses = x.collection;
      this.loader = false;
    })
  }

  selectAddress(x: any, isSelected: boolean) {
    if (isSelected) {
      this.address = x;
      return;
    }
    this.address = x;
  }

  createAddressProfile() {
    this.address.save = true;
    this.loading = true;
    this.newgenSvc.createAddressProfile(this.address).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.saveAddressId.emit(x.collection[0].id)
    })
  }

  cancel() {
    this.hideConfirm.emit(true)
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
