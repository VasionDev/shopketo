import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { BillingAddress } from '../models/billingAddress';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var $: any;
@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css']
})
export class AddressesComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public addresses!: Array<any>;
  public confirmShow: boolean = false;
  public address: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '0',
    country: '0',
    save: true
  };
  public confirmedAddresses!: Array<any>;
  public confirmAddres!: BillingAddress;
  public deleteAddressProfileId!: number;
  public deleteSelectedAddressProfile!: string;
  public regions: Array<any> = [];
  public loadDelete: boolean = false;
  @ViewChild('zipInput', { static: false, read: ElementRef })
  public zipInp!: ElementRef;
  public loader: boolean = false;
  public loaderAddress: boolean = false;
  public loaderVerify: boolean = false;
  public loaderProfile: boolean = false;
  public selectedAddress: boolean = false;
  public loadingDefault: boolean = false;
  public activeAutoships: Array<any> = [];
  public autoships: Array<number> = [];
  public selectedAutoship!: number;
  constructor(private newgenSvc: NewgenApiService) { }

  ngOnInit(): void {
    this.getAddresses();
    this.getState();
  }

  getAddresses() {
    this.loaderAddress = true;
    this.newgenSvc.getAddresses('false', 10, 0).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.addresses = x.collection;
      this.addresses = [...this.addresses];
      this.getAutoships();
      this.loaderAddress = false;
    },
      err => {
        this.loaderAddress = false;
      })
  }
  verifyAddress() {
    this.loaderVerify = true;
    this.confirmShow = true;
    this.confirmAddres
    this.newgenSvc.verifyAddress(this.address).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.confirmedAddresses = x.collection;
      this.loaderVerify = false;
      this.selectedAddress = false;
    },
      err => {
        this.loaderVerify = false;
      })
  }

  getState() {
    this.loader = true;
    this.newgenSvc.getCollection(8).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.regions = x.collection;
      this.loader = false;
      this.address = {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        postalCode: '',
        region: '0',
        country: '0',
        save: true
      }
      this.autoships = [];
    },
      err => {
        this.loader = false;
      })
  }

  deleteAddressProfile(address: any) {
    this.deleteAddressProfileId = address.id;
    this.deleteSelectedAddressProfile = address.name
  }

  confirmDelete() {
    this.loadDelete = true;
    this.newgenSvc.deleteAddressProfile(this.deleteAddressProfileId).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $('#deleteAddressModal').modal('hide');
      this.getAddresses();
      this.loadDelete = false;
      this.deleteSelectedAddressProfile = '';
    },
      err => {
        this.loadDelete = false;
      })
  }

  selectAddress(x: any, isSelected: boolean) {
    if (isSelected) {
      this.confirmAddres = this.address;
      this.confirmAddres.save = true;
      this.selectedAddress = true;
      return;
    }
    this.confirmAddres = x;
    this.confirmAddres.save = true;
    this.selectedAddress = true;
  }

  createAddressProfile() {
    this.loaderProfile = true;
    if (this.autoships.length > 0) {
      this.confirmAddres.updateAutoshipIds = this.autoships;
    }
    this.newgenSvc.createAddressProfile(this.confirmAddres).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $('#confirmAddressModal').modal('hide');
      $('#newAddressModal').modal('hide');
      this.getAddresses();
      this.loaderProfile = false;
      this.confirmAddres.updateAutoshipIds = [];
      this.selectedAutoship = 0;
    },
      err => {
        this.loaderProfile = false;
      })
  }

  getAutoships() {
    this.newgenSvc.getActiveAutoships().subscribe(x => {
      this.activeAutoships = x.collection.filter((y: any) => y.catalogTypeCode == 'sunbasket' || y.catalogTypeCode == 'smartOrder')

    })
  }

  setAsDefault(id: number) {
    this.loadingDefault = true;
    this.newgenSvc.setAsDefault(id).subscribe(x => {
      this.getAddresses();
      this.loadingDefault = false;
    },
      err => {
        this.loadingDefault = false;
      })
  }

  addAutoship(id: number) {
    if (this.selectedAutoship == id)
      return;
    this.selectedAutoship = id;
    let index = this.autoships.indexOf(id);
    if (index !== -1) {
      this.autoships.splice(index, 1)
      if (this.autoships.length == 0) {
        this.selectedAutoship = 0;
      }
    }
    else {
      this.autoships.push(id);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
