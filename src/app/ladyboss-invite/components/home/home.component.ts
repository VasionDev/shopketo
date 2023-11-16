import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReplaySubject,
  Subscription,
  SubscriptionLike,
  forkJoin,
  of,
  timer,
} from 'rxjs';
import {
  catchError,
  exhaustMap,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { InviteService } from '../../service/invite.service';
declare var $: any;
declare var addToCalenderJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  policies: Array<number> = [];
  leadForm: FormGroup;
  isLoaded: boolean = false;
  isFormSubmitted: boolean = false;
  isViTimerPresent: boolean = false;
  isStaging: boolean = false;
  sha256Salt: string = '';
  offerExpiryTimeString!: any;
  error: string = '';
  inviteToken: any = '';
  referrer: any = null;
  discountHeight = 0;
  subscriptions: SubscriptionLike[] = [];
  contactTokenType: any;
  contactAccessToken: any;
  errorMessage = '';
  offerSuccess = false;
  isOfferInvalid = true;
  countDown!: Subscription;
  timerSeconds = 0;
  country = '';
  isRussellBrunson: boolean = false;
  isMasterLadyboss: boolean = false;
  leadSource: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private inviteSvc: InviteService,
    private dataService: AppDataService,
    private userService: AppUserService,
    private apiService: AppApiService,
    private router: Router,
    public utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.isStaging = environment.isStaging;
    this.sha256Salt = environment.shaSalt;
    this.leadForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
    });
  }

  ngOnInit(): void {
    this.setInviteOffer();
    this.getDiscountHeight();
    this.getCountry();
    this.getReferrer();
    this.getViTimerStatus();
  }

  addToCalender() {
    addToCalenderJS();
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((height: number) => {
        this.discountHeight = height;
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

  getCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country) => {
        this.country = country;
      });
  }

  onClickReferrerName() {
    this.dataService.changePostName({
      postName: 'referrer-modal',
      payload: { key: 'modals', value: [{ modalName: 'independentPruver' }] },
    });
  }

  setRedirect(refCode: any) {
    return;
    if (this.isStaging) {
      if (refCode) {
        window.location.href =
          'https://demofrontend.ladyboss.io/?ref=' + refCode.toLowerCase();
      } else {
        window.location.href = 'https://demofrontend.ladyboss.io';
      }
    } else {
      if (refCode) {
        window.location.href =
          'https://' + refCode.toLowerCase() + '.ladyboss.io';
      } else {
        window.location.href = 'https://ladyboss.io';
      }
    }
  }

  setInviteOffer() {
    const offerId = this.route.snapshot.queryParamMap.get('offerId');
    const contactId =
      this.route.snapshot.queryParamMap.get('contactId') ||
      this.route.snapshot.queryParamMap.get('TargetId');
    const refCode = this.route.snapshot.queryParamMap.get('referrerCode');
    const ownerId = this.route.snapshot.queryParamMap.get('OwnerId');

    if (refCode && ownerId && contactId === null) {
      const userId = ownerId.split('profile:')[1];
      this.apiService
        .getReferrerByUserId(userId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((x) => {
          console.log(x);
          this.setRedirect(x);
        });
    } else {
      this.setRedirect(refCode);
    }

    if (
      (this.isStaging && refCode?.toUpperCase() === '5HWXYC') ||
      (!this.isStaging && refCode?.toUpperCase() === 'D9A4EC')
    ) {
      this.isRussellBrunson = true;
      this.leadSource = 'RussellFunnel';
    } else if (
      (this.isStaging && refCode?.toUpperCase() === 'FT34Q7') ||
      (!this.isStaging && refCode?.toUpperCase() === '76H3PT')
    ) {
      this.isMasterLadyboss = true;
      this.leadSource = 'LadyBossFunnel';
    } else {
      this.leadSource = 'InviteFunnel';
    }

    if (offerId !== null && refCode !== null) {
      this.clearViOffer();
      if (contactId !== null) {
        this.inviteSvc
          .getAuthToken()
          .pipe(
            tap((tokenResponse: any) => {
              this.inviteSvc.setInviteAPIToken(tokenResponse);
              this.inviteToken = tokenResponse;
            }),
            switchMap(() => {
              const contactRequest = this.inviteSvc
                .getContactData(contactId)
                .pipe(catchError((error) => of(error)));

              const proposalRequest = this.inviteSvc.getProposal(
                offerId,
                contactId,
                'en',
                this.inviteToken
              );
              return forkJoin([contactRequest, proposalRequest]);
            }),
            takeUntil(this.destroyed$)
          )
          .subscribe((response: any) => {
            const contactResp = response[0];
            const proposalResp = response[1];

            const offer = proposalResp;
            const image = this.referrer?.image ? this.referrer.image : '';
            const name = this.referrer?.name ? this.referrer.name : '';

            const offerName = this.referrer?.firstName
              ? this.referrer?.firstName
              : name.split(' ')[0];
            const userId = offer.userId;
            const promptLogin = 'false';

            const firstName = contactResp.fname;
            const lastName = contactResp.lname;
            const email = contactResp.email;

            this.setInviteOfferInfo(
              userId,
              contactId,
              offerId,
              refCode,
              promptLogin,
              offerName,
              image,
              firstName,
              lastName,
              email
            );

            const viCode = proposalResp.offerProposalId;
            const viProductId = proposalResp.productSku;
            const inviteId = proposalResp?.inviteId;

            const offerExpiryTime = offer?.offerExpiryTime
              ? new Date(offer.offerExpiryTime)
              : new Date().getTime() + 60 * 60 * 1000;

            //new Date().getTime() + 60 * 60 * 1000;
            //console.log(offerExpiryTime);

            const offerExpiryTimeString = new Date(
              offerExpiryTime
            ).toLocaleString();
            //console.log(offerExpiryTimeString);

            //this.startCountDown(offerExpiryTimeString);

            this.userService.setVIUser(
              refCode,
              promptLogin,
              viCode,
              false,
              viProductId,
              firstName,
              lastName,
              email,
              offerExpiryTimeString,
              inviteId
            );

            this.firstNameControl.setValue(firstName);
            this.lastNameControl.setValue(lastName);
            this.emailControl.setValue(email);
            this.offerExpiryTimeString = offerExpiryTimeString;
            this.dataService.setViTimer(offerExpiryTimeString);
            this.isLoaded = true;
          });
      } else {
        this.inviteSvc
          .getAuthToken()
          .pipe(
            takeUntil(this.destroyed$),
            tap((tokenResponse: any) => {
              this.inviteSvc.setInviteAPIToken(tokenResponse);
              this.inviteToken = tokenResponse;
            }),
            switchMap(() => {
              return this.inviteSvc.getOffer(offerId, 'en', this.inviteToken);
              // .pipe(
              //   switchMap((offerResp) => {
              //     return this.inviteSvc
              //       .getReferrerData(refCode)
              //       .pipe(map((userData) => ({ offerResp, userData })));
              //   })
              // );
            })
          )
          .subscribe(
            (offerResp: any) => {
              const offer = offerResp;
              const image = this.referrer?.image ? this.referrer.image : '';
              const name = this.referrer?.name ? this.referrer.name : '';

              const offerName = this.referrer?.firstName
                ? this.referrer?.firstName
                : name.split(' ')[0];
              const userId = offer.userId;
              const promptLogin = 'false';

              const firstName = '';
              const lastName = '';
              const email = '';

              this.setInviteOfferInfo(
                userId,
                contactId,
                offerId,
                refCode,
                promptLogin,
                offerName,
                image,
                firstName,
                lastName,
                email
              );
              //this.openContactModal();
            },
            (err: any) => {
              this.isLoaded = true;
              console.log(err);
            },
            () => {
              this.isLoaded = true;
            }
          );
      }

      const removedParamsUrl = this.router.url.substring(
        0,
        this.router.url.indexOf('?')
      );
      this.location.go(removedParamsUrl);
    } else {
      this.checkViOffer();
      //this.isLoaded = true;
      //this.router.navigate(['/']);
    }
  }

  private setInviteOfferInfo(
    userId: string,
    contactId: string | null,
    offerId: string,
    refCode: string,
    promptLogin: string | null,
    offerorName: string | null,
    offerorImage: string | null,
    offerorFirstName: string | null,
    offerorLastName: string | null,
    offerorEmail: string | null
  ) {
    this.dataService.setViOffer(true);

    const createdTime = new Date().getTime();

    const VIOffer = {
      userId,
      contactId,
      offerId,
      refCode,
      promptLogin,
      offerorName,
      offerorImage,
      createdTime,
      offerorFirstName,
      offerorLastName,
      offerorEmail,
    };

    localStorage.setItem('VIOffer', JSON.stringify(VIOffer));
  }

  getViTimerStatus() {
    this.dataService.currentViTimer$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((expiryTime) => {
        if (expiryTime !== '') {
          this.isViTimerPresent = true;
        } else {
          this.isViTimerPresent = false;
        }
      });
  }

  checkViOffer() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;
    const refCode = VIOffer ? VIOffer?.refCode : '';

    if (
      (this.isStaging && refCode?.toUpperCase() === '5HWXYC') ||
      (!this.isStaging && refCode?.toUpperCase() === 'D9A4EC')
    ) {
      this.isRussellBrunson = true;
      this.leadSource = 'RussellFunnel';
    } else if (
      (this.isStaging && refCode?.toUpperCase() === 'FT34Q7') ||
      (!this.isStaging && refCode?.toUpperCase() === '76H3PT')
    ) {
      this.isMasterLadyboss = true;
      this.leadSource = 'LadyBossFunnel';
    } else {
      this.leadSource = 'InviteFunnel';
    }

    if (
      VIOffer !== null &&
      VIOffer.offerId !== null &&
      VIOffer.refCode !== null
    ) {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - VIOffer.createdTime) / 1000;

      if (timeDifference <= 24 * 60 * 60) {
        this.inviteSvc
          .getAuthToken()
          .pipe(
            takeUntil(this.destroyed$),
            tap((tokenResponse: any) => {
              this.inviteSvc.setInviteAPIToken(tokenResponse);
              this.inviteToken = tokenResponse;
            }),
            switchMap(() => {
              const offerRequest = this.inviteSvc.getOffer(
                VIOffer.offerId,
                'en',
                this.inviteToken
              );
              const referrerRequest = this.inviteSvc.getReferrerData(
                VIOffer.refCode
              );
              return forkJoin([offerRequest, referrerRequest]);
            })
          )
          .subscribe(([offerResp, referrerResp]) => {
            this.referrer = referrerResp;
            this.dataService.setViOffer(true);

            this.firstNameControl.setValue(VIOffer?.offerorFirstName);
            this.lastNameControl.setValue(VIOffer?.offerorLastName);
            this.emailControl.setValue(VIOffer?.offerorEmail);
            const VIUser = this.userService.validateVIUserSession();
            if (VIUser && VIUser?.expiryTime) {
              this.offerExpiryTimeString = new Date(VIUser.expiryTime);
            }

            //this.firstName = VIOffer?.offerorFirstName;
            //if (!this.isViTimerPresent) this.openContactModal();
            this.isLoaded = true;
          });
      } else {
        localStorage.removeItem('VIOffer');
        this.router.navigate(['/']);
      }
    } else {
      //this.isLoaded = true;
      this.router.navigate(['/']);
    }

    this.userService.validateVIUserSession();
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

    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;

    if (VIOffer !== null) {
      this.isFormSubmitted = true;
      this.apiService
        .getContactToken()
        .pipe(
          exhaustMap((contactTokenResponse: any) => {
            this.contactTokenType = contactTokenResponse.token_type;
            this.contactAccessToken = contactTokenResponse.access_token;
            if (VIOffer.contactId !== null) {
              if (
                (firstName !== VIOffer.offerorFirstName ||
                  lastName !== VIOffer.offerorLastName) &&
                email !== VIOffer.offerorEmail
              ) {
                const contactRequest =
                  this.apiService.updateContactNameAndEmail(
                    contactTokenResponse.token_type,
                    contactTokenResponse.access_token,
                    VIOffer.contactId,
                    firstName,
                    lastName,
                    email
                  );

                const contactSourceRequest =
                  this.apiService.updateContactSource(
                    contactTokenResponse.token_type,
                    contactTokenResponse.access_token,
                    VIOffer.contactId,
                    this.leadSource
                  );

                return forkJoin([contactRequest, contactSourceRequest]);
              } else if (
                firstName !== VIOffer.offerorFirstName ||
                lastName !== VIOffer.offerorLastName
              ) {
                const contactRequest = this.apiService.updateContactName(
                  contactTokenResponse.token_type,
                  contactTokenResponse.access_token,
                  VIOffer.contactId,
                  firstName,
                  lastName
                );

                const contactSourceRequest =
                  this.apiService.updateContactSource(
                    contactTokenResponse.token_type,
                    contactTokenResponse.access_token,
                    VIOffer.contactId,
                    this.leadSource
                  );

                return forkJoin([contactRequest, contactSourceRequest]);
              } else if (email !== VIOffer.offerorEmail) {
                const contactRequest = this.apiService.updateContactEmail(
                  contactTokenResponse.token_type,
                  contactTokenResponse.access_token,
                  VIOffer.contactId,
                  email
                );

                const contactSourceRequest =
                  this.apiService.updateContactSource(
                    contactTokenResponse.token_type,
                    contactTokenResponse.access_token,
                    VIOffer.contactId,
                    this.leadSource
                  );

                return forkJoin([contactRequest, contactSourceRequest]);
              } else {
                // return of({
                //   isSuccess: true,
                //   result: { contactId: VIOffer.contactId },
                // });
                return this.apiService.updateContactSource(
                  contactTokenResponse.token_type,
                  contactTokenResponse.access_token,
                  VIOffer.contactId,
                  this.leadSource
                );
              }
            } else {
              return this.inviteSvc.createContact(
                contactTokenResponse.token_type,
                contactTokenResponse.access_token,
                VIOffer.userId,
                firstName,
                lastName,
                email,
                this.country,
                '',
                this.leadSource
              );
            }
          })
        )
        .subscribe(
          (contactResponse: any) => {
            let isSuccess = false;
            if (Array.isArray(contactResponse)) {
              isSuccess = contactResponse.every(
                (el: { isSuccess: boolean }) => el?.isSuccess === true
              );
            } else {
              if (contactResponse?.result?.contactId) {
                VIOffer.contactId = contactResponse.result.contactId;
                localStorage.setItem('VIOffer', JSON.stringify(VIOffer));
              }
            }
            if (isSuccess || contactResponse.isSuccess) {
              this.apiService
                .sendContactActivity(
                  this.contactTokenType,
                  this.contactAccessToken,
                  VIOffer.contactId
                    ? VIOffer.contactId
                    : contactResponse.result.contactId,
                  this.leadSource,
                  'Lead form submitted'
                )
                .pipe(
                  switchMap((data: any) => {
                    return this.apiService.getGngProposal(
                      VIOffer.offerId,
                      VIOffer.contactId
                        ? VIOffer.contactId
                        : contactResponse.result.contactId
                    );
                  })
                )
                .subscribe(
                  (proposalResponse: any) => {
                    this.isFormSubmitted = false;
                    if (
                      proposalResponse.canClaimSample &&
                      proposalResponse.credits > 0 &&
                      proposalResponse.productSku !== ''
                    ) {
                      this.errorMessage = '';
                      this.isOfferInvalid = false;
                      this.offerSuccess = true;
                      const offerExpiryTime =
                        new Date().getTime() + 60 * 60 * 1000;
                      const offerExpiryTimeString = new Date(
                        offerExpiryTime
                      ).toLocaleString();

                      //this.startCountDown(offerExpiryTimeString);

                      const viCode = proposalResponse.offerProposalId;
                      const viProductId = proposalResponse.productSku;
                      const inviteId = proposalResponse?.inviteId;

                      this.userService.setVIUser(
                        VIOffer.refCode,
                        VIOffer.promptLogin,
                        viCode,
                        false,
                        viProductId,
                        firstName,
                        lastName,
                        email,
                        offerExpiryTimeString,
                        inviteId
                      );

                      this.dataService.setViTimer(offerExpiryTimeString);
                      //$('#firstNameInvite').text(firstName + ', ');
                      this.router.navigate(['/invite/register']);
                    } else {
                      this.errorMessage = '';
                      this.offerSuccess = false;
                      this.isFormSubmitted = false;
                      this.isOfferInvalid = true;

                      localStorage.removeItem('VIUser');
                      localStorage.removeItem('VIOffer');

                      this.dataService.setViOffer(false);
                      this.dataService.setViTimer('');
                    }
                  },
                  (err: any) => {
                    console.log('err', err);
                    if (
                      err.error.hasOwnProperty('isSuccess') &&
                      !err.error.isSuccess
                    ) {
                      this.errorMessage = err.error?.errors?.[0]
                        ? err.error.errors[0]
                        : '';
                      this.offerSuccess = false;
                      this.isFormSubmitted = false;
                      this.isOfferInvalid = true;

                      localStorage.removeItem('VIUser');
                      localStorage.removeItem('VIOffer');

                      this.dataService.setViOffer(false);
                      this.dataService.setViTimer('');
                    } else {
                      this.errorMessage =
                        'Something went wrong. Please try again later.';
                      this.offerSuccess = false;
                      this.isFormSubmitted = false;
                      this.isOfferInvalid = false;
                    }
                  },
                  () => {
                    console.log('contat and proposal completed');
                  }
                );
            } else {
              this.errorMessage =
                'Something went wrong. Please try again later.';
              this.offerSuccess = false;
              this.isFormSubmitted = false;
              this.isOfferInvalid = false;
            }
          },
          (err) => {
            console.log('contact error', err);
            this.errorMessage = 'Something went wrong. Please try again later.';
            this.offerSuccess = false;
            this.isFormSubmitted = false;
            this.isOfferInvalid = false;
          }
        );
    }
  }

  private startCountDown(expiryTime: string) {
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
    const expiryDate = new Date(expiryTime);
    const now = new Date();
    this.timerSeconds = (expiryDate.getTime() - now.getTime()) / 1000;
    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.timerSeconds === 0) {
        if (this.countDown) {
          this.countDown.unsubscribe();
        }
      }
      --this.timerSeconds;
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

  clearViOffer() {
    localStorage.removeItem('VIOffer');
    localStorage.removeItem('VIUser');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
  }
}
