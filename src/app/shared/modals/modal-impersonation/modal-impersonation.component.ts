import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppApiService } from '../../services/app-api.service';
declare var $: any;

@Component({
  selector: 'app-modal-impersonation',
  templateUrl: './modal-impersonation.component.html',
  styleUrls: ['./modal-impersonation.component.css'],
})
export class ModalImpersonationComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  name: string = '';
  errorMessage: string = '';
  isSubmitted: boolean = false;
  tenant: string = '';

  @ViewChild('impersonationForm') userForm!: NgForm;

  constructor(
    private apiService: AppApiService,
    private oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {}

  onImpersonationAdded() {
    this.errorMessage = '';
    this.isSubmitted = true;
    const token = this.oidcSecurityService.getToken();
    const LocalMVUser = sessionStorage.getItem('MVUser');
    let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    if (MVUser !== null) {
      const windowReference = window.open();
      this.apiService
        .setImpersonation(this.name, token)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (res) => {
            const currentTime = Math.floor(new Date().getTime() / 1000);
            res.expiryTime =
              currentTime + (res.expires_in ? res.expires_in : 3600);
            localStorage.setItem('ImpersonationUser', JSON.stringify(res));
            $('#impersonationModal').modal('hide');
            this.isSubmitted = false;

            const url =
              this.tenant === 'pruvit'
                ? this.router.serializeUrl(
                    this.router.createUrlTree(['cloud/dashboard'])
                  )
                : this.router.serializeUrl(
                    this.router.createUrlTree(['dashboard'])
                  );

            windowReference!.location = url;
          },
          (error) => {
            windowReference!.close();
            this.errorMessage =
              'Something went wrong. Please make sure you have entered a valid username.';
            this.isSubmitted = false;
          }
        );
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
