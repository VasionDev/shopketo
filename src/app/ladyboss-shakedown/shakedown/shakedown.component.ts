import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shakedown',
  templateUrl: './shakedown.component.html',
  styleUrls: ['./shakedown.component.css']
})

export class ShakedownComponent implements OnInit, OnDestroy {
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    leadForm: FormGroup;
    isLoading = false;
    referrer: any = null;
    error = '';

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
    }
  
    createLeadForm() {
      return (this.leadForm = this.formBuilder.group({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ]),
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '[+]?(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
            ),
          ],
        ]
      }));
    }
  
    get firstNameControl() {
      return this.leadForm.controls['firstName'];
    }
  
    get lastNameControl() {
      return this.leadForm.controls['lastName'];
    }
  
    get emailControl() {
      return this.leadForm.controls['email'];
    }

    get phoneControl() {
      return this.leadForm.controls['phone'];
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
      let { firstName, lastName, email, phone } = this.leadForm.value;
      if (this.isLoading) return;
      const userId = environment.isStaging ? '936' :'668';
      this.isLoading = true;
  
      this.websiteSvc
        .createContact(
          this.referrer?.userId || userId,
          firstName,
          lastName,
          email,
          phone,
          'US',
          'SlimdownRegistration'
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
                'SlimdownRegistration',
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
                this.router.navigate(['/30day-slimdown/thankyou'], {
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
