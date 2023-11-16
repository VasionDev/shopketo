import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { environment } from 'src/environments/environment';
import { BillingAddress } from '../../models/billingAddress';
import { AddressEmitterService } from '../../services/address-emitter.service';
import { CreditCardCreate } from '../../models/creditCardCreate';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { UsAddressComponent } from '../../components/country-addresses/us-address/us-address.component';
import { AlAddressComponent } from '../../components/country-addresses/al-address/al-address.component';
import { AtAddressComponent } from '../../components/country-addresses/at-address/at-address.component';
import { AuAddressComponent } from '../../components/country-addresses/au-address/au-address.component';
import { BeAddressComponent } from '../../components/country-addresses/be-address/be-address.component';
import { BgAddressComponent } from '../../components/country-addresses/bg-address/bg-address.component';
import { CaAddressComponent } from '../../components/country-addresses/ca-address/ca-address.component';
import { ChAddressComponent } from '../../components/country-addresses/ch-address/ch-address.component';
import { CnAddressComponent } from '../../components/country-addresses/cn-address/cn-address.component';
import { CyAddressComponent } from '../../components/country-addresses/cy-address/cy-address.component';
import { CzAddressComponent } from '../../components/country-addresses/cz-address/cz-address.component';
import { DeAddressComponent } from '../../components/country-addresses/de-address/de-address.component';
import { DkAddressComponent } from '../../components/country-addresses/dk-address/dk-address.component';
import { EeAddressComponent } from '../../components/country-addresses/ee-address/ee-address.component';
import { EsAddressComponent } from '../../components/country-addresses/es-address/es-address.component';
import { FiAddressComponent } from '../../components/country-addresses/fi-address/fi-address.component';
import { FrAddressComponent } from '../../components/country-addresses/fr-address/fr-address.component';
import { GbAddressComponent } from '../../components/country-addresses/gb-address/gb-address.component';
import { GrAddressComponent } from '../../components/country-addresses/gr-address/gr-address.component';
import { HrAddressComponent } from '../../components/country-addresses/hr-address/hr-address.component';
import { HuAddressComponent } from '../../components/country-addresses/hu-address/hu-address.component';
import { IeAddressComponent } from '../../components/country-addresses/ie-address/ie-address.component';
import { ItAddressComponent } from '../../components/country-addresses/it-address/it-address.component';
import { LtAddressComponent } from '../../components/country-addresses/lt-address/lt-address.component';
import { LuAddressComponent } from '../../components/country-addresses/lu-address/lu-address.component';
import { LvAddressComponent } from '../../components/country-addresses/lv-address/lv-address.component';
import { MtAddressComponent } from '../../components/country-addresses/mt-address/mt-address.component';
import { MxAddressComponent } from '../../components/country-addresses/mx-address/mx-address.component';
import { NlAddressComponent } from '../../components/country-addresses/nl-address/nl-address.component';
import { NzAddressComponent } from '../../components/country-addresses/nz-address/nz-address.component';
import { PlAddressComponent } from '../../components/country-addresses/pl-address/pl-address.component';
import { PtAddressComponent } from '../../components/country-addresses/pt-address/pt-address.component';
import { RoAddressComponent } from '../../components/country-addresses/ro-address/ro-address.component';
import { SeAddressComponent } from '../../components/country-addresses/se-address/se-address.component';
import { SiAddressComponent } from '../../components/country-addresses/si-address/si-address.component';
import { SkAddressComponent } from '../../components/country-addresses/sk-address/sk-address.component';
import { HkAddressComponent } from '../../components/country-addresses/hk-address/hk-address.component';
import { MoAddressComponent } from '../../components/country-addresses/mo-address/mo-address.component';
import { MyAddressComponent } from '../../components/country-addresses/my-address/my-address.component';
import { SgAddressComponent } from '../../components/country-addresses/sg-address/sg-address.component';
import { TwAddressComponent } from '../../components/country-addresses/tw-address/tw-address.component';
import { JpAddressComponent } from '../../components/country-addresses/jp-address/jp-address.component';
declare var $: any;

