import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { environment } from 'src/environments/environment';
import { BillingAddress } from '../models/billingAddress';
import { Person } from '../models/person';
import { SocialSetting } from '../models/socialSetting';
import { Verification } from '../models/verificationPhone';
import { AddressEmitterService } from '../services/address-emitter.service';
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
declare var $: any;
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css'],
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('addresscontainer', { read: ViewContainerRef })
  addresscontainer!: ViewContainerRef;
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
    { country: 'tw', component: TwAddressComponent }
  ]
  public tshirtProfile: SocialSetting = {
    typeId: 3,
    value: '',
  };
  public address: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '0',
    country: '0',
    save: true,
  };
  @ViewChild('zipInput', { static: false, read: ElementRef })

  public tenant: string = '';
  public zipInp!: ElementRef;
  public autoships: Array<number> = [];
  public activeAutoships: Array<any> = [];
  public addresses!: Array<any>;
  public loaderProfile: boolean = false;
  public confirmedAddresses!: Array<any>;
  public confirmAddres!: BillingAddress;
  public selectedAddress: boolean = false;
  public loaderAddress: boolean = false;
  public loaderVerify: boolean = false;
  public regions: Array<any> = [];
  public namePattern: any = /^[a-zA-Z\s]*$/;
  public userName!: string;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  public userInformation: any;
  public userNameError: boolean = false;
  public userNameSuccess: boolean = false;
  public emailError: boolean = false;
  public emailSuccess: boolean = false;
  public phoneCountry!: string;
  public selectedPhoneCountry!: string;
  public phoneNumber!: string;
  public currentPhoneNumber!: string;
  public loading: boolean = false;
  public genericError: boolean = false;
  public phoneCode!: string;
  public verifyPhoneError!: boolean;
  public addressProfileId!: number;
  public number1: string = '';
  public number2: string = '';
  public number3: string = '';
  public number4: string = '';
  public number5: string = '';
  public number6: string = '';
  public password!: string;
  public repeatPassword!: string;
  public showPassword: boolean = false;
  public passwordField: number = 0;
  public month: string = '99';
  public year!: number;
  public day: number = 0;
  public daysArray: number[] = [];
  public nameHistory: Array<any> = [];
  public countryHistory: Array<any> = [];
  public nameReview: boolean = false;
  public historyReview: boolean = false;
  public shirtSize: string = '0';
  public gender: string = '0';
  public bdayError: boolean = false;
  public companyName!: string;
  public birthDay!: string;
  public step: number = 1;
  public changesSaved: boolean = false;
  public phoneOverlay: boolean = false;
  public smsSent: boolean = false;
  public phoneSaved: boolean = false;
  public countrySaved: boolean = false;
  public hasWalletAmount: boolean = false;
  public confirmPhoneNumberModal: boolean = false;
  public countryCode!: string;
  public userCountry!: string;
  public addressProfileIdCountry!: string;
  public phoneCountries: Array<any> = [];
  public countries: Array<any> = [
    { country: 'Austria', countryParam: 'at' },
    { country: 'Australia', countryParam: 'au' },
    { country: 'Belgium', countryParam: 'be' },
    { country: 'Bulgaria', countryParam: 'bg' },
    { country: 'Canada', countryParam: 'ca' },
    { country: 'Switzerland', countryParam: 'ch' },
    { country: 'China', countryParam: 'cn' },
    { country: 'Czech Republic', countryParam: 'cz' },
    { country: 'Germany', countryParam: 'de' },
    { country: 'Denmark', countryParam: 'dk' },
    { country: 'Estonia', countryParam: 'ee' },
    { country: 'Spain', countryParam: 'es' },
    { country: 'Finland', countryParam: 'fi' },
    { country: 'France', countryParam: 'fr' },
    { country: 'United Kingdom', countryParam: 'gb' },
    { country: 'Greece', countryParam: 'gr' },
    { country: 'Hong Kong', countryParam: 'hk' },
    { country: 'Croatia', countryParam: 'hr' },
    { country: 'Hungary', countryParam: 'hu' },
    { country: 'Ireland', countryParam: 'ie' },
    { country: 'Italy', countryParam: 'it' },
    { country: 'Lithuania', countryParam: 'lt' },
    { country: 'Luxembourg', countryParam: 'lu' },
    { country: 'Japan', countryParam: 'jp' },
    { country: 'Latvia', countryParam: 'lv' },
    { country: 'Macau', countryParam: 'mo' },
    { country: 'Malta', countryParam: 'mt' },
    { country: 'Mexico', countryParam: 'mx' },
    { country: 'Malaysia', countryParam: 'my' },
    { country: 'Netherlands', countryParam: 'nl' },
    { country: 'New Zealand', countryParam: 'nz' },
    { country: 'Norway', countryParam: 'no' },
    { country: 'Poland', countryParam: 'pl' },
    { country: 'Portugal', countryParam: 'pt' },
    { country: 'Republic of Cyprus', countryParam: 'cy' },
    { country: 'Romania', countryParam: 'ro' },
    { country: 'Sweden', countryParam: 'se' },
    { country: 'Singapore', countryParam: 'sg' },
    { country: 'Slovenia', countryParam: 'si' },
    { country: 'Slovakia', countryParam: 'sk' },
    { country: 'San Marino', countryParam: 'sm' },
    { country: 'Taiwan', countryParam: 'tw' },
    { country: 'United States', countryParam: 'us' }
  ];
  public userPhoneOptions: any;
  @ViewChild('myForm', { static: false, read: ElementRef })
  public form!: NgForm;
  @ViewChild('emailInput', { static: false, read: ElementRef })
  public emailInp!: ElementRef;
  @ViewChild('firstNameInput', { static: false, read: ElementRef })
  public firstNameInp!: ElementRef;
  @ViewChild('lastNameInput', { static: false, read: ElementRef })
  public lastNameInp!: ElementRef;
  @ViewChild('passwordInput', { static: false, read: ElementRef })
  public passwordInp!: ElementRef;

  constructor(private newgenSvc: NewgenApiService, private addressEmitter: AddressEmitterService, private changeDetectorRef: ChangeDetectorRef, private http: HttpClient) {
    this.tenant = environment.tenant;
    const days = Array.from(Array(31).keys()).map((d) => {
      return d + 1;
    });
    this.addressEmitter.getAddress().subscribe(x => {
      this.address = x;
    })
    this.daysArray = days;
  }

  ngOnInit(): void {
    this.getProfilePersonalSettings();
    this.getProfileSettings();
    this.getNameChangeHistory();
    this.getCountryChangeHistory();
    this.getAddresses();
    this.getState();
    this.getPhoneVerification();
    this.getPhoneCountries();
  }

  saveUserName() {
    this.userNameError = false;
    this.userNameSuccess = false;
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      userName: this.userName.replace(/ /g, '')
    };
    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
            this.userNameError = true;
          } else {
            this.userNameSuccess = true;
          }
          this.loading = false;
          this.userName = this.userName.replace(/ /g, '')
          this.userInformation.username = this.userName;
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  getPhoneCountries() {
    this.http
      .get('assets/countries.json')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: any) => {
        this.phoneCountries = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      });
  }

  saveName() {
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    };
    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
          } else {
          }
          this.loading = false;
          this.getNameChangeHistory();
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  saveGender() {
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      gender: this.gender,
    };
    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
          } else {
          }
          this.loading = false;
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  saveBirthDay() {
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      birthDay: this.birthDay,
    };
    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
          } else {
          }
          this.loading = false;
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  saveEmail() {
    this.emailError = false;
    this.emailSuccess = false;
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      email: this.email,
    };
    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
            this.emailError = true;
            this.loading = false;
            return;
          } else {
            this.emailSuccess = true;
          }
          this.loading = false;
          this.userInformation.email = this.email;
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  savePhone() {
    this.genericError = false;
    let code =
      this.number1 +
      this.number2 +
      this.number3 +
      this.number4 +
      this.number5 +
      this.number6;
    let person: Person = {
      code: code,
      phoneCountry: this.phoneCountry,
      phoneNumber: this.phoneNumber,
    };

    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
          } else {
            $('#phoneNumberModal').modal('hide');
            this.phoneSaved = true;
            setTimeout(() => {
              this.phoneSaved = false;
            }, 2000);
          }
          this.loading = false;
          this.phoneOverlay = false;
          this.userInformation.phoneCountry = this.phoneCountry;
          this.userInformation.phoneNumber = this.phoneNumber;
          this.currentPhoneNumber = this.phoneNumber;
          this.selectedPhoneCountry = '+' + this.phoneCountry
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  errorReset() {
    this.genericError = false;
    this.emailSuccess = false;
    this.userNameSuccess = false;
    this.verifyPhoneError = false;
    this.confirmPhoneNumberModal = false;
    this.number1 = '';
    this.number2 = '';
    this.number3 = '';
    this.number4 = '';
    this.number5 = '';
    this.number6 = '';
    this.password = '';
    this.repeatPassword = '';
    this.userName = this.userInformation.username;
    this.email = this.userInformation.email;
    this.firstName = this.userInformation.firstName;
    this.lastName = this.userInformation.lastName;
    this.phoneCountry = this.userInformation.phoneCountry;
    this.selectedPhoneCountry = '+' + this.phoneCountry
    this.phoneNumber = this.userInformation.phoneNumber;

    this.address = {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      postalCode: '',
      region: '0',
      country: '0',
      save: true,
    };
    if (this.countryCode == 'JP') {
      this.namePattern = /^(?![\s\S]*[\u3400-\u4DB5\u4E00-\u9FCB\uF900-\uFA6A])[\s\S]*$/;
    } else {
      this.namePattern = /^[a-zA-Z\s]*$/
    }
    this.selectedAddress = false;
    this.step = 1;
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData!.getData('text');
    let reg = /^-?\d+\.?\d*$/;
    this.number1 = pastedText[0] || '';
    this.number2 = pastedText[1] || '';
    this.number3 = pastedText[2] || '';
    this.number4 = pastedText[3] || '';
    this.number5 = pastedText[4] || '';
    this.number6 = pastedText[5] || '';
  }
  phoneSend() {
    this.number1 = '';
    this.number2 = '';
    this.number3 = '';
    this.number4 = '';
    this.number5 = '';
    this.number6 = '';
    this.loading = true;
    this.genericError = false;
    this.verifyPhoneError = false;
    this.selectedPhoneCountry = this.selectedPhoneCountry.replace('+', '')
    let phone: Verification = {
      language: 'EN',
      phoneCountry: this.selectedPhoneCountry,
      phoneNumber: this.phoneNumber,
    };

    this.newgenSvc
      .verifyPhoneSend(phone)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.confirmPhoneNumberModal = true;
          this.loading = false;
          this.smsSent = true;
          setTimeout(() => {
            this.smsSent = false;
          }, 2000);
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  phoneCodeSend() {
    this.verifyPhoneError = false;
    this.genericError = false;
    this.loading = true;
    this.phoneOverlay = true;
    let code =
      this.number1 +
      this.number2 +
      this.number3 +
      this.number4 +
      this.number5 +
      this.number6;
    if (!environment.production) {
      if (code.length < 5) {
        this.loading = false;
        this.phoneOverlay = false;
        return;
      }
    } else {
      if (code.length < 6) {
        this.loading = false;
        this.phoneOverlay = false;
        return;
      }
    }

    let phone: Verification = {
      code: code.trim(),
      phoneCountry: this.phoneCountry,
      phoneNumber: this.phoneNumber,
    };

    this.newgenSvc
      .verifyCodeSend(phone)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
            this.verifyPhoneError = true;
            this.phoneOverlay = false;
          } else {
            this.savePhone();
          }
          this.loading = false;
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
          this.phoneOverlay = false;
        }
      );
  }

  changePassword() {
    this.loading = true;
    this.newgenSvc
      .changePassword(this.password)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.loading = false;
          $('#passwordModal').modal('hide');
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  getProfilePersonalSettings() {
    let countries = [...this.countries];
    this.newgenSvc
      .getProfilePersonalSettings()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.userInformation = x.collection[0];
        this.userName = x.collection[0].username;
        this.email = x.collection[0].email;
        this.firstName = x.collection[0].firstName;
        this.lastName = x.collection[0].lastName;
        this.phoneCountry = x.collection[0].phoneCountry;
        this.phoneNumber = x.collection[0].phoneNumber;
        this.gender = x.collection[0] ?.gender || '0';
        this.companyName = x.collection[0].companyName;
        this.countryCode = x.collection[0].country;

        if (x.collection[0].birthDay !== undefined) {
          let dateSplit = x.collection[0].birthDay.split('T')[0];
          let date = new Date(dateSplit);
          this.month = date.getMonth().toString() || '99';
          if (!x.collection[0] ?.ignoreBirthYear)
            this.year = date.getFullYear() || 0;
          this.day = date.getDate() || 0;
        }
        this.currentPhoneNumber = this.phoneNumber;
        let usrCountry = countries.find(y => y.countryParam == this.countryCode.toLowerCase());
        this.userCountry = usrCountry.country;
        this.selectedPhoneCountry = '+' + this.phoneCountry
      });
  }

  onSelectPhoneCode() {
  }

  savePerson() {
    let person: Person = {
      companyName: this.companyName,
      email: this.email,
      firstName: this.firstName,
      gender: this.gender,
      lastName: this.lastName,
      userName: this.userName,
    };

    this.newgenSvc
      .personProfileUpdate(person)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if (!x.isSuccess) {
          } else {
          }
        },
        (err) => {
          this.genericError = true;
          this.loading = false;
        }
      );
  }

  showPasswordField(input: number) {
    if (input == this.passwordField) {
      this.passwordField = 0;
      this.showPassword = false;
      return;
    }
    this.passwordField = input;
    this.showPassword = true;
  }

  passwordCheck() {
    let oneCapitalLetter = new RegExp('(?=.*?[A-Z])');
    let numOrSymbol = new RegExp('((?=.*?[0-9])|(?=.*?[#?!@$%^&*-]))');

    if (oneCapitalLetter.test(this.password)) {
    } else {
    }
    if (numOrSymbol.test(this.password)) {
    } else {
    }
  }

  getNameChangeHistory() {
    this.newgenSvc
      .getNameChangeHistory()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.nameHistory = x.collection;
        if (this.nameHistory.find((y) => y.status == 'pending')) {
          this.nameReview = true;
        } else {
          this.nameReview = false;
        }
      });
    $('#fullNameModal').modal('hide');
  }

  getCountryChangeHistory() {
    this.newgenSvc
      .getCountryChangeHistory()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.countryHistory = x.collection;
        if (this.countryHistory.find((y) => y.status == 'pending')) {
          this.historyReview = true;
        } else {
          this.historyReview = false;
        }
      });
  }

  getPhoneVerification() {
    this.newgenSvc.getPhoneVerification().subscribe((x) => {
      this.userPhoneOptions = x.collection[0];
    });
  }

  getProfileSettings() {
    this.newgenSvc
      .getProfileSettings()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.tshirtProfile = x.collection.find(
          (y: any) => this.tshirtProfile.typeId == y.typeId
        );
        this.shirtSize = this.tshirtProfile.value || '0';
      });
  }

  socialSettingUpdate() {
    this.newgenSvc
      .socialSettingUpdate(this.tshirtProfile)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.loading = false;
      });
  }

  saveAdvanced() {
    let array: any = [];
    this.loading = true;
    if (this.shirtSize !== '0') {
      this.tshirtProfile.value = this.shirtSize;
      array.push(this.newgenSvc.socialSettingUpdate(this.tshirtProfile));
    }

    let person: Person = {
      gender: this.gender,
    };
    array.push(this.newgenSvc.personProfileUpdate(person));

    if (this.day.toString() == '' && this.month == '99') {
    } else {
      if (!this.bdayError) {
        let newDate = new Date();
        if (this.day.toString() == '' && this.month == '99') {
          this.bdayError = false;
          return;
        }
        if (!this.day || !this.month || this.month == '99') {
          this.bdayError = true;
          return;
        }
        if (this.year && this.year < 1900) {
          this.bdayError = true;
          return;
        }

        if (this.year && newDate.getFullYear() - this.year < 18) {
          this.bdayError = true;
          return;
        }
        const year = this.year || 1900;
        let date = moment([year, parseInt(this.month), this.day]);
        if (!date.isValid()) {
          this.bdayError = true;
        } else {
          this.bdayError = false;
          this.birthDay = date.format('YYYY-MM-DD') + 'T06:00:00.000Z';
        }

        let person: Person = {
          birthDay: this.birthDay,
          ignoreBirthYear: year === 1900,
        };
        array.push(this.newgenSvc.personProfileUpdate(person));
      }
    }

    if (array.length == 0) {
      this.loading = false;
    }
    forkJoin(array)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.loading = false;
          this.changesSaved = true;
          setTimeout(() => {
            this.changesSaved = false;
          }, 2000);
        },
        (err) => {
          this.loading = false;
        }
      );
  }

  checkDate() {
    let newDate = new Date();
    if (this.day.toString() == '' && this.month == '99') {
      this.bdayError = false;
      return;
    }
    if (!this.day || !this.month || this.month == '99') {
      this.bdayError = true;
      return;
    }

    if (this.year && this.year < 1900) {
      this.bdayError = true;
      return;
    }
    if (this.year && newDate.getFullYear() - this.year < 18) {
      this.bdayError = true;
      return;
    }
    const year = this.year || 1900;
    let date = moment([year, parseInt(this.month), this.day]);
    if (!date.isValid()) {
      this.bdayError = true;
    } else {
      this.bdayError = false;
      this.birthDay = date.format('MM-DD-YYYY');
    }
  }

  getAddresses() {
    this.loaderAddress = true;
    this.newgenSvc
      .getAddresses('false', 10, 0, 'date+desc')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.addresses = x.collection;
          this.addresses = [...this.addresses];
          this.getAutoships();
          this.loaderAddress = false;
        },
        (err) => {
          this.loaderAddress = false;
        }
      );
  }

  getAutoships() {
    this.newgenSvc.getActiveAutoships().subscribe((x) => {
      this.activeAutoships = x.collection.filter(
        (y: any) =>
          y.catalogTypeCode == 'sunbasket' || y.catalogTypeCode == 'smartOrder'
      );
    });
  }

  verifyAddress() {
    this.loaderVerify = true;
    // this.confirmShow = true;
    this.confirmAddres;
    this.newgenSvc
      .verifyAddress(this.address)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.confirmedAddresses = x.collection;
          this.loaderVerify = false;
          this.stepChange(3);
          this.selectedAddress = false;
        },
        (err) => {
          this.loaderVerify = false;
        }
      );
  }

  getState() {
    // this.loader = true;
    this.newgenSvc
      .getCollection(8)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
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
            save: true,
          };
          this.autoships = [];
        },
        (err) => {
          // this.loader = false;
        }
      );
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

  selectAddressProfileId(id: any, country: string) {
    this.hasWalletAmount = false;
    if (this.addressProfileId == id) {
      return;
    }
    this.addressProfileId = id;
    this.addressProfileIdCountry = country;
  }

  createAddressProfile() {
    this.loaderProfile = true;
    // if (this.autoships.length > 0) {
    //   this.confirmAddres.updateAutoshipIds = this.autoships;
    // }
    this.newgenSvc
      .createAddressProfile(this.confirmAddres)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          // $('#confirmAddressModal').modal('hide');
          // $('#newAddressModal').modal('hide');
          this.getAddresses();
          this.loaderProfile = false;
          this.step = 1;
          // this.confirmAddres.updateAutoshipIds = [];
        },
        (err) => {
          this.loaderProfile = false;
        }
      );
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

  stepChange(step: number) {
    if (this.step == 1 && step == 2) {
      if (this.componentRef) {
        let index = this.addresscontainer.indexOf(this.componentRef.hostView)
        if (index != -1) this.addresscontainer.remove(index)
      }
      this.address = {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        postalCode: '',
        region: '0',
        country: '0',
        save: true,
      };
    }
    this.step = step;
  }

  getWalletStatus() {
    this.hasWalletAmount = false;
    this.loading = true;
    this.newgenSvc
      .getWalletStatus()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          let walletCollection = x.collection || [];

          for (let i = 0; i < walletCollection.length; i++) {
            var wallet = walletCollection[i];
            if (
              wallet.isPoint === false &&
              (wallet.amount > 0 || wallet.couponsAmount)
            ) {
              this.hasWalletAmount = true;
              this.loading = false;
              return;
            }
          }
          this.hasWalletAmount = false;

          this.postCountry();
        },
        (err) => {
          this.loading = false;
        }
      );
  }

  postCountry() {
    this.newgenSvc
      .postCountry(this.addressProfileId, this.addressProfileIdCountry)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.hasWalletAmount = false;
          this.loading = false;
          $('#countryResidenceModal').modal('hide');
          this.countrySaved = true;
          setTimeout(() => {
            this.countrySaved = false;
          }, 2000);
        },
        (err) => {
          this.loading = false;
        }
      );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
