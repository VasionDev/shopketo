import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { BillingAddress } from '../models/billingAddress';
import { AddressEmitterService } from '../services/address-emitter.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppUtilityService } from '../../shared/services/app-utility.service';
import { UsAddressComponent } from '../components/country-addresses/us-address/us-address.component';
import { AlAddressComponent } from '../components/country-addresses/al-address/al-address.component';
import { AtAddressComponent } from '../components/country-addresses/at-address/at-address.component';
import { AuAddressComponent } from '../components/country-addresses/au-address/au-address.component';
import { BeAddressComponent } from '../components/country-addresses/be-address/be-address.component';
import { BgAddressComponent } from '../components/country-addresses/bg-address/bg-address.component';
import { CaAddressComponent } from '../components/country-addresses/ca-address/ca-address.component';
import { ChAddressComponent } from '../components/country-addresses/ch-address/ch-address.component';
import { CnAddressComponent } from '../components/country-addresses/cn-address/cn-address.component';
import { CyAddressComponent } from '../components/country-addresses/cy-address/cy-address.component';
import { CzAddressComponent } from '../components/country-addresses/cz-address/cz-address.component';
import { DeAddressComponent } from '../components/country-addresses/de-address/de-address.component';
import { DkAddressComponent } from '../components/country-addresses/dk-address/dk-address.component';
import { EeAddressComponent } from '../components/country-addresses/ee-address/ee-address.component';
import { EsAddressComponent } from '../components/country-addresses/es-address/es-address.component';
import { FiAddressComponent } from '../components/country-addresses/fi-address/fi-address.component';
import { FrAddressComponent } from '../components/country-addresses/fr-address/fr-address.component';
import { GbAddressComponent } from '../components/country-addresses/gb-address/gb-address.component';
import { GrAddressComponent } from '../components/country-addresses/gr-address/gr-address.component';
import { HrAddressComponent } from '../components/country-addresses/hr-address/hr-address.component';
import { HuAddressComponent } from '../components/country-addresses/hu-address/hu-address.component';
import { IeAddressComponent } from '../components/country-addresses/ie-address/ie-address.component';
import { ItAddressComponent } from '../components/country-addresses/it-address/it-address.component';
import { LtAddressComponent } from '../components/country-addresses/lt-address/lt-address.component';
import { LuAddressComponent } from '../components/country-addresses/lu-address/lu-address.component';
import { LvAddressComponent } from '../components/country-addresses/lv-address/lv-address.component';
import { MtAddressComponent } from '../components/country-addresses/mt-address/mt-address.component';
import { MxAddressComponent } from '../components/country-addresses/mx-address/mx-address.component';
import { NlAddressComponent } from '../components/country-addresses/nl-address/nl-address.component';
import { NzAddressComponent } from '../components/country-addresses/nz-address/nz-address.component';
import { PlAddressComponent } from '../components/country-addresses/pl-address/pl-address.component';
import { PtAddressComponent } from '../components/country-addresses/pt-address/pt-address.component';
import { RoAddressComponent } from '../components/country-addresses/ro-address/ro-address.component';
import { SeAddressComponent } from '../components/country-addresses/se-address/se-address.component';
import { SiAddressComponent } from '../components/country-addresses/si-address/si-address.component';
import { SkAddressComponent } from '../components/country-addresses/sk-address/sk-address.component';
import { HkAddressComponent } from '../components/country-addresses/hk-address/hk-address.component';
import { MoAddressComponent } from '../components/country-addresses/mo-address/mo-address.component';
import { MyAddressComponent } from '../components/country-addresses/my-address/my-address.component';
import { SgAddressComponent } from '../components/country-addresses/sg-address/sg-address.component';
import { TwAddressComponent } from '../components/country-addresses/tw-address/tw-address.component';
import { JpAddressComponent } from '../components/country-addresses/jp-address/jp-address.component';
declare var $: any;
@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css']
})
export class AddressesComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('addresscontainer', { read: ViewContainerRef })
  addresscontainer!: ViewContainerRef;
  public addresses: Array<any> = [];
  public confirmShow: boolean = false;
  public componentRef!: any;
  public addressComponentArray: Array<any> = [
    { country: 'al', component: AlAddressComponent },
    { country: 'at', component: AtAddressComponent },
    { country: 'au', component: AuAddressComponent },
    { country: 'be', component: BeAddressComponent },
    { country: 'bg', component: BgAddressComponent },
    { country: 'ca', component: CaAddressComponent },
    { country: 'ch', component: ChAddressComponent },
    { country: 'cn', component: CnAddressComponent },
    { country: 'cy', component: CyAddressComponent },
    { country: 'cz', component: CzAddressComponent },
    { country: 'de', component: DeAddressComponent },
    { country: 'dk', component: DkAddressComponent },
    { country: 'ee', component: EeAddressComponent },
    { country: 'es', component: EsAddressComponent },
    { country: 'fi', component: FiAddressComponent },
    { country: 'fr', component: FrAddressComponent },
    { country: 'gb', component: GbAddressComponent },
    { country: 'gr', component: GrAddressComponent },
    { country: 'hr', component: HrAddressComponent },
    { country: 'hu', component: HuAddressComponent },
    { country: 'ie', component: IeAddressComponent },
    { country: 'it', component: ItAddressComponent },
    { country: 'lt', component: LtAddressComponent },
    { country: 'lu', component: LuAddressComponent },
    { country: 'lv', component: LvAddressComponent },
    { country: 'mt', component: MtAddressComponent },
    { country: 'mx', component: MxAddressComponent },
    { country: 'nl', component: NlAddressComponent },
    { country: 'nz', component: NzAddressComponent },
    { country: 'pl', component: PlAddressComponent },
    { country: 'pt', component: PtAddressComponent },
    { country: 'ro', component: RoAddressComponent },
    { country: 'se', component: SeAddressComponent },
    { country: 'si', component: SiAddressComponent },
    { country: 'sk', component: SkAddressComponent },
    { country: 'us', component: UsAddressComponent },
    { country: 'hk', component: HkAddressComponent },
    { country: 'mo', component: MoAddressComponent },
    { country: 'my', component: MyAddressComponent },
    { country: 'sg', component: SgAddressComponent },
    { country: 'tw', component: TwAddressComponent },
    { country: 'jp', component: JpAddressComponent }
  ]
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
  public tenant: string = '';
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
  public addressSaved: boolean = false;
  public addressDeleted: boolean = false;
  public isStaging: boolean = false;
  public isOpened: boolean = false;
  constructor(private changeDetectorRef: ChangeDetectorRef, private newgenSvc: NewgenApiService, private addressEmitter: AddressEmitterService, public utilityService: AppUtilityService) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getAddresses();
    this.addressEmitter.getAddress().subscribe(x => {
      this.address = x;
    })
    $('#impersonationModal').modal('show');
  }

  openPopup() {
    this.isOpened = true;
    this.confirmShow = false;
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
  }

  getAddresses() {
    this.loaderAddress = true;
    this.newgenSvc.getAddresses('false', 10, 0, 'date+desc').pipe(takeUntil(this.destroyed$)).subscribe(x => {
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

  closeConfirm() {
    this.confirmShow = false;
    this.changeDetectorRef.detectChanges();
    if (this.address.country) {
      if (this.componentRef) {
        let index = this.addresscontainer.indexOf(this.componentRef.hostView)
        if (index != -1) this.addresscontainer.remove(index)
      }
      let component = this.addressComponentArray.find(x => x.country == this.address.country)
      this.componentRef = this.addresscontainer.createComponent(component.component);
      this.componentRef.instance['hideCountry'] = true;
      this.componentRef.instance['country'] = this.address.country;
      this.componentRef.instance['showFooter'] = false;
    }
  }

  confirmDelete() {
    this.loadDelete = true;
    this.newgenSvc.deleteAddressProfile(this.deleteAddressProfileId).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $('#deleteAddressModal').modal('hide');
      this.addressDeleted = true;
      setTimeout(() => {
        this.addressDeleted = false;
      }, 3500);
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
      // $('#confirmAddressModal').modal('hide');
      $('#newAddressModal').modal('hide');
      this.isOpened = false;
      this.addressSaved = true;
      setTimeout(() => {
        this.addressSaved = false;
      }, 3500);
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

  onSelectCountry() {
    if (this.componentRef) {
      let index = this.addresscontainer.indexOf(this.componentRef.hostView)
      if (index != -1) this.addresscontainer.remove(index)
    }
    let component = this.addressComponentArray.find(x => x.country == this.address.country)
    this.componentRef = this.addresscontainer.createComponent(component.component);
    this.componentRef.instance['hideCountry'] = true;
    this.componentRef.instance['country'] = this.address.country;
    this.componentRef.instance['showFooter'] = false;
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
