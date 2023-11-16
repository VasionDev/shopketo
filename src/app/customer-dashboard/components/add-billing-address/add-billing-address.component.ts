import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef
} from '@angular/core';
import { BillingAddress } from '../../models/billingAddress';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UsAddressComponent } from '../country-addresses/us-address/us-address.component';
import { AlAddressComponent } from '../country-addresses/al-address/al-address.component';
import { AtAddressComponent } from '../country-addresses/at-address/at-address.component';
import { AuAddressComponent } from '../country-addresses/au-address/au-address.component';
import { BeAddressComponent } from '../country-addresses/be-address/be-address.component';
import { BgAddressComponent } from '../country-addresses/bg-address/bg-address.component';
import { CaAddressComponent } from '../country-addresses/ca-address/ca-address.component';
import { ChAddressComponent } from '../country-addresses/ch-address/ch-address.component';
import { CnAddressComponent } from '../country-addresses/cn-address/cn-address.component';
import { CyAddressComponent } from '../country-addresses/cy-address/cy-address.component';
import { CzAddressComponent } from '../country-addresses/cz-address/cz-address.component';
import { DeAddressComponent } from '../country-addresses/de-address/de-address.component';
import { DkAddressComponent } from '../country-addresses/dk-address/dk-address.component';
import { EeAddressComponent } from '../country-addresses/ee-address/ee-address.component';
import { EsAddressComponent } from '../country-addresses/es-address/es-address.component';
import { FiAddressComponent } from '../country-addresses/fi-address/fi-address.component';
import { FrAddressComponent } from '../country-addresses/fr-address/fr-address.component';
import { GbAddressComponent } from '../country-addresses/gb-address/gb-address.component';
import { GrAddressComponent } from '../country-addresses/gr-address/gr-address.component';
import { HrAddressComponent } from '../country-addresses/hr-address/hr-address.component';
import { HuAddressComponent } from '../country-addresses/hu-address/hu-address.component';
import { IeAddressComponent } from '../country-addresses/ie-address/ie-address.component';
import { ItAddressComponent } from '../country-addresses/it-address/it-address.component';
import { LtAddressComponent } from '../country-addresses/lt-address/lt-address.component';
import { LuAddressComponent } from '../country-addresses/lu-address/lu-address.component';
import { LvAddressComponent } from '../country-addresses/lv-address/lv-address.component';
import { MtAddressComponent } from '../country-addresses/mt-address/mt-address.component';
import { MxAddressComponent } from '../country-addresses/mx-address/mx-address.component';
import { NlAddressComponent } from '../country-addresses/nl-address/nl-address.component';
import { NzAddressComponent } from '../country-addresses/nz-address/nz-address.component';
import { PlAddressComponent } from '../country-addresses/pl-address/pl-address.component';
import { PtAddressComponent } from '../country-addresses/pt-address/pt-address.component';
import { RoAddressComponent } from '../country-addresses/ro-address/ro-address.component';
import { SeAddressComponent } from '../country-addresses/se-address/se-address.component';
import { SiAddressComponent } from '../country-addresses/si-address/si-address.component';
import { SkAddressComponent } from '../country-addresses/sk-address/sk-address.component';
import { HkAddressComponent } from '../country-addresses/hk-address/hk-address.component';
import { MoAddressComponent } from '../country-addresses/mo-address/mo-address.component';
import { MyAddressComponent } from '../country-addresses/my-address/my-address.component';
import { SgAddressComponent } from '../country-addresses/sg-address/sg-address.component';
import { TwAddressComponent } from '../country-addresses/tw-address/tw-address.component';
import { JpAddressComponent } from '../country-addresses/jp-address/jp-address.component';
@Component({
  selector: 'app-add-billing-address',
  templateUrl: './add-billing-address.component.html',
  styleUrls: ['./add-billing-address.component.css'],
})
export class AddBillingAddressComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('addresscontainerpayment', { read: ViewContainerRef })
  addresscontainer!: ViewContainerRef;
  public componentRef!: any;
  public confirmShow: boolean = false;
  public country: string = '0';
  public isStaging: boolean = false;
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
  public addressSent: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '',
    country: '',
  };
  @Output() setNewAddressId = new EventEmitter<number>();
  @Output() hideFormBool = new EventEmitter<boolean>();
  constructor(private dataService: AppDataService, private changeDetectorRef: ChangeDetectorRef) {
    this.isStaging = environment.isStaging
  }

  ngOnInit(): void {

  }

  getCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((countryCode: string) => {
        this.country = countryCode;
      });
  }

  getAddress($event: BillingAddress) {
    this.addressSent = $event;
    this.confirmShow = true;
  }

  getNewAddressId($event: number) {
    this.setNewAddressId.emit($event);
    this.confirmShow = true;
  }

  hideConfirm($event: boolean) {
    this.confirmShow = false;

    if (this.country) {
      let component = this.addressComponentArray.find(x => x.country == this.country)
      this.componentRef = this.addresscontainer.createComponent(component.component);
      this.componentRef.instance['country'] = this.country;
      this.componentRef.instance['confirmShow'] = this.confirmShow;
      this.componentRef.instance.addressSent.subscribe((x: any) => {
        this.getAddress(x)
      })
      this.componentRef.instance.hideForm.subscribe((x: any) => {
        this.hideForm(x)
      })
      this.changeDetectorRef.detectChanges();
    }

  }

  hideForm($event: boolean) {
    this.hideFormBool.emit($event);
  }

  onSelectCountry() {
    if (this.componentRef) {
      let index = this.addresscontainer.indexOf(this.componentRef.hostView)
      if (index != -1) this.addresscontainer.remove(index)
    }
    let component = this.addressComponentArray.find(x => x.country == this.country)
    this.componentRef = this.addresscontainer.createComponent(component.component);
    this.componentRef.instance['country'] = this.country;
    this.componentRef.instance['confirmShow'] = this.confirmShow;
    this.componentRef.instance.addressSent.subscribe((x: any) => {
      this.getAddress(x)
    })
    this.componentRef.instance.hideForm.subscribe((x: any) => {
      this.hideForm(x)
    })
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {

  }
}
