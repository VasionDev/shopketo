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
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';
declare var $: any;
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
  settings = {
    eventDate: '',
    countdownDate: '',
    fbGroup: '',
  };
  isUserLoggedIn = false;
  userAvatar = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: AppDataService,
    private websiteSvc: WebsiteService
  ) {
    this.leadForm = this.createLeadForm();
  }

  ngOnInit(): void {
    this.getReferrer();
    this.getCountry();
    this.getUserAvatar();
    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (data?.challengeSettings) {
          this.settings = data.challengeSettings;
        }
      });
  }

  getUserAvatar() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isUserLoggedIn = true;
        const userInfo = JSON.parse(user.mvuser_info);
        const imageUrl = userInfo?.collection[0]?.imageUrl;
        this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
      } else {
        this.isUserLoggedIn = false;
      }
    });
  }

  onClickAvatar() {
    this.dataService.changeSidebarName('account');
    $('.drawer').drawer('open');
  }

  createLeadForm() {
    return (this.leadForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '[+]?(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
          ),
        ],
      ],
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
    }));
  }

  get firstNameControl() {
    return this.leadForm.controls['firstName'];
  }

  get lastNameControl() {
    return this.leadForm.controls['lastName'];
  }

  get phoneControl() {
    return this.leadForm.controls['phone'];
  }

  get emailControl() {
    return this.leadForm.controls['email'];
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
    let { firstName, lastName, phone, email } = this.leadForm.value;
    if (this.isLoading) return;
    const userId = environment.isStaging ? 936 : 668;
    this.isLoading = true;

    this.websiteSvc
      .createContact(
        this.referrer?.userId || userId,
        firstName,
        lastName,
        email,
        phone,
        this.country,
        'CakeChallengeFunnel'
      )
      .pipe(
        catchError((error) => of(error)),
        takeUntil(this.destroyed$)
      )
      .subscribe((contactResponse: any) => {
        if (contactResponse?.isSuccess) {
          const referrer = contactResponse.result?.trackingCode;
          const contactId = contactResponse.result.contactId;
          this.websiteSvc
            .createContactActivity(
              contactId,
              '',
              'CakeChallengeFunnel',
              'Lead created!'
            )
            .pipe(
              catchError((error) => of(error)),
              takeUntil(this.destroyed$)
            )
            .subscribe((x) => {
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
              $('#cakeday-sign').modal('hide');
              this.router.navigate(['/5daycakechallenge/upgrade'], {
                state: { contactSuccess: true },
              });
            });
        } else {
          this.isLoading = false;
          this.error = 'Something went wrong. Please try again later.';
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
