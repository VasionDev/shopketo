import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { Person } from '../models/person';
import { BillingAddress } from '../models/billingAddress';
import { Verification } from '../models/verificationPhone';
import { SocialSetting } from '../models/socialSetting';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public tshirtProfile: SocialSetting = {
    typeId: 3,
    value: ''
  }
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
  @ViewChild('zipInput', { static: false, read: ElementRef })
  public zipInp!: ElementRef;
  public autoships: Array<number> = [];
  public activeAutoships: Array<any> = [];
  public addresses!: Array<any>;
  public loaderProfile: boolean = false;
  public confirmedAddresses!: Array<any>;
  public confirmAddres!: BillingAddress;
  public selectedAddress: boolean = false
  public loaderAddress: boolean = false;
  public loaderVerify: boolean = false;
  public regions: Array<any> = [];;
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
  public phoneNumber!: string;
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
  public month: string = "99";
  public year!: number;
  public day!: number;
  public daysArray: number[] = [];
  public nameHistory: Array<any> = [];
  public countryHistory: Array<any> = [];
  public nameReview: boolean = false;
  public historyReview: boolean = false;
  public shirtSize: string = "0";
  public gender: string = "0";
  public bdayError: boolean = false;
  public companyName!: string;
  public birthDay!: string;
  public step: number = 1;
  public changesSaved: boolean = false;
  public hasWalletAmount: boolean = false;
  public userPhoneOptions: any;
  @ViewChild('myForm', { static: false, read: ElementRef }) public form!: NgForm;
  @ViewChild('emailInput', { static: false, read: ElementRef })
  public emailInp!: ElementRef;
  @ViewChild('passwordInput', { static: false, read: ElementRef })
  public passwordInp!: ElementRef;

  constructor(private newgenSvc: NewgenApiService) {
    const days = Array.from(Array(31).keys()).map(d => {
      return d + 1;
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
  }

  saveUserName() {
    this.userNameError = false;
    this.userNameSuccess = false;
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      userName: this.userName
    }
    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {
        this.userNameError = true;
      } else {
        this.userNameSuccess = true;
      }
      this.loading = false;
      this.userInformation.username = this.userName;
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  saveName() {
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      firstName: this.firstName,
      lastName: this.lastName
    }
    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {

      } else {

      }
      this.loading = false;
      this.getNameChangeHistory()
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  saveGender() {
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      gender: this.gender
    }
    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {

      } else {

      }
      this.loading = false;
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  saveBirthDay() {
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      birthDay: this.birthDay
    }
    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {

      } else {

      }
      this.loading = false;
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  saveEmail() {
    this.emailError = false;
    this.emailSuccess = false;
    this.genericError = false;
    this.loading = true;
    let person: Person = {
      email: this.email
    }
    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
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
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  savePhone() {
    this.genericError = false;
    let code = this.number1 + this.number2 + this.number3 + this.number4 + this.number5 + this.number6
    let person: Person = {
      code: code,
      phoneCountry: this.phoneCountry,
      phoneNumber: this.phoneNumber
    }

    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {

      } else {
        $("#phoneNumberModal").modal('hide')
        $("#confirmPhoneNumberModal").modal('hide')
      }
      this.loading = false;
      this.userInformation.phoneCountry = this.phoneCountry;
      this.userInformation.phoneNumber = this.phoneNumber;
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  errorReset() {
    this.genericError = false;
    this.emailSuccess = false;
    this.userNameSuccess = false;
    this.verifyPhoneError = false;
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
    this.phoneNumber = this.userInformation.phoneNumber;
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
    this.selectedAddress = false;
    this.step = 1;
  }

  phoneSend() {
    this.loading = true;
    this.genericError = false;
    this.verifyPhoneError = false;
    let phone: Verification = {
      language: "EN",
      phoneCountry: this.phoneCountry,
      phoneNumber: this.phoneNumber
    }

    this.newgenSvc.verifyPhoneSend(phone).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $("#confirmPhoneNumberModal").modal('show')
      this.loading = false;
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  phoneCodeSend() {
    this.verifyPhoneError = false;
    this.genericError = false;
    this.loading = true;
    let code = this.number1 + this.number2 + this.number3 + this.number4 + this.number5 + this.number6
    let phone: Verification = {
      code: code,
      phoneCountry: this.phoneCountry,
      phoneNumber: this.phoneNumber
    }

    this.newgenSvc.verifyCodeSend(phone).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {
        this.verifyPhoneError = true;

      } else {
        this.savePhone();
      }
      this.loading = false;
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  changePassword() {
    this.loading = true;
    this.newgenSvc.changePassword(this.password).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.loading = false;
      $("#passwordModal").modal('hide')
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  getProfilePersonalSettings() {
    this.newgenSvc.getProfilePersonalSettings().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.userInformation = x.collection[0];
      this.userName = x.collection[0].username;
      this.email = x.collection[0].email;
      this.firstName = x.collection[0].firstName;
      this.lastName = x.collection[0].lastName;
      this.phoneCountry = x.collection[0].phoneCountry;
      this.phoneNumber = x.collection[0].phoneNumber;
      this.gender = x.collection[0].gender;
      this.companyName = x.collection[0].companyName;
      let asdf = x.collection[0].birthDay.split('T')[0]
      let date = new Date(asdf)
      this.month = date.getMonth().toString() || '99';
      this.year = date.getFullYear() || 0;
      this.day = date.getDate() || 0
    })
  }

  savePerson() {
    let person: Person = {
      companyName: this.companyName,
      email: this.email,
      firstName: this.firstName,
      gender: this.gender,
      lastName: this.lastName,
      userName: this.userName
    }

    this.newgenSvc.personProfileUpdate(person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {

      } else {

      }
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
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
    let numOrSymbol = new RegExp('((?=.*?[0-9])|(?=.*?[#?!@$%^&*-]))')

    if (oneCapitalLetter.test(this.password)) {
    } else {
    }
    if (numOrSymbol.test(this.password)) {
    } else {
    }
  }

  getNameChangeHistory() {
    this.newgenSvc.getNameChangeHistory().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.nameHistory = x.collection;
      if (this.nameHistory.find(y => y.status == 'pending')) {
        this.nameReview = true;
      } else {
        this.nameReview = false;
      }
    })
    $("#fullNameModal").modal('hide')
  }

  getCountryChangeHistory() {
    this.newgenSvc.getCountryChangeHistory().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.countryHistory = x.collection;
      if (this.countryHistory.find(y => y.status == 'pending')) {
        this.historyReview = true;
      } else {
        this.historyReview = false;
      }
    })
  }

  getPhoneVerification() {
    this.newgenSvc.getPhoneVerification().subscribe(x => {
      this.userPhoneOptions = x.collection[0];
    })
  }

  getProfileSettings() {
    this.newgenSvc.getProfileSettings().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.tshirtProfile = x.collection.find((y: any) => this.tshirtProfile.typeId == y.typeId)
      this.shirtSize = this.tshirtProfile.value || "0";
    })
  }

  socialSettingUpdate() {
    this.tshirtProfile.value = this.shirtSize;
    this.newgenSvc.socialSettingUpdate(this.tshirtProfile).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.loading = false;
    })
  }

  saveAdvanced() {
    let array: any = []
    this.loading = true;
    if (this.shirtSize !== "0") {
      array.push(this.newgenSvc.socialSettingUpdate(this.tshirtProfile))
    }
    if (this.gender !== "0") {
      let person: Person = {
        gender: this.gender
      }
      array.push(this.newgenSvc.personProfileUpdate(person))
    }
    if (this.day.toString() == '' && this.month == '99' && this.year.toString() == '') {

    }
    else {
      if (!this.bdayError) {
        let newDate = new Date()
        if (this.day.toString() == '' && this.month == '99' && this.year.toString() == '') {
          this.bdayError = false;
          return;
        }
        if (!this.day || !this.month || this.month == '99' || !this.year) {
          this.bdayError = true;
          return;
        }
        if (this.year < 1900) {
          this.bdayError = true;
          return;
        }
        if (newDate.getFullYear() - this.year < 18) {
          this.bdayError = true;
          return;
        }

        let date = moment([this.year, parseInt(this.month), this.day])
        if (!date.isValid()) {
          this.bdayError = true;
        } else {
          this.bdayError = false;
          this.birthDay = date.format('MM-DD-YYYY')
        }
        let person: Person = {
          birthDay: this.birthDay
        }
        array.push(this.newgenSvc.personProfileUpdate(person))
      }
    }

    if (array.length == 0) {
      this.loading = false;
    }
    forkJoin(array).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.loading = false;
      this.changesSaved = true;
      setTimeout(() => {
        this.changesSaved = false;
      }, 2000);
    },
      err => {
        this.loading = false;
      });

  }

  checkDate() {
    let newDate = new Date()
    if (this.day.toString() == '' && this.month == '99' && this.year.toString() == '') {
      this.bdayError = false;
      return;
    }
    if (!this.day || !this.month || this.month == '99' || !this.year) {
      this.bdayError = true;
      return;
    }
    if (this.year < 1900) {
      this.bdayError = true;
      return;
    }
    if (newDate.getFullYear() - this.year < 18) {
      this.bdayError = true;
      return;
    }

    let date = moment([this.year, parseInt(this.month), this.day])
    if (!date.isValid()) {
      this.bdayError = true;
    } else {
      this.bdayError = false;
      this.birthDay = date.format('MM-DD-YYYY')
    }
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

  getAutoships() {
    this.newgenSvc.getActiveAutoships().subscribe(x => {
      this.activeAutoships = x.collection.filter((y: any) => y.catalogTypeCode == 'sunbasket' || y.catalogTypeCode == 'smartOrder')

    })
  }

  verifyAddress() {
    this.loaderVerify = true;
    // this.confirmShow = true;
    this.confirmAddres
    this.newgenSvc.verifyAddress(this.address).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.confirmedAddresses = x.collection;
      this.loaderVerify = false;
      this.stepChange(3)
      this.selectedAddress = false;
    },
      err => {
        this.loaderVerify = false;
      })
  }

  getState() {
    // this.loader = true;
    this.newgenSvc.getCollection(8).pipe(takeUntil(this.destroyed$)).subscribe(x => {
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
      this.autoships = [];
    },
      err => {
        // this.loader = false;
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

  selectAddressProfileId(id: any) {
    this.hasWalletAmount = false;
    if (this.addressProfileId == id) {
      return;
    }
    this.addressProfileId = id;
  }

  createAddressProfile() {
    this.loaderProfile = true;
    // if (this.autoships.length > 0) {
    //   this.confirmAddres.updateAutoshipIds = this.autoships;
    // }
    this.newgenSvc.createAddressProfile(this.confirmAddres).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      // $('#confirmAddressModal').modal('hide');
      // $('#newAddressModal').modal('hide');
      this.getAddresses();
      this.loaderProfile = false;
      this.step = 1;
      // this.confirmAddres.updateAutoshipIds = [];
    },
      err => {
        this.loaderProfile = false;
      })
  }

  stepChange(step: number) {
    if (this.step == 1 && step == 2) {
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
    this.step = step;
  }

  getWalletStatus() {
    this.hasWalletAmount = false;
    this.loading = true;
    this.newgenSvc.getWalletStatus().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      let walletCollection = x.collection || [];

      for (let i = 0; i < walletCollection.length; i++) {
        var wallet = walletCollection[i];
        if (wallet.isPoint === false && (wallet.amount > 0 || wallet.couponsAmount)) {
          this.hasWalletAmount = true;
          this.loading = false;
          return;
        }
      }
      this.hasWalletAmount = false;
      this.loading = false;
      this.postCountry();
    },
      err => {
        this.loading = false;
      })
  }

  postCountry() {
    this.newgenSvc.postCountry(this.addressProfileId, 'us').pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.hasWalletAmount = false;
    })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
