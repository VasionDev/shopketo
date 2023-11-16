import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import party from 'party-js';
import { ReplaySubject, Subscription, forkJoin, of, timer } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { environment } from 'src/environments/environment';
import { AppApiService } from '../../services/app-api.service';
import { AppDataService } from '../../services/app-data.service';
import { AppUserService } from '../../services/app-user.service';
import { AppUtilityService } from '../../services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-modal-vi',
  templateUrl: './modal-vi.component.html',
  styleUrls: ['./modal-vi.component.css'],
})
export class ModalViComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('partyConfettiWrapper')
  partyConfettiWrapper!: ElementRef<HTMLElement>;
  tenant = '';
  country = '';
  offerorName = '';
  offerName = '';
  bonusValue = 0;
  minOrderValue = '';
  offerProductId = '';
  offerorImage = '';
  userFirstName = '';
  userLastName = '';
  userImage = '';
  referrer: any = {};
  discountForm: FormGroup;
  countDown!: Subscription;
  timerSeconds = 0;
  offerSuccess = false;
  isOfferInvalid = false;
  errorMessage = '';
  isFormSubmitted = false;
  contactTokenType: any;
  contactAccessToken: any;
  scrollPosition = 0;
  @Input() formDisable: boolean = false;
  client: string = '';
  count = 300;
  defaults = {
    gravity: 0.7,
    zIndex: 9999999,
  };
  isCheckoutBtnHit: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: AppApiService,
    private dataService: AppDataService,
    private userService: AppUserService,
    private websiteService: WebsiteService,
    private router: Router,
    private utilityService: AppUtilityService
  ) {
    this.tenant = environment.tenant;
    this.client = environment.clientDomain;
    this.discountForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
      checkAgree: [true, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.getReferrer();
    this.getCountry();
    this.setOfferor();
  }

  @HostListener('window:click', ['$event'])
  disableGnGModal() {
    if(this.tenant === 'pruvit') {
      const shareVIModal = document.getElementById('shareVIModal');
      if(shareVIModal) {
        $(shareVIModal).on('hidden.bs.modal', () => {
          if ($('.modal-backdrop').length) $('.modal-backdrop').remove();
          console.log('disabled gng modal on click');
          localStorage.setItem('showGngModal', 'false');
        });
      }
    }
  }

  onClickPartyConfetti() {
    if (!this.offerSuccess) return;
    const el: HTMLElement = this.partyConfettiWrapper.nativeElement;
    party.confetti(el, {
      count: party.variation.range(20, 40),
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

  backgroundScroll(isEnable: boolean) {
    if (!isEnable) {
      this.scrollPosition = window.pageYOffset;
      document.body.classList.add('block-body-scroll');
      document.body.style.top = `-${this.scrollPosition}px`;
      //if (this.checkIos()) {
      document.body.classList.add('ios');
      //}
    } else {
      document.body.classList.remove('block-body-scroll');
      document.body.classList.remove('ios');
      window.scrollTo(0, this.scrollPosition);
    }
  }

  checkIos() {
    return (
      [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
      ].includes(navigator.platform) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }

  getCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country) => {
        this.country = country;
      });
  }

  setOfferor() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;

    if (VIOffer !== null) {
      this.offerName = VIOffer.offerName;
      this.bonusValue = VIOffer.bonusValue;
      this.minOrderValue = VIOffer.minOrderValue;
      this.offerProductId = VIOffer.productId;
      this.offerorName = VIOffer.offerorName;
      this.offerorImage = VIOffer.offerorImage;
      this.userFirstName = VIOffer.offerorFirstName;
      this.userLastName = VIOffer.offerorLastName;
      this.userImage = VIOffer.userImage || 'assets/images/avatar2.png';
      this.firstNameControl.setValue(VIOffer.offerorFirstName);
      this.lastNameControl.setValue(VIOffer.offerorLastName);
      this.emailControl.setValue(VIOffer.offerorEmail);
    }
  }

  get firstNameControl() {
    return this.discountForm.controls['firstName'];
  }

  get lastNameControl() {
    return this.discountForm.controls['lastName'];
  }

  get emailControl() {
    return this.discountForm.controls['email'];
  }

  onSubmitLeadForm() {
    if (this.discountForm.invalid || this.isFormSubmitted) return;
    let { firstName, lastName, email } = this.discountForm.value;
    
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;
    let contactId = VIOffer.contactId || null;
    const source = VIOffer.offerName;
    this.isFormSubmitted = true;
    this.errorMessage = '';
    let isNewOffer = contactId === null ? true : false;

    this.websiteService
      .getContactByUserEmail(this.referrer?.userId, email)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x: any) => {
          let contactReqArr: any = [];
          contactId = x != '' ? x : contactId;
          if (contactId !== null) {
            if (
              firstName !== VIOffer.offerorFirstName ||
              lastName !== VIOffer.offerorLastName
            ) {
              contactReqArr.push(
                this.websiteService.updateContactName(contactId, firstName, lastName)
              );
            }
            if (email !== VIOffer.offerorEmail) {
              contactReqArr.push(
                this.websiteService.updateContactEmail(contactId, email)
              );
            }

            contactReqArr.push(
              this.websiteService.updateContactSource(contactId, source)
            );

            if (!contactReqArr.length) {
              contactReqArr.push(
                of({
                  isSuccess: true,
                  result: { contactId: contactId },
                })
              );
            }
          } else {
            contactReqArr.push(
              this.websiteService.createContact(
                this.referrer?.userId,
                firstName,
                lastName,
                email,
                '',
                this.country,
                source
              )
            );
          }

          forkJoin(contactReqArr)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
              (x: any) => {
                console.log(x);
                const isSuccess = x.every(
                  (el: { isSuccess: boolean }) => el.isSuccess === true
                );

                if (isSuccess && this.referrer?.userId) {
                  if (
                    x.length === 1 &&
                    contactId === null &&
                    x[0]?.result?.contactId
                  ) {
                    VIOffer.contactId = contactId = x[0].result.contactId;
                    localStorage.setItem('VIOffer', JSON.stringify(VIOffer));
                  }

                  const activity = this.websiteService
                    .createContactActivity(
                      contactId,
                      '',
                      source,
                      'Give & Get form submitted.'
                    )
                    .pipe(catchError((error) => of(error)));
                  const sysAlert = this.websiteService
                    .createSystemAlertNew(
                      this.referrer.userId,
                      firstName,
                      lastName,
                      '',
                      `<a href='vapt://contact/${contactId}'><strong>${firstName} ${lastName}</strong></a> just claimed your offer!`
                    )
                    .pipe(catchError((error) => of(error)));
                  let offerGenerate;
                  if (isNewOffer) {
                    offerGenerate = this.apiService
                      .generateOfferAndProposal(
                        this.referrer.userId,
                        contactId,
                        VIOffer.productId
                      )
                      .pipe(catchError((error) => of(error)));
                  } else {
                    offerGenerate = this.apiService
                      .getOfferProposal(VIOffer.offerId, contactId)
                      .pipe(catchError((error) => of(error)));
                  }

                  forkJoin([offerGenerate, activity])
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe((x) => {
                      console.log(x);
                      this.isFormSubmitted = false;
                      const proposalResponse = x[0];
                      if (
                        proposalResponse?.canClaimSample &&
                        proposalResponse?.credits > 0 &&
                        proposalResponse?.productSku !== ''
                      ) {
                        this.navigateRoute();
                        if (
                          $('body.drawer-open').length &&
                          $('.sk-cart__chackout-btn-wrap button').length
                        )
                          this.isCheckoutBtnHit = true;
                        this.errorMessage = '';
                        this.isOfferInvalid = false;
                        this.offerSuccess = true;

                        var localDateUtc = moment.utc(proposalResponse.offerExpiryTime);
                        var localDate = moment(localDateUtc).utcOffset(10 * 60);
                        const offerExpiryTimeString = localDate.format();
                        
                        this.startCountDown(offerExpiryTimeString);

                        const viCode = proposalResponse.offerProposalId;
                        const viProductId = proposalResponse.productSku;
                        
                        localStorage.setItem('showGngModal', 'false');
                        this.userService.setVIUser(
                          this.referrer.code,
                          'false',
                          viCode,
                          false,
                          viProductId,
                          firstName,
                          lastName,
                          email,
                          offerExpiryTimeString
                        );

                        this.dataService.setViTimer(offerExpiryTimeString);
                        this.onClickPartyConfetti();
                        //this.backgroundScroll(true);
                      } else {
                        //this.createAlertOnError(VIOffer, firstName, lastName);
                        localStorage.setItem('showGngModal', 'false');
                        this.isOfferInvalid = true;
                        this.offerSuccess = false;
                      }
                    });
                } else {
                  console.log('err');
                  localStorage.setItem('showGngModal', 'false');
                  this.errorMessage = 'Something went wrong. Please try again later.';
                  this.isFormSubmitted = false;
                }
              },
              (err: any) => {
                console.log(err);
                localStorage.setItem('showGngModal', 'false');
                this.errorMessage = 'Something went wrong. Please try again later.';
                this.isFormSubmitted = false;
              }
            );
        },
        (err: any) => {}
      );
  }

  navigateRoute() {
    let redirectRoute: string = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;
    if (this.country !== 'US') {
      redirectRoute = redirectRoute.replace(
        '/' + this.country.toLowerCase(),
        ' '
      );
    }
    redirectRoute = redirectRoute.trim();
    this.utilityService.navigateToRoute(redirectRoute);
  }

  onClickShopping() {
    if (
      this.referrer.hasOwnProperty('code') &&
      $('body.drawer-open').length &&
      $('.sk-cart__chackout-btn-wrap button').length
    ) {
      $('.sk-cart__chackout-btn-wrap button').trigger('click');
    }
  }

  createAlertOnError(VIOffer: any, firstName: string, lastName: string) {
    this.errorMessage = '';
    this.offerSuccess = false;
    this.isFormSubmitted = false;
    this.isOfferInvalid = true;
    this.websiteService
      .createSystemAlertNew(
        VIOffer.userId,
        firstName,
        lastName,
        '',
        `<a href='vapt://contact/${VIOffer.contactId}'><strong>${firstName} ${lastName}</strong></a> tried to claim your ${VIOffer.offerName} but you had no credits available. Remember to follow up!`
      )
      .pipe(
        catchError((error) => of(error)),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        console.log(x);
        localStorage.removeItem('VIUser');
        localStorage.removeItem('VIOffer');
        localStorage.removeItem('showGngModal');
        this.dataService.setViOffer(false);
        this.dataService.setViTimer('');
      });
  }

  onClaimDiscount() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;
    if (VIOffer !== null) {
      this.isFormSubmitted = true;
      this.apiService
        .getGngProposal(VIOffer.offerId, VIOffer.contactId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (x) => {
            if (x.canClaimSample && x.credits > 0 && x.productSku !== '') {
              this.isFormSubmitted = false;
              this.errorMessage = '';
              this.isOfferInvalid = false;
              this.offerSuccess = true;
              this.onClickPartyConfetti();

              const viCode = x.offerProposalId;
              const viProductId = x.productSku;
              const offerExpiryTime = x.offerExpiryTime;

              var localDateUtc = moment.utc(x.offerExpiryTime);
              var localDate = moment(localDateUtc).utcOffset(10 * 60);
              const offerExpiryTimeString = localDate.format();

              this.userService.setVIUser(
                VIOffer.refCode,
                VIOffer.promptLogin,
                viCode,
                false,
                viProductId,
                VIOffer.firstName,
                VIOffer.lastName,
                VIOffer.email,
                offerExpiryTimeString
              );
              this.startCountDown(offerExpiryTimeString);
              this.dataService.setViTimer(offerExpiryTimeString);
            } else {
              this.errorMessage = '';
              this.offerSuccess = false;
              this.isFormSubmitted = false;
              this.isOfferInvalid = true;
              localStorage.removeItem('VIUser');
              localStorage.removeItem('VIOffer');
              localStorage.removeItem('showGngModal');
              this.dataService.setViOffer(false);
              this.dataService.setViTimer('');
            }
          },
          (err: any) => {
            if (err.error.hasOwnProperty('isSuccess') && !err.error.isSuccess) {
              this.errorMessage = '';
              this.offerSuccess = false;
              this.isFormSubmitted = false;
              this.isOfferInvalid = true;
              localStorage.removeItem('VIUser');
              localStorage.removeItem('VIOffer');
              localStorage.removeItem('showGngModal');
              this.dataService.setViOffer(false);
              this.dataService.setViTimer('');
            } else {
              this.errorMessage =
                'Something went wrong. Please try again later.';
              this.offerSuccess = false;
              this.isFormSubmitted = false;
              this.isOfferInvalid = false;
            }
          }
        );
    }
  }

  private startCountDown(expiryTime: string) {
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
    const expiryDate = moment(expiryTime).valueOf(); //new Date(expiryTime);
    const now = moment().valueOf(); //new Date();
    console.log(now, expiryDate);
    this.timerSeconds = (expiryDate - now) / 1000;
    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.timerSeconds === 0) {
        if (this.countDown) {
          this.countDown.unsubscribe();
        }
      }
      --this.timerSeconds;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
  }
}