@Component({
  selector: 'upcoming-smartships',
  templateUrl: './upcoming-smartships.component.html',
  styleUrls: ['./upcoming-smartships.component.css']
})
export class UpcomingSmartshipsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public orderHistory!: Array<any>
  public autoshipHistory!: Array<any>
  public activeTab: number = 1;
  public activeSetting: number = 0;
  public selectedOrder: any;
  public selectedOrderInformation: any;
  public bv: number = 0;
  public qv: number = 0;
  public showPb!: string;
  public pbAmount!: number;
  public showMoreTotalBool: boolean = false;
  public scheduledAutoshipsOptions: Array<any> = [];
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
  @ViewChild('addresscontainer', { read: ViewContainerRef })
  addresscontainer!: ViewContainerRef;
  public scheduledDate!: string;
  public loading: boolean = false;
  public addresses!: Array<any>;
  public confirmedAddresses!: Array<any>;
  public selectedAddress: boolean = false;
  public loaderProfile: boolean = false;
  public loaderPayment: boolean = false;
  public loaderVerify: boolean = false;
  public loaderAddress: boolean = false;
  public addressProfileId!: number;
  public paymentMethods: Array<any> = [];
  public confirmAddres!: BillingAddress;
  public tenant!: string;
  productSettings = {} as ProductSettings;
  public newgenPath = environment.newgenUrl;
  @Input('user')
  public user: any;
  @Input('hideTitle')
  public hideTitle: boolean = false;;
  @Output() scheduledCount = new EventEmitter<number>();
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

  public billingAddress: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '',
    country: ''
  }
  public regions: Array<any> = [];
  @ViewChild('zipInput', { static: false, read: ElementRef })
  public zipInp!: ElementRef;
  @ViewChild('zipInputBilling', { static: false, read: ElementRef })
  public zipInpBilling!: ElementRef;
  public addressStep: number = 0;
  public paymentStep: number = 0;
  public cardType: string = '';
  public creditCardCreate: CreditCardCreate = {
    addressProfileId: 0,
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
    paymentMethodId: 5
  };
  public cardInputError: boolean = false;
  public cardMonth: string = '';
  public cardYear: string = '';
  public securityCode: string = '';
  public pendingAutoshipPayment: boolean = false;
  public cvv: string = '';
  public cardExpError: boolean = false;
  public years: Array<number> = [];
  public error: string = '';
  public showCreateAddress: boolean = false;
  public showCreateAddressConfirm: boolean = false;
  public paymentProfileId!: number;
  public paymentProfileType!: string;
  public loaderHistory: boolean = false;
  public months: Array<string> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  constructor(
    private newgenSvc: NewgenApiService,
    private dataService: AppDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private addressEmitter: AddressEmitterService
  ) {
    let date = new Date();
    let year = date.getFullYear();
    for (let i = 0; i < 21; i++) {
      this.years.push(year + i);
    }
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getIncomingSmartships();
    this.getProductSettings();
    this.addressEmitter.getAddress().subscribe(x => {
      this.address = x;
    })
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
    this.componentRef.instance['removePadding'] = true;
    this.changeDetectorRef.detectChanges();
  }

  getIncomingSmartships() {
    this.loaderHistory = true;
    this.newgenSvc.getIncomingSmartships().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {
        this.loaderHistory = false;
        this.scheduledCount.emit(0)
        return;
      }
      this.orderHistory = x.collection;
      this.scheduledCount.emit(this.orderHistory.length)
      this.loaderHistory = false;
    },
      err => {
        this.loaderHistory = false;
      })
  }

  stepChangeAddress(step: number) {
    if (this.addressStep == 1 && step == 2) {
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
    }

    this.addressStep = step;
  }

  stepChangePayment(step: number) {
    if (this.paymentStep == 0 && step == 1) {
      this.creditCardCreate = {
        addressProfileId: 0,
        cardHolderName: '',
        cardNumber: '',
        expirationDate: '',
        paymentMethodId: 5
      }
    }
    this.paymentStep = step;
  }

  changeTab(tab: number) {
    this.showMoreTotalBool = false;
    if (tab == 2) {
      this.activeSetting = 0;
    }
    this.addressStep == 1
    this.activeTab = tab;
  }

  changeSetting(setting: number) {
    this.activeSetting = setting;
  }

  viewDetails(order: any, activeSetting?: number) {
    this.selectedOrderInformation = null;
    this.selectedOrder = order;
    this.activeSetting = 0;
    this.paymentProfileId = 0;
    this.error = '';
    this.addressProfileId = 0;
    this.cvv = '';
    this.showCreateAddress = false;
    this.showCreateAddressConfirm = false;
    this.showMoreTotalBool = false;
    this.stepChangePayment(0)
    this.stepChangeAddress(1);
    if (this.selectedOrder.additionalInformation) {

      let findAdditionalInfo = this.selectedOrder.additionalInformation.find(
        (x: any) => x.title == '$points_balance' || x.title == '$ladyboss_buck_balance'
      );
      this.showPb = findAdditionalInfo.title;
      this.pbAmount = findAdditionalInfo.valueAmount;
    }
    else {
      this.showPb = '';
      this.pbAmount = 0;
    }

    // this.showPb = this.orderHistory.additionalInformation[0].valueText;
    // this.pbAmount = this.orderHistory.additionalInformation[1].valueAmount;
    this.getAutoship(this.selectedOrder.id)
    this.getAddresses();
    this.getState();
    this.getPaymentProfile(this.user.id)
    for (let index = 0; index < this.selectedOrder.products.length; index++) {
      const element = this.selectedOrder.products[index];
      this.bv += element.volumes.bonusVolume || 0;
      this.qv += element.volumes.qualificationVolume || 0;
    }
    this.getAutoshipHistory(this.selectedOrder.autoshipType.code);
    if (!activeSetting) {
      this.activeTab = 1;
    }
    if (activeSetting == 1) {
      this.activeTab = 2;
      this.activeSetting = 1;
    }
    if (activeSetting == 2) {
      this.activeTab = 2;
      this.activeSetting = 2;
    }
    if (activeSetting == 3) {
      this.activeTab = 2;
      this.activeSetting = 3;
    }
    if (activeSetting == 4) {
      this.activeTab = 2;
      this.activeSetting = 4;
    }
  }

  getAutoship(id: number) {
    this.newgenSvc.getAutoship(id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.selectedOrderInformation = x.collection[0];
      this.getAutoshipScheduleOptions(id);
    })
  }

  getAutoshipScheduleOptions(id: number) {
    this.newgenSvc.getAutoshipScheduleOptions(id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x.isSuccess) {
        this.scheduledAutoshipsOptions = x.collection;
        this.scheduledDate = this.scheduledAutoshipsOptions[0].nextRun;
        this.pendingAutoshipPayment = false;
      }
      else {
        this.pendingAutoshipPayment = true;
      }
    },
      err => {
        this.pendingAutoshipPayment = true;
      })
  }

  changeAutoshipDate(id: number, date: string) {
    this.newgenSvc.changeAutoshipDate(id, date).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.selectedOrder.nextRun = date;
      let index = this.orderHistory.findIndex(x => x.id == id);
      this.orderHistory[index].id = id;
      this.loading = false;
      this.activeSetting = 0;
    })
  }

  getAddresses() {
    this.loaderAddress = true;
    this.newgenSvc.getAddresses('false', 100, 0, 'date+desc', '{"in":["country","US"]}').pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.addresses = x.collection;
      this.addresses = [...this.addresses];
      this.loaderAddress = false;
    },
      err => {
        this.loaderAddress = false;
      })
  }

  getState() {
    // this.loader = true;
    this.newgenSvc.getCollection(8).subscribe(x => {
      this.regions = x.collection;
      // this.loader = false;
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
    },
      err => {
        // this.loader = false;
      })
  }

  verifyAddress() {
    this.loaderVerify = true;
    if (this.showCreateAddress) {
      this.address = this.billingAddress;
    }
    this.newgenSvc.verifyAddress(this.address).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.confirmedAddresses = x.collection;
      this.loaderVerify = false;
      if (this.showCreateAddress) {
        this.showCreateAddressConfirm = true;
      }
      else {
        this.stepChangeAddress(3);
      }
      this.selectedAddress = false;
    },
      err => {
        this.loaderVerify = false;
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
    this.newgenSvc.createAddressProfile(this.confirmAddres).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.getAddresses();
      this.loaderProfile = false;
      if (this.showCreateAddressConfirm) {
        this.showCreateAddress = false;
        this.showCreateAddressConfirm = false;
        this.creditCardCreate.addressProfileId = x.collection[0].id;
      } else {
        this.addressStep = 1;
      }

    },
      err => {
        this.loaderProfile = false;
      })
  }

  setAutoshipAddress() {
    this.newgenSvc.autoshipSetAddress(this.addressProfileId, this.selectedOrder.id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.loading = false;
      this.activeSetting = 0;
      this.selectedOrder.shippingAddress.addressAlias = x.collection[0].subscriptions[0].shippingAddress.addressAlias;
    })
  }

  selectAddressProfileId(id: any) {
    if (this.addressProfileId == id) {
      return;
    }
    this.addressProfileId = id;
  }

  selectPaymentProfileId(id: any, paymentType: string) {
    if (this.paymentProfileId == id) {
      return;
    }
    this.paymentProfileId = id;
    this.paymentProfileType = paymentType;
  }

  getPaymentProfile(userId: string) {
    this.paymentMethods = [];
    this.loaderPayment = true;
    this.newgenSvc
      .getPaymentProfile({
        expandAddress: true,
        expandContact: true,
        expandPayment: true,
        userId: userId,
      })

      .subscribe((x) => {
        this.loaderPayment = false;
        this.paymentMethods = x.collection;
      });
  }

  cardNumber(value: string) {

    if (value != '') {
      // Taking out values from the input
      let oneValue = parseInt(value.substring(0, 1));
      let twoValue = parseInt(value.substring(0, 2));
      let threeValue = parseInt(value.substring(0, 3));
      let fourValue = parseInt(value.substring(0, 4));
      let sixValue = parseInt(value.substring(0, 6));
      //the if else
      if (twoValue == 34 || twoValue == 37) {
        //card is amex
        this.cardType = 'amex';
      } else if (oneValue == 4) {
        //card is visa
        this.cardType = 'visa';
      } else if (
        (threeValue >= 300 && threeValue <= 305) ||
        fourValue == 3095 ||
        twoValue == 36 ||
        twoValue == 38 ||
        twoValue == 39
      ) {
        //card is diners club or could be diners club
        this.cardType = 'fa-cc-diners-club';
      } else if (
        (fourValue >= 2221 && fourValue <= 2720) ||
        (twoValue >= 51 && twoValue <= 55)
      ) {
        //card is mastercard
        this.cardType = 'mastercard';
      } else if (fourValue >= 3528 && fourValue <= 3589) {
        //card is jcb
        this.cardType = 'jcb';
      } else if (
        fourValue == 6011 ||
        fourValue == 6601 ||
        twoValue == 65 ||
        twoValue == 64 ||
        (sixValue >= 622126 && sixValue <= 622925)
      ) {
        //card is discover
        this.cardType = 'discover';
      } else {
        //unknown card
        this.cardType = '';
      }
    } else {
      //unknown card
      this.cardType = '';
    }
  }

  onCardChange(card: string) {
    if (!card || card == '') {
      this.cardInputError = false;
      return;
    }
    let regex = new RegExp('^[0-9 ]{15,16}$');
    let text = regex.test(card);
    if (!regex.test(card)) {
      this.cardInputError = true;
    } else {
      this.cardInputError = false;
    }
  }

  checkDate() {
    let date = new Date();
    if (
      this.cardMonth <= date.getMonth().toString() &&
      this.cardYear == date.getFullYear().toString()
    ) {
      this.cardExpError = true;
    } else {
      this.cardExpError = false;
    }
  }

  showAddress(value: number) {
    if (value == 0) {
      this.billingAddress = {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        postalCode: '',
        region: '0',
        country: '0',
        save: true
      }
      this.showCreateAddress = true;
    }
  }

  createPayment() {
    this.error = '';
    this.loading = true;
    if (this.cardExpError || this.cardInputError) {
      this.loading = false;
      return;
    }
    const date = new Date(
      Date.UTC(parseInt(this.cardYear), parseInt(this.cardMonth), 1)
    );
    this.creditCardCreate.expirationDate = date.toISOString();
    this.creditCardCreate.save = true;
    this.newgenSvc
      .creditCardProfileCreate(this.creditCardCreate)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        this.loading = false;
        if (!x.isSuccess) {
          this.error = x.responseStatus.errors[0].message;
          return;
        }
        else {
          let lastDigits = x.collection[0].paymentAlias.substr(x.collection[0].paymentAlias.length - 4)
          this.paymentMethods.push({ id: x.collection[0].id, last4Digits: lastDigits, paymentType: x.collection[0].paymentType })
          this.paymentStep = 0;
        }
      });
  }

  autoshipPaymentSave() {
    if (this.paymentProfileType == 'CreditCardProfile') {
      this.newgenSvc.autoshipCreditCardSave(this.paymentProfileId, this.cvv).pipe(takeUntil(this.destroyed$)).subscribe(x => {
        if (!x.isSuccess) {
          this.error = x.responseStatus.errors[0].message;
          this.loading = false;
          return;
        }
        else {
          this.activeSetting = 0;
          this.loading = false;
          this.getIncomingSmartships();
          $('#smartShipModal').modal('hide');
        }
      })
    }
    if (this.paymentProfileType == 'TokenProfile') {
      this.newgenSvc.autoshipCreditCardTokenSave(this.selectedOrder.id, this.paymentProfileId, this.cvv).pipe(takeUntil(this.destroyed$)).subscribe(x => {
        if (!x.isSuccess) {
          this.error = x.responseStatus.errors[0].message;
          this.loading = false;
          return;
        }
        else {
          this.activeSetting = 0;
          this.loading = false;
          this.getIncomingSmartships();
          $('#smartShipModal').modal('hide');
        }
      })
    }
  }

  save() {
    this.loading = true;
    this.error = '';
    if (this.activeSetting == 1) {
      this.changeAutoshipDate(this.selectedOrder.id, this.scheduledDate)
    }
    if (this.activeSetting == 2 && this.addressStep == 1) {
      this.setAutoshipAddress()
    }
    if (this.activeSetting == 3 && this.paymentStep == 0) {
      this.autoshipPaymentSave();
      return;
    }

  }

  showMoreTotal() {
    this.showMoreTotalBool = !this.showMoreTotalBool;
  }

  cancelAutoship() {
    this.loading = true;
    this.newgenSvc.cancelAutoship(this.selectedOrder.id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.getIncomingSmartships();
      this.loading = false;
      $('#smartShipModal').modal('hide');
    })
  }

  activateOrderSelected(order: any) {
    this.selectedOrder = order;
  }

  activateAutoship() {
    this.loading = true;
    this.newgenSvc.activateAutoship(this.selectedOrder.id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.getIncomingSmartships();
      this.loading = false;
      $('#reactivateModal').modal('hide');
    })
  }

  getAutoshipHistory(code: string) {
    this.newgenSvc.getAutoshipHistory('false', 10, 0, '{"substringof":["autoshipType",' + '"' + code + '"' + ']}').pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x ?.isSuccess) {
        this.autoshipHistory = x.collection;
      }
    })
  }

  details(invoice: number) {
    window.open(this.newgenPath + '#/invoice/' + invoice + '?userId=' + this.user.id, "_blank");
  }

  popUpState() {
    if (this.activeSetting == 1 || this.activeSetting == 4) {
      this.activeSetting = 0;
    }
    if (this.activeSetting == 2 && this.addressStep == 1) {
      this.activeSetting = 0;
    }
    if (this.activeSetting == 2 && this.addressStep == 2) {
      this.addressStep = 1;

      if (this.address.country !== "0" && this.address.country) {
        if (this.componentRef) {
          let index = this.addresscontainer.indexOf(this.componentRef.hostView)
          if (index != -1) this.addresscontainer.remove(index)
        }
      }
      this.changeDetectorRef.detectChanges();
    }
    if (this.activeSetting == 2 && this.addressStep == 3) {
      this.addressStep = 2;
    }
    if (this.activeSetting == 3 && this.paymentStep == 0) {
      this.activeSetting = 0;
      this.cvv = '';
      this.paymentProfileId = 0;
    }
    if (this.activeSetting == 3 && this.paymentStep == 1 && !this.showCreateAddress) {
      this.paymentStep = 0;
      this.creditCardCreate = {
        addressProfileId: 0,
        cardHolderName: '',
        cardNumber: '',
        expirationDate: '',
        paymentMethodId: 5
      }
      this.securityCode = '';
      this.cardMonth = '';
      this.cardYear = '';
    }

    if (this.activeSetting == 3 && this.paymentStep == 1 && this.showCreateAddress && !this.showCreateAddressConfirm) {
      this.showCreateAddress = false;
    }

    if (this.activeSetting == 3 && this.paymentStep == 1 && this.showCreateAddress && this.showCreateAddressConfirm) {
      this.showCreateAddressConfirm = false;
    }
  }

  updateProducts(order: any) {
    $('#smartShipModal').modal('hide');
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: { key: 'bundleBuilder', value: { autoshipOrder: order, modalTitle: '' } },
    });
    $('#bundleBuilderModal').modal('show');
  }

  getProductSettings() {
    this.dataService.currentProductsData$.pipe(takeUntil(this.destroyed$)).subscribe(data => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }
      this.productSettings = data.productSettings;
    })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
