import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InviteService } from '../../service/invite.service';
declare var $: any;
declare var addToCalenderJS: any;

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css'],
})
export class ThankYouComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  inviteEmail = {
    email: '',
    hash: '',
    isRussel: false,
  };
  error: string = '';
  isFormSubmitted: boolean = false;
  isRussellBrunson: boolean = false;

  constructor(
    private router: Router,
    private inviteSvc: InviteService,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.router.navigate(['/']);

    const inviteEmail = localStorage.getItem('inviteEmail') || null;
    if (inviteEmail !== null) {
      this.inviteEmail = JSON.parse(inviteEmail);
      this.isRussellBrunson = this.inviteEmail.isRussel;
    } else {
      this.router.navigate(['/']);
    }
  }

  addToCalender() {
    addToCalenderJS();
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  autoLoginToDashboard() {
    const email = this.inviteEmail.email.replace('+', '%2B');
    const hash = this.inviteEmail.hash;
    this.isFormSubmitted = true;
    this.inviteSvc
      .getAutoLoginToken('?username=' + email + '&hash=' + hash)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.isSuccess) {
            localStorage.removeItem('inviteEmail');
            localStorage.setItem('redirect', '/dashboard');
            localStorage.setItem('autoLogin', 'true');

            this.oidcSecurityService.authorize({
              customParams: {
                acr_values: 'auto_login:' + res.result,
                prompt: 'login',
              },
            });
          } else {
            this.isFormSubmitted = false;
            this.error = 'Something went wrong. Please try again later.';
          }
        },
        (error) => {
          console.log(error);
          this.isFormSubmitted = false;
          this.error = 'Something went wrong. Please try again later.';
        }
      );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
