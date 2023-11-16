import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BillingAddress } from '../../../models/billingAddress';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { AddressEmitterService } from '../../../services/address-emitter.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cn-address',
  templateUrl: './cn-address.component.html',
  styleUrls: ['./cn-address.component.css']
})
export class CnAddressComponent implements OnInit, OnDestroy {

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
  public citys: Array<any> = [];
  public districts: Array<any> = [];
  public regions: Array<any> = [];
  public confirmedAddresses: Array<any> = []
  public selectedState: string = '';
  public selectedCityNumber: string = '';
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
    this.newgenSvc.getCollection(24).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.regions = x.collection;
      this.loader = false;
    })
  }

  public getCity(number: number) {
    this.newgenSvc.getCollection(number).subscribe(x => {
      this.citys = x.collection;
    });
  }

  public getDistrict(number: number) {
    this.newgenSvc.getCollection(number).subscribe(x => {
      this.districts = x.collection;
    });
  }

  public onSelectProvince($event: any) {
    this.getCity($event.target.value);
    this.billingAddress.region = $event.target.options[$event.target.options.selectedIndex].text;
  }

  public onSelectCity($event: any) {
    this.getDistrict($event.target.value);
    this.billingAddress.city = $event.target.options[$event.target.options.selectedIndex].text;
  }

  public onSelectDistrict($event: any) {
    this.billingAddress.addressLine3 = $event.target.options[$event.target.options.selectedIndex].text;
  }

  cancel() {
    this.hideForm.emit(true)
  }

  checkPost() {
    this.billingAddress.postalCode = this.billingAddress.postalCode.split(' ').join('');
  }

  toUppercase() {
    this.billingAddress.postalCode = this.billingAddress.postalCode.toUpperCase();
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
