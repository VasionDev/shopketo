import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  leadForm: FormGroup;
  discountHeight = 0;
  isLoaded: boolean = false;
  isLoading: boolean = false;
  referrer: any = null;
  country: string = '';
  contactTokenType: string = '';
  contactAccessToken: string = '';
  error: string = '';
  faqs: any = [];
  settings = {
    eventDate: '',
    countdownDate: '',
    fbGroup: '',
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: AppDataService,
    private apiService: AppApiService,
    private websiteSvc: WebsiteService,
    private http: HttpClient
  ) {
    this.leadForm = this.createLeadForm();
  }

  ngOnInit(): void {
    this.getCountry();
    this.getReferrer();
    this.http.get('assets/ladyboss/challenge-faq.json').subscribe((x) => {
      this.faqs = x;
    });

    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (data?.challengeSettings) {
          this.settings = data.challengeSettings;
        }
      });
  }

  createLeadForm() {
    return (this.leadForm = this.formBuilder.group({
      fullName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s]?[(]?[0-9]{1,3}[)]?([-s]?[0-9]{3})([-s]?[0-9]{1,4})'
        ),
      ]),
    }));
  }

  get fullNameControl() {
    return this.leadForm.controls['fullName'];
  }

  get emailControl() {
    return this.leadForm.controls['email'];
  }

  get phoneControl() {
    return this.leadForm.controls['phone'];
  }

  getCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country) => {
        this.country = country;
      });
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

  submitLeadForm() {
    let { fullName, email, phone } = this.leadForm.value;
    if (this.isLoading) return;
    let firstName: string,
      lastName: string,
      middleName: string = '';
    let nameParts = fullName.split(' ');

    firstName = nameParts[0];

    if (nameParts.length === 2) {
      lastName = nameParts[1];
    } else if (nameParts.length > 2) {
      middleName = nameParts[1];
      lastName = nameParts[2];
    } else {
      lastName = '';
    }

    this.isLoading = true;
    this.websiteSvc
      .createContact(
        this.referrer?.userId || 668,
        firstName,
        lastName,
        email,
        `+1${phone}`,
        this.country,
        'ChallengeFunnel'
      )
      .pipe(
        catchError((error) => of(error)),
        takeUntil(this.destroyed$)
      )
      .subscribe((contactResponse: any) => {
        console.log(contactResponse);
        if (contactResponse.isSuccess) {
          const referrer = contactResponse.result?.trackingCode;
          const contactId = contactResponse.result.contactId;
          this.websiteSvc
            .createContactActivity(
              contactId,
              '',
              'ChallengeFunnel',
              'Lead created!'
            )
            .pipe(
              catchError((error) => of(error)),
              takeUntil(this.destroyed$)
            )
            .subscribe((x) => {
              console.log(x);
              const createdTime = new Date().getTime();
              const contactInfo = {
                contactId,
                firstName,
                lastName,
                email,
                phone,
                referrer,
                createdTime,
              };
              sessionStorage.setItem('Contact', JSON.stringify(contactInfo));
              this.isLoading = false;
              this.router.navigate(['/challenge/upgrade'], {
                state: { contactSuccess: true },
              });
            });
        } else {
          this.isLoading = false;
          this.error = 'Something went wrong. Please try again later.';
        }
      });
  }

  ScrollIntoView(id: string) {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const scrollToElement = document.getElementById(id);
      const scrollToElementDistance = scrollToElement
        ? scrollToElement.offsetTop + (this.discountHeight - 20)
        : 0;
      window.scroll(0, scrollToElementDistance);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
