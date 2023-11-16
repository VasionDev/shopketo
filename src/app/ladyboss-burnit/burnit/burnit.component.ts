import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReplaySubject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-burnit',
  templateUrl: './burnit.component.html',
  styleUrls: ['./burnit.component.css']
})
export class BurnitComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  leadForm: FormGroup;
  isLoading = false;
  error = '';
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private websiteSvc: WebsiteService
  ) {
    this.leadForm = this.createLeadForm();
  }

  ngOnInit(): void {

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

  submitLeadForm() {
    let { firstName, lastName, email } = this.leadForm.value;
    if (this.isLoading) return;
    const userId = environment.isStaging ? '936' :'668';
    this.isLoading = true;

    this.websiteSvc
      .createContact(
        userId,
        firstName,
        lastName,
        email,
        '',
        'US',
        'BURNitRegistration'
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
              'BURNitRegistration',
              'Lead created!'
            )
            .pipe(
              catchError((error) => of(error)),
              takeUntil(this.destroyed$)
            )
            .subscribe((x) => {
              this.isLoading = false;
              this.router.navigate(['/burnit/confirmation'], {
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
