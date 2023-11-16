import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BillingAddress } from '../../../models/billingAddress';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { AddressEmitterService } from '../../../services/address-emitter.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-us-address',
  templateUrl: './us-address.component.html',
  styleUrls: ['./us-address.component.css']
})
export class UsAddressComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public billingAddress: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '',
    country: '',
    isValidZip: false
  }

  public regions: Array<any> = [];
  public confirmedAddresses: Array<any> = []
  public loader: boolean = false;
  @Input('country')
  public country: string = '';
  @Input('showFooter')
  public showFooter: boolean = true;
  @Input('removePadding')
  public removePadding: boolean = false;
  @Input('hideCountry')
  public hideCountry: boolean = false;
  @Input('confirmShow')
  public confirmShow: boolean = false;
  @Output() addressSent = new EventEmitter<BillingAddress>();
  @Output() hideForm = new EventEmitter<boolean>();
  @ViewChild('zipInput', { static: false, read: ElementRef })
  public zipInp!: ElementRef;

  constructor(private newgenSvc: NewgenApiService, private addressEmitter: AddressEmitterService) { }

  ngOnInit(): void {
    this.billingAddress.country = this.country;
    this.getState();
  }

  verifyAddress() {
    this.addressSent.emit(this.billingAddress)
    this.confirmShow = true;
  }

  getState() {
    this.loader = true;
    this.newgenSvc.getCollection(8).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.regions = x.collection;
      this.loader = false;
    })
  }

  cancel() {
    this.hideForm.emit(true)
  }

  sendAddress() {
    if (!this.showFooter) {
      if (this.billingAddress.postalCode && this.billingAddress.postalCode.trim() !== '') {
        this.billingAddress.isValidZip = this.zipInp.nativeElement.validity.valid;
      }
      this.addressEmitter.setAddress(this.billingAddress);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
