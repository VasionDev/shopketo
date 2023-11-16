import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BillingAddress } from '../../../models/billingAddress';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { AddressEmitterService } from '../../../services/address-emitter.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-mo-address',
  templateUrl: './mo-address.component.html',
  styleUrls: ['./mo-address.component.css']
})
export class MoAddressComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public billingAddress: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '-',
    postalCode: '-',
    region: '',
    country: '',
    isValidZip: true
  }
  public districts: Array<any> = [];
  public regions: Array<any> = [];
  public confirmedAddresses: Array<any> = []
  public selectedState: string = '';
  public selectedDistrictNumber: string = '';
  public loader: boolean = false;
  @Input('country')
  public country: string = '';
  @Input('showFooter')
  public showFooter: boolean = true;
  @Input('hideCountry')
  public hideCountry: boolean = false;
  @Input('removePadding')
  public removePadding: boolean = false;
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
    this.newgenSvc.getCollection(29).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.regions = x.collection;
      this.loader = false;
    })
  }

  public onSelectProvince($event: any) {
    this.billingAddress.region = $event.target.options[$event.target.options.selectedIndex].text;
  }

  cancel() {
    this.hideForm.emit(true)
  }

  sendAddress() {
    this.addressEmitter.setAddress(this.billingAddress);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
