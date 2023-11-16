import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { AppDataService } from '../../services/app-data.service';
declare let gtag: any;

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css'],
})
export class ContactFormComponent implements OnInit, OnDestroy {
  @Input() caller!: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  contactForm: FormGroup;
  selectedLanguage = '';
  selectedCountry = '';
  referrer: any = {};
  countries: any = [];
  isFormSubmitted: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  userSelectedCountry = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  contactToken: any;
  firstName: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dataService: AppDataService,
    private websiteService: WebsiteService
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    this.getReferrer();
    this.getSelectedCountry();
    this.getPhoneCountries();
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

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  createContactForm() {
    return this.formBuilder.group({
      interested: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
          ),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],
      checkAgree: [true, Validators.requiredTrue],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  getPhoneCountries() {
    this.http.get('assets/countries.json').subscribe((data) => {
      this.countries = data;
    });
  }

  setUserSelectedCountryPhoneCode(country: any) {
    this.userSelectedCountry = country;
  }

  onSubmitContactForm() {
    if (this.contactForm.invalid || this.isFormSubmitted) return;
    let { firstName, lastName, email, phone, interested } = this.contactForm.value;
    const phoneWithCountry = phone !== '' ? this.userSelectedCountry.phone_code + phone : '';
    const source = this.caller === 'learn' ? 'Learn Page - Help' : 'Me Page';
    this.isFormSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    let contactId = '';

    this.websiteService
      .getContactByUserEmail(this.referrer?.userId, email)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x: any) => {
          let contactReqArr: any = [];
          contactId = x != '' ? x : '';
          if (contactId !== '') {
            contactReqArr.push(
              this.websiteService.updateContactName(contactId, firstName, lastName)
            );
            contactReqArr.push(
              this.websiteService.updateContactSource(contactId, source)
            );
            if(phoneWithCountry) {
              contactReqArr.push(
                this.websiteService.updateContactPhone(contactId, phoneWithCountry)
              );
            }
          } else {
            contactReqArr.push(
              this.websiteService
                .createContact(
                  this.referrer?.userId,
                  firstName,
                  lastName,
                  email,
                  phoneWithCountry,
                  this.selectedCountry,
                  source
                )
            );
          }

          forkJoin(contactReqArr)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
              (x: any) => {
                const isSuccess = x.every(
                  (el: { isSuccess: boolean }) => el.isSuccess === true
                );
                if (isSuccess) {
            
                  if (x.length === 1 && contactId === '' && x[0]?.result?.contactId) {
                    contactId = x[0].result.contactId;
                  }

                  const activity = this.websiteService
                    .createContactActivity(contactId, interested, source)
                    .pipe(catchError((error) => of(error)));
                  const sysAlert = this.websiteService
                    .createSystemAlertNew(
                      this.referrer.userId,
                      firstName,
                      lastName,
                      '',
                      `<a href='vapt://contact/${contactId}'><strong>${firstName} ${lastName}</strong></a> is interested in ${interested}!`
                    )
                    .pipe(catchError((error) => of(error)));
      
                  forkJoin([activity, sysAlert])
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe((x) => {
                      this.firstName = firstName;
                      this.successMessage = 'Form submitted successfully.';
                      this.isFormSubmitted = false;
                    });
                  if(typeof gtag !== 'undefined')
                    gtag('event', `Completed Request Form - ${interested}`, {
                      'event_category': 'Conversion Events',
                      'event_label': `Completed Request Form - ${interested}`
                    });
                } else {
                  this.errorMessage = 'Something went wrong. Please try again later.';
                  this.isFormSubmitted = false;
                }
              },
              (err: any) => {
                console.log(err);
                this.errorMessage = 'Something went wrong. Please try again later.';
                this.isFormSubmitted = false;
              },
              () => {
                this.contactForm.reset({ interested: '', checkAgree: true });
                this.isFormSubmitted = false;
              }
            );
        },
        (err: any) => {
          console.log(err);
          this.errorMessage = 'Something went wrong. Please try again later.';
          this.isFormSubmitted = false;
        }
      );

    
      
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
