import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-referral-link',
  templateUrl: './referral-link.component.html',
  styleUrls: ['./referral-link.component.css'],
})
export class ReferralLinkComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public referrer: any;
  public user: any;
  public facebookId: string = environment.facebookAppId;
  public referrerCode!: string;
  public errorMessage!: string;
  public successMessage!: string;
  public loading: boolean = false;
  @Input('isProfile')
  public isProfile: boolean = false;
  @Input('isWebsites')
  public isWebsites: boolean = false;
  @ViewChild('referrerInput', { static: false, read: ElementRef })
  public referrerInput!: ElementRef;
  constructor(
    private newgenService: NewgenApiService,
    private userEmitterService: UserEmitterService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
        if (this.user) {
          this.referrerCode = this.user.code;
        }
      });
    this.getReferrer();
  }

  getReferrer() {
    this.newgenService
      .getReferrer()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.referrer = x.collection[0];
      });
  }

  copy() {
    this.clipboard.copy(this.user.code + '.shopketo.com');
  }

  redirectFacebook() {
    window.open(
      'https://www.facebook.com/dialog/share?' +
        'app_id=' +
        this.facebookId +
        '&display=popup' +
        '&href=' +
        encodeURIComponent('https://' + this.user.code + '.shopketo.com') +
        '&redirect_uri=' +
        encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  redirectTwitter() {
    window.open(
      'https://twitter.com/intent/tweet' +
        '?url=' +
        encodeURIComponent('https://' + this.user.code + '.shopketo.com') +
        '&text=' +
        encodeURIComponent(
          'I just wanted to share with you PruvIt! Please take a look ;) '
        ),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  checkReferrerCode() {
    this.loading = true;
    this.errorMessage = '';
    if (this.user.code == this.referrerCode) {
      this.errorMessage = 'Code already in use.';
      this.loading = false;
      return;
    }
    this.newgenService
      .checkReferrerCode(this.referrerCode)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        if (!x.isSuccess) {
          this.errorMessage = 'This name is taken, try another one.';
          this.loading = false;
        } else {
          this.updateReferrerCode();
        }
      });
  }

  updateReferrerCode() {
    this.newgenService
      .updateReferrerCode(this.user.code, this.referrerCode)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.successMessage = 'Referrer code successfully changed.';
        this.user.code = this.referrerCode;
        this.loading = false;
        $('#referralModal').modal('hide');
      });
  }

  manage() {
    this.errorMessage = '';
    this.successMessage = '';
    this.referrerCode = this.user.code;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
