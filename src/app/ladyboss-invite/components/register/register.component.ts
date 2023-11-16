import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import * as cryptojs from 'crypto-js';
import { ReplaySubject, of } from 'rxjs';
import {
  debounceTime,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { environment } from 'src/environments/environment';
import { InviteService } from '../../service/invite.service';
declare var $: any;
declare var togglePasswordJS: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  registerForm: FormGroup;
  isLoaded: boolean = false;
  isStaging: boolean = false;
  isFormSubmitted: boolean = false;
  policies: Array<number> = [];
  password = {
    charLengthError: false,
    symbolNumberError: false,
    upperCaseError: false,
  };
  isViTimerPresent: boolean = false;
  inviteToken!: any;
  sha256Salt: string = '';
  error: string = '';
  UCASE_REGEX = /[A-Z]/;
  DIGIT_REGEX = /[0-9]/;
  SYMBOL_REGEX = /[-+_!@#$%^&*,.?]/;
  discountHeight = 0;
  firstName!: string;
  isEmailFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isPhoneAvailable: boolean = true;
  isEmailAvailable: boolean = true;
  isRussellBrunson: boolean = false;
  email: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private inviteSvc: InviteService,
    private dataService: AppDataService,
    private userService: AppUserService,
    private router: Router,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.router.navigate(['/']);
    this.isStaging = environment.isStaging;
    this.sha256Salt = environment.shaSalt;
    this.registerForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(14),
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s]?[(]?[0-9]{1,3}[)]?([-s]?[0-9]{3})([-s]?[0-9]{1,4})'
        ),
      ]),
      country: new FormControl('US', Validators.required),
      checkAgree: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    const VIUser = this.userService.validateVIUserSession();
    if (!VIUser) {
      this.router.navigate(['/']);
    } else {
      if (
        (this.isStaging && VIUser.referrer === '5HWXYC') ||
        (!this.isStaging && VIUser.referrer === 'D9A4EC')
      ) {
        this.isRussellBrunson = true;
      }

      this.firstNameControl.setValue(VIUser.firstName);
      this.lastNameControl.setValue(VIUser.lastName);
      this.emailControl.setValue(VIUser.email);
      this.email = VIUser.email ? VIUser.email : '';
    }
    this.firstName = VIUser?.firstName ? VIUser.firstName : '';
    this.registerFormControls();
    this.phoneEmailVerify();
    this.getPolicies('US');
    togglePasswordJS();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get firstNameControl() {
    return this.registerForm.controls['firstName'];
  }

  get lastNameControl() {
    return this.registerForm.controls['lastName'];
  }

  get emailControl() {
    return this.registerForm.controls['email'];
  }

  get passwordControl() {
    return this.registerForm.controls['password'];
  }

  get phoneControl() {
    return this.registerForm.controls['phone'];
  }

  get countryControl() {
    return this.registerForm.controls['country'];
  }

  registerFormControls() {
    this.registerForm.controls['password'].valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value) => {
        if (value.length !== 0) {
          if (value.length >= 6 && value.length <= 14) {
            this.password.charLengthError = false;
          } else {
            this.password.charLengthError = true;
          }
          if (this.UCASE_REGEX.test(value)) {
            this.password.upperCaseError = false;
          } else {
            this.password.upperCaseError = true;
          }
          if (this.DIGIT_REGEX.test(value) || this.SYMBOL_REGEX.test(value)) {
            this.password.symbolNumberError = false;
          } else {
            this.password.symbolNumberError = true;
          }
        } else {
          this.password.charLengthError = false;
          this.password.upperCaseError = false;
          this.password.symbolNumberError = false;
        }
      });
  }

  phoneEmailVerify() {
    this.phoneControl.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroyed$),
        switchMap((value) => {
          const phone = value.replace(/\D/g, '');
          if (phone.length > 5) {
            return this.inviteSvc.checkPhone(1, phone);
          } else {
            return of({ isAvailable: true });
          }
        })
      )
      .subscribe((res) => {
        if (res.isAvailable === true) {
          this.isPhoneAvailable = true;
        } else {
          this.isPhoneAvailable = false;
        }
      });

    this.emailControl.valueChanges
      .pipe(
        startWith(this.email),
        debounceTime(1000),
        takeUntil(this.destroyed$),
        switchMap((value) => {
          if (!this.emailControl.errors) {
            const email = value.replace('+', '%2B');
            return this.inviteSvc.checkEmail(email);
          } else {
            return of({ result: { isAvailable: true } });
          }
        })
      )
      .subscribe((res) => {
        if (res?.result?.isAvailable) {
          this.isEmailAvailable = true;
        } else {
          this.isEmailAvailable = false;
        }
      });
  }

  isPasswordError() {
    return (
      this.password.charLengthError ||
      this.password.symbolNumberError ||
      this.password.upperCaseError
    );
  }

  onSubmitRegisterForm() {
    this.error = '';
    if (
      this.registerForm.invalid ||
      this.isPasswordError() ||
      this.isFormSubmitted
    )
      return;

    this.isFormSubmitted = true;

    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;

    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;
    const email = this.emailControl.value; //.replace('+', '%2B');
    const firstName = this.firstNameControl.value;
    const lastName = this.lastNameControl.value;
    const password = this.passwordControl.value;
    const country = this.countryControl.value;
    const phone = this.phoneControl.value.replace(/\D/g, '');

    const data = {
      inviteId: VIUser.inviteId,
      contactId: VIOffer?.contactId,
      linkId: VIUser?.viCode,
      referrerCode: VIUser.referrer,
      username: email,
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      name: firstName + ' ' + lastName,
      country: country,
      phoneNumber: phone,
      phoneCountry: '1',
      policies: this.policies,
    };

    this.inviteSvc
      .getAuthToken()
      .pipe(
        takeUntil(this.destroyed$),
        tap((tokenResponse: any) => {
          this.inviteToken = tokenResponse;
        }),
        switchMap(() => {
          return this.inviteSvc.registerUser(data, this.inviteToken);
        })
      )
      .subscribe(
        (res) => {
          this.isFormSubmitted = false;
          if (res.isSuccess) {
            this.clearViOffer();
            const userId = res.result.split(':')[3];
            const hash = cryptojs
              .HmacSHA256('?userId=' + userId, this.sha256Salt)
              .toString(cryptojs.enc.Hex)
              .toUpperCase();
            this.inviteSvc
              .updateNotificationSettings('?userId=' + userId + '&hash=' + hash)
              .pipe(takeUntil(this.destroyed$))
              .subscribe(
                (res) => {
                  this.autoLogin(email);
                },
                (err) => {
                  console.log(err);
                  this.autoLogin(email);
                }
              );
          } else {
            this.error = res.error?.title;
          }
        },
        (error) => {
          console.log(error);
          this.isFormSubmitted = false;
          this.error = 'Something went wrong. Please try again later.';
        }
      );
  }

  autoLogin(email: string) {
    const hash = cryptojs
      .HmacSHA256('?username=' + email, this.sha256Salt)
      .toString(cryptojs.enc.Hex)
      .toUpperCase();
    const inviteEmail = {
      email: email,
      hash: hash,
      isRussel: this.isRussellBrunson,
    };
    localStorage.setItem('inviteEmail', JSON.stringify(inviteEmail));
    this.router.navigate(['/invite/thank-you']);
  }

  getPolicies(country: string) {
    this.inviteSvc
      .getPolicies(country)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        for (let index = 0; index < x.collection.length; index++) {
          const element = x.collection[index];
          this.policies.push(element.id);
        }
      });
  }

  getViTimerStatus() {
    this.dataService.currentViTimer$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((expiryTime) => {
        if (expiryTime !== '') {
          this.isViTimerPresent = true;
        } else {
          this.isViTimerPresent = false;
        }
      });
  }

  clearViOffer() {
    localStorage.removeItem('VIOffer');
    localStorage.removeItem('VIUser');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
