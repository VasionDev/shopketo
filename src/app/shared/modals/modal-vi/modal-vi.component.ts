import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription, SubscriptionLike, timer } from 'rxjs';
import { exhaustMap, switchMap } from 'rxjs/operators';
import { AppApiService } from '../../services/app-api.service';
import { AppDataService } from '../../services/app-data.service';
import { AppUserService } from '../../services/app-user.service';

@Component({
  selector: 'app-modal-vi',
  templateUrl: './modal-vi.component.html',
  styleUrls: ['./modal-vi.component.css'],
})
export class ModalViComponent implements OnInit, OnDestroy {
  country = '';
  offerorName = '';
  offerorImage = '';
  discountForm: FormGroup;
  countDown!: Subscription;
  timerSeconds = 0;
  offerSuccess = false;
  isOfferInvalid = false;
  errorMessage = '';
  isFormSubmitted = false;
  contactTokenType: any;
  contactAccessToken: any;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: AppApiService,
    private dataService: AppDataService,
    private userService: AppUserService
  ) {
    this.discountForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
    });
  }

  ngOnInit(): void {
    this.getCountry();
    this.setOfferor();
  }

  getCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country) => {
        this.country = country;
      })
    );
  }

  setOfferor() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;

    if (VIOffer !== null) {
      this.offerorName = VIOffer.offerorName;
      this.offerorImage = VIOffer.offerorImage;
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

  submitDiscountForm() {
    let { firstName, lastName, email } = this.discountForm.value;

    email = email.replace('+', '%2B');

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
            if(VIOffer.contactId !== null) {
              if((firstName !== VIOffer.offerorFirstName || lastName !== VIOffer.offerorLastName) && email !== VIOffer.offerorEmail) {
                return this.apiService.updateContactNameAndEmail(
                  contactTokenResponse.token_type,
                  contactTokenResponse.access_token,
                  VIOffer.contactId,
                  firstName,
                  lastName,
                  email
                )
              }else if(firstName !== VIOffer.offerorFirstName || lastName !== VIOffer.offerorLastName) {
                return this.apiService.updateContactName(
                  contactTokenResponse.token_type,
                  contactTokenResponse.access_token,
                  VIOffer.contactId,
                  firstName,
                  lastName
                )
              }else {
                return this.apiService.updateContactEmail(
                  contactTokenResponse.token_type,
                  contactTokenResponse.access_token,
                  VIOffer.contactId,
                  email
                )
              }
            }else {
              return this.apiService.createContactId(
                contactTokenResponse.token_type,
                contactTokenResponse.access_token,
                VIOffer.userId,
                firstName,
                lastName,
                email,
                this.country
              );
            }
          })
        )
        .subscribe(
          (contactResponse: any) => {
            let isSuccess = false;
            if(Array.isArray(contactResponse)) {
              isSuccess = contactResponse.every((el: {isSuccess: boolean}) => el.isSuccess === true)
            }
            if ( isSuccess || contactResponse.isSuccess) {
              this.apiService
                .sendContactActivity(this.contactTokenType, this.contactAccessToken, VIOffer.contactId ? VIOffer.contactId : contactResponse.result.contactId).pipe(
                  switchMap((data: any) => {
                    // console.log(data)
                    return this.apiService.getGngProposal(
                      VIOffer.offerId,
                      VIOffer.contactId ? VIOffer.contactId : contactResponse.result.contactId
                    )
                  })
                )
                /*.getGngProposal(
                  VIOffer.offerId,
                  VIOffer.contactId ? VIOffer.contactId : contactResponse.result.contactId
                )*/
                .subscribe(
                  (proposalResponse: any) => {
                    this.isFormSubmitted = false;
                    // console.log(proposalResponse);
                    if (
                      proposalResponse.canClaimSample &&
                      proposalResponse.credits > 0 &&
                      proposalResponse.productSku !== ''
                    ) {
                      this.errorMessage = '';
                      this.isOfferInvalid = false;
                      this.offerSuccess = true;
                      const offerExpiryTime = new Date().getTime() + (60*60*1000);
                      const offerExpiryTimeString = new Date(offerExpiryTime).toLocaleString();
                      this.startCountDown(offerExpiryTimeString);

                      const viCode = proposalResponse.offerProposalId;
                      const viProductId = proposalResponse.productSku;

                      this.userService.setVIUser(
                        VIOffer.refCode,
                        VIOffer.promptLogin,
                        viCode,
                        false,
                        viProductId,
                        firstName,
                        lastName,
                        email,
                        offerExpiryTimeString
                      );

                      this.dataService.setViTimer(
                        offerExpiryTimeString
                      );
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
                    if (
                      err.error.hasOwnProperty('isSuccess') &&
                      !err.error.isSuccess
                    ) {
                      this.errorMessage = '';
                      this.offerSuccess = false;
                      this.isFormSubmitted = false;
                      this.isOfferInvalid = true;

                      localStorage.removeItem('VIUser');
                      localStorage.removeItem('VIOffer');

                      this.dataService.setViOffer(false);
                      this.dataService.setViTimer('');
                    } else {
                      this.errorMessage = 'Something went wrong. Please try again later.';
                      this.offerSuccess = false;
                      this.isFormSubmitted = false;
                      this.isOfferInvalid = false;
                    }
                  }
                );
            } else {
              this.errorMessage = 'Something went wrong. Please try again later.';
              this.offerSuccess = false;
              this.isFormSubmitted = false;
              this.isOfferInvalid = false;
            }
          },
          () => {
            this.errorMessage = 'Something went wrong. Please try again later.';
            this.offerSuccess = false;
            this.isFormSubmitted = false;
            this.isOfferInvalid = false;
          }
        );
    }
  }

  private startCountDown(expiryTime: string) {
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

  /*private startCountDown(expiryTime: string) {
    const expiryDate = new Date(
      new Date(expiryTime).toLocaleString('en-US', {
        timeZone: 'America/Chicago',
      })
    );
    const now = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'America/Chicago',
      })
    );

    this.timerSeconds = (expiryDate.getTime() - now.getTime()) / 1000;

    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.timerSeconds === 0) {
        if (this.countDown) {
          this.countDown.unsubscribe();
        }
      }

      --this.timerSeconds;
    });
  }*/

  ngOnDestroy(): void {
    if (this.countDown) {
      this.countDown.unsubscribe();
    }

    this.subscriptions.forEach((subscriber) => {
      subscriber.unsubscribe();
    });
  }
}
