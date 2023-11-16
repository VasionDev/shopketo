import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BillingAddress } from '../../../models/billingAddress';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { AddressEmitterService } from '../../../services/address-emitter.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tw-address',
  templateUrl: './tw-address.component.html',
  styleUrls: ['./tw-address.component.css']
})
export class TwAddressComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public billingAddress: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '',
    country: '',
    isValidZip: true
  }
  public citys: Array<any> = [];
  public districts: Array<any> = [];
  public postals: Array<any> = [];
  public confirmedAddresses: Array<any> = []
  public selectedPostal: string = '';
  public selectedCityNumber: string = '';
  public selectedDistrictNumber: string = '';
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
    this.getCitys();
  }

  verifyAddress() {
    this.addressSent.emit(this.billingAddress)
    this.confirmShow = true;
  }

  getCitys() {
    this.loader = true;
    this.newgenSvc.getCollection(2).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.citys = x.collection;
      this.loader = false;
    })
  }

  public getDistrict(number: number) {
    this.newgenSvc.getCollection(number).subscribe(x => {
      this.districts = x.collection;
    });
  }

  public getPostals(number: number) {
    this.newgenSvc.getCollection(number).subscribe(x => {
      this.postals = x.collection;
    });
  }

  public onSelectCity($event: any) {
    this.getDistrict($event.target.value);
    this.billingAddress.city = $event.target.options[$event.target.options.selectedIndex].text;
  }

  public onSelectDistrict($event: any) {
    this.getPostals($event.target.value);
    this.billingAddress.region = $event.target.options[$event.target.options.selectedIndex].text;
  }

  public onSelectPostal($event: any) {
    this.billingAddress.postalCode = $event.target.options[$event.target.options.selectedIndex].text;
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
