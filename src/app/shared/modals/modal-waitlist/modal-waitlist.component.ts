import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { Product } from 'src/app/products/models/product.model';
import { AppApiService } from '../../services/app-api.service';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-modal-waitlist',
  templateUrl: './modal-waitlist.component.html',
  styleUrls: ['./modal-waitlist.component.css'],
})
export class ModalWaitlistComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  waitlistForm: FormGroup;
  countries: any = [];
  referrer: any = {};
  isFormSubmitted = false;
  errorMessage: string = '';
  successMessage: string = '';
  isSuccess: boolean = false;
  contactToken: any;
  selectedCountry = '';
  userSelectedCountry = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  state: number = 0;
  @Input() product = {} as Product;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dataService: AppDataService,
    private apiService: AppApiService,
    private websiteService: WebsiteService
  ) {
    this.waitlistForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
          ),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.getPhoneCountries();
    this.getSelectedCountry();
    this.getReferrer();
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      });
  }

  get f() {
    return this.waitlistForm.controls;
  }

  getPhoneCountries() {
    this.http
      .get('assets/countries.json')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: any) => {
        this.countries = data;
      });
  }

  setUserSelectedCountryPhoneCode(country: any) {
    this.userSelectedCountry = country;
  }

  onSubmitWaitlistForm() {
    if (this.waitlistForm.invalid || this.isFormSubmitted) return;
    this.isFormSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    const phoneWithCode =
      this.userSelectedCountry.phone_code + this.f['phone'].value;
    this.websiteService
      .getContactByUserIdAndEmail(this.referrer?.userId, this.f['email'].value)
      .pipe(
        map((existingContactRes: any) =>
          this.mappedContact(existingContactRes)
        ),
        switchMap((x: any) => {
          let cmbObs = of();
          const { contact, claim, isExist } = x;
          if (isExist) {
            console.log('contact will update');
            const updatedInfo = this.updateNameAndPhone(contact, phoneWithCode);
            const updatedClaim = [
              ...claim,
              { type: 'waitlist', value: this.product.title },
            ];
            const addClaim = this.websiteService.AddCustomClaims(
              contact.contactId,
              updatedClaim
            );
            const updateSource = this.websiteService.updateContactSource(
              contact.contactId,
              this.product.title
            );
            const contactObs = of({
              isSuccess: true,
              result: contact,
              isExist: isExist,
            });
            cmbObs = forkJoin([contactObs, addClaim, updatedInfo, updateSource]);
          } else {
            console.log('contact will create');
            const newContact = this.createContact(phoneWithCode);
            const contactObs = of({
              isSuccess: true,
              isExist: false,
            });
            cmbObs = forkJoin([newContact, contactObs]);
          }
          return cmbObs.pipe(
            switchMap((contactResponse: any) => {
              console.log('contactResponse', contactResponse);
              const contactId = contactResponse[0].result.contactId;

              const activity = this.websiteService
                .createContactActivity(
                  contactId,
                  '',
                  'Product Page - WaitList',
                  `Joined waitlist for ${this.product.title}`
                )
                .pipe(catchError((error) => of(error)));
              const sysAlert = this.websiteService
                .createSystemAlertNew(
                  this.referrer?.userId,
                  this.f['firstName'].value,
                  this.f['lastName'].value,
                  '',
                  `<a href='vapt://contact/${contactId}'><strong>${this.f['firstName'].value} ${this.f['lastName'].value}</strong></a> joined your waitlist for ${this.product.title}!`
                )
                .pipe(catchError((error) => of(error)));
              return forkJoin([activity, sysAlert]);
            })
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        (response: any) => {
          console.log('forkResponse', response);
          const activiyResponse = response[0];
          const alertResponse = response[1];
          if (activiyResponse.isSuccess || alertResponse.isSuccess) {
            this.successMessage = 'Contact submitted successfully.';
            this.isFormSubmitted = false;
            this.isSuccess = true;
            this.state = 1;
          }
        },
        (err: any) => {
          console.log(err);
          this.errorMessage = 'Something went wrong. Please try again later.';
          this.isFormSubmitted = false;
        },
        () => {
          this.isFormSubmitted = false;
        }
      );
  }

  private createContact(phone: string) {
    return this.websiteService.createContact(
      this.referrer?.userId,
      this.f['firstName'].value,
      this.f['lastName'].value,
      this.f['email'].value,
      phone,
      this.selectedCountry,
      this.product.title,
      'waitlist',
      this.product.title
    );
  }

  private updateNameAndPhone(contact: any, phoneWithCode: string) {
    if (
      (contact.givenName !== this.f['firstName'].value ||
        contact.familyName !== this.f['lastName'].value) &&
      (!contact.hasOwnProperty('phoneNumber') ||
        contact.phoneNumber !== phoneWithCode)
    ) {
      console.log('name & phoneNumber will update');
      const updateContact = this.websiteService.updateContactName(
        contact.contactId,
        this.f['firstName'].value,
        this.f['lastName'].value
      );

      const updatePhone = this.websiteService.updateContactPhone(
        contact.contactId,
        phoneWithCode
      );
      return forkJoin([updateContact, updatePhone]);
    } else if (
      contact.givenName !== this.f['firstName'].value ||
      contact.familyName !== this.f['lastName'].value
    ) {
      console.log('name will update');
      return this.websiteService.updateContactName(
        contact.contactId,
        this.f['firstName'].value,
        this.f['lastName'].value
      );
    } else if (
      !contact.hasOwnProperty('phoneNumber') ||
      contact.phoneNumber !== phoneWithCode
    ) {
      console.log('phoneNumber will update');
      return this.websiteService.updateContactPhone(
        contact.contactId,
        phoneWithCode
      );
    } else {
      console.log(`contact won't not update`);
      return of({
        isSuccess: true,
        result: contact,
        isExist: true,
      });
    }
  }

  private mappedContact(contactRes: any) {
    const contact = contactRes && contactRes.isSuccess ? contactRes.result : null;
    const isExist =
      contact && contact.hasOwnProperty('contactId') ? true : false;
    const customClaim = isExist
      ? contact.customClaims.filter(
          (claim: any) =>
            claim.type === 'waitlist' && claim.value !== this.product.title
        )
      : [];
    return { contact: contact, claim: customClaim, isExist: isExist };
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
