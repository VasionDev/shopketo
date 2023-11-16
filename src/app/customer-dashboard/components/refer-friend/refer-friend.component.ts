import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { ReplaySubject, forkJoin, of, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { BonusService } from 'src/app/shared/services/bonus.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import {
  BonusGatewayInvitationResponse,
  InvitationSuccessRes,
} from '../../models/bonusGatewayInvitationResponse';
import { WebsiteService } from '../../websites/service/websites-service';
declare var $: any;
declare var tooltipJS: any;
declare var bonusOfferSliderJS: any;

@Component({
  selector: 'app-refer-friend',
  templateUrl: './refer-friend.component.html',
  styleUrls: ['./refer-friend.component.css'],
})
export class ReferFriendComponent implements OnInit, OnDestroy {
  @Input() name: string = '';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public bonuses: Array<any> = [];
  public expBonuses: Array<any> = [];
  public expiredBonuses: Array<any> = [];
  public expCredits: Array<any> = [];
  public expCreditAmount: number = 0;
  public activeBonuses: Array<any> = [];
  public phoneCountries: Array<any> = [];
  public facebookId: string = environment.facebookAppId;
  public friendInfo: any;
  public pendingLeads: any;
  public invitedFriendsInfo: InvitationSuccessRes = {
    registeredFriends: [],
    registeredFriendsCount: 0,
    pendingContacts: [],
    pendingInvitesCount: 0,
  };
  public hideWidget: boolean = false;
  public error!: string;
  public activeBonus: any = {
    title: '',
    info: {
      link: '',
      availableCredits: 0,
      totalMoneyAwarded: '',
    },
  };
  public selectedCountry: any = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  public activeModal: string = 'manage';
  public leadUser: any;
  public pendingLeadUser: any;
  public leadForm!: FormGroup;
  public linkCopied: boolean = false;
  public isLeadFormSubmitted: boolean = false;
  public contactTokenType!: string;
  public contactAccessToken!: string;
  public leadErrorMessage: string = '';
  public genericError: boolean = false;
  public recycleErrorMessage: string = '';
  public isMobile: boolean = false;
  public siteName!: string;
  public tenant!: string;
  public isStaging: boolean = false;
  public isAutologin: boolean = false;
  public isLoaded: boolean = false;
  public isVideoLoaded: boolean = false;
  public isLoadedFriend: boolean = false;
  public cardClasses: Array<string> = [
    'pink-card',
    'family-card',
    'orange-card',
    'blue-gradient-light',
    'green-gradient',
    'purple-gradient',
  ];
  requestMade: number = 0;
  @ViewChild('referrerInput', { static: false, read: ElementRef })
  public referrerInput!: ElementRef;
  public referrerCode!: string;
  public errorMessage!: string;
  public successMessage!: string;
  public loading: boolean = false;
  wistiaHTML = '';
  expBonusLoaded = false;
  expCreditIndex = 0;

  constructor(
    private bonusSvc: BonusService,
    private userEmitterService: UserEmitterService,
    private newgenService: NewgenApiService,
    private clipboard: Clipboard,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private dataService: AppDataService,
    private websiteSvc: WebsiteService
  ) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    this.siteName = this.tenant === 'pruvit' ? 'shopketo' : 'ladyboss';
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        navigator.userAgent
      );
  }
  
  ngOnInit(): void {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
        if (this.user) {
          this.referrerCode = this.user.code;
          this.getBonusMeta(this.user.id);
        }
      });
    if (this.tenant === 'pruvit') {
      this.getPhoneCountries();
      this.createLeadForm();
    }

    const autoLogin = localStorage.getItem('autoLogin') || null;
    const isAutoLogin = autoLogin ? JSON.parse(autoLogin) : false;
    if (isAutoLogin) {
      this.isAutologin = true;
      localStorage.removeItem('autoLogin');
    }
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

  getBonusMeta(userId: string) {
    this.bonusSvc
      .getBonusMeta(userId, 'en')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          [this.bonuses, this.expBonuses] = x.result.records.reduce((result: any, element: any) => {
            result[element.isExpired === false ? 0 : 1].push(element);
            return result;
          }, [[], []]);
          for (let index = 0; index < this.bonuses.length; index++) {
            this.getBonusInfo(
              this.user.id,
              this.bonuses[index],
              index,
              this.bonuses.length
            );
          }
        },
        (err) => {
          if (err.error.error.detail) {
            this.error = err.error.error.detail;
          }
        }
      );
  }

  getBonusInfo(userId: string, bonus: any, index: number, totalBonus: number) {
    const productId = bonus.id;
    const delayInSec = this.isAutologin && index === 0 ? 10000 : 0;
    timer(delayInSec)
      .pipe(
        switchMap(() => {
          const bonusReq = this.bonusSvc.getBonusInfo(userId, productId, 'en').pipe(catchError((error) => of(error)));
          const expCreditsReq = this.bonusSvc.getExpCreditsInfo(userId, productId, 'en').pipe(catchError((error) => of(error)));
          return forkJoin([bonusReq, expCreditsReq]);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        const bonusRes = x[0];
        const expCreReq = x[1];
        this.requestMade++;
        const expCredits = this.formatExpCreditsData(expCreReq, productId);

        if (expCredits.length) {
          this.bonuses[index].expCredits = expCredits[0].credits;
          this.expCredits[index] = expCredits;
        } 
        
        if (bonusRes?.isSuccess && bonusRes?.result !== null) {
          const diffTime = Math.floor(new Date(bonus.expirationDate).getTime() / 1000) - Math.floor(Date.now() / 1000);
          if (diffTime < 90 * 86400) {
            bonus.expiresIn = bonus.expirationDate;
          }
          if(bonus.id === 'urn:pruvit:product:give-n-get-100') bonus.cardClass = 'orange-card';
          if(bonus.id === 'urn:pruvit:product:give-n-get-50') bonus.cardClass = 'purple-gradient';
          if(bonus.id === 'urn:pruvit:product:give-n-get-20') bonus.cardClass = 'family-card';
          if(bonus.id === 'urn:pruvit:product:give-n-get-pb-02') bonus.cardClass = 'blue-gradient-light';
          bonus.info = bonusRes.result;
          this.activeBonuses[index] = bonus;
        }
        
        if (totalBonus === this.requestMade) {
          this.activeBonuses = this.activeBonuses.filter((elm) => elm).sort((a, b) => {
            return parseInt(b.giveValue.replace(/^\D+/g, '')) - parseInt(a.giveValue.replace(/^\D+/g, ''));
          });
          this.loadBonusOfferSliderJS();
          this.isLoaded = true;
          this.isAutologin = false;
        }
      });
  }

  loadExpiredBonus() {
    if(!this.expBonusLoaded) {
      this.requestMade = 0;
      for (let index = 0; index < this.expBonuses.length; index++) {
          this.getExpiredBonusInfo(
            this.user.id,
            this.expBonuses[index],
            index,
            this.expBonuses.length
          );
      }
    }
  }

  getExpiredBonusInfo(userId: string, bonus: any, index: number, totalBonus: number) {
    const productId = bonus.id;
    this.bonusSvc
      .getBonusInfo(userId, productId, 'en')
      .pipe(
        catchError((error) => of(error)),
        takeUntil(this.destroyed$)
      )
      .subscribe((bonusRes) => {
        this.requestMade++;
        if (bonusRes?.isSuccess && bonusRes?.result !== null) {
          if(productId === 'urn:pruvit:product:give-n-get-100') bonus.cardClass = 'orange-card';
          if(productId === 'urn:pruvit:product:give-n-get-50') bonus.cardClass = 'purple-gradient';
          if(productId === 'urn:pruvit:product:give-n-get-20') bonus.cardClass = 'family-card';
          if(productId === 'urn:pruvit:product:give-n-get-pb-02') bonus.cardClass = 'blue-gradient-light';
          bonus.info = bonusRes.result;
          this.expiredBonuses[index] = bonus;
        }
        
        if (totalBonus === this.requestMade) {
          this.expiredBonuses = this.expiredBonuses.filter((elm) => elm);
          this.loadBonusOfferSliderJS();
          this.expBonusLoaded = true;
        }
      });
  }

  formatExpCreditsData(expCreReq: any, productId: string): any[] {
    const expireCredits: any[] = [];
    if (expCreReq.isSuccess && expCreReq.result.length) {
      expCreReq.result.forEach((credit: any) => {
        
        const days = ((moment(credit.expiresAt).valueOf() - moment().valueOf())/1000)/86400;
        if(30 >= Math.floor(days)) {
          const obj = {
            productId: productId,
            credits: credit.amount,
            expireTime: moment.tz(credit.expiresAt, "America/Chicago").format('LTS'),
            expireDate: moment.tz(credit.expiresAt, "America/Chicago").format('MMM D'),
          };
          expireCredits.push(obj);
        }
      });
    }
  
    return expireCredits;
  }
  
  loadBonusOfferSliderJS() {
    setTimeout(() => {
      bonusOfferSliderJS();
    });
  }

  copy(link: string) {
    const url = link
      ? link
      : this.isStaging
      ? this.user.code + '.mvdemo-pruvit.com'
      : this.user.code + '.shopketo.com';
    this.clipboard.copy(url);
    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
      this.loadTooltip();
    }, 1500);
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  redirectFacebook(link: string) {
    const url = link
      ? link
      : this.isStaging
      ? this.user.code + '.mvdemo-pruvit.com'
      : this.user.code + '.shopketo.com';
    window.open(
      'https://www.facebook.com/dialog/share?' +
        'app_id=' +
        this.facebookId +
        '&display=popup' +
        '&href=' +
        encodeURIComponent(url) +
        '&redirect_uri=' +
        encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  redirectTwitter(link: string) {
    const url = link
      ? link
      : this.isStaging
      ? this.user.code + '.mvdemo-pruvit.com'
      : this.user.code + '.shopketo.com';
    window.open(
      'https://twitter.com/intent/tweet' +
        '?url=' +
        encodeURIComponent(url) +
        '&text=' +
        encodeURIComponent(
          `I just wanted to share with you ${
            this.tenant === 'pruvit' ? 'PruvIt!' : '.'
          } Please take a look ;) `
        ),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  manage(bonus: any) {
    this.activeBonus = bonus;
    this.activeModal = 'manage';
    if (this.tenant === 'pruvit') {
      this.getWistiaVideoHTML();
      //this.getFriends(this.user.id, bonus.id);
      this.getLeads(this.user.id, bonus.id);
    } else {
      this.getInvitationStatusInfo(this.user.id, bonus.id);
    }
  }

  personalize() {
    this.activeModal = 'changeReferrer';
    this.errorMessage = '';
    this.successMessage = '';
    this.referrerCode = this.user.code;
  }

  getInvitationStatusInfo(userId: string, productId: string) {
    this.isLoadedFriend = false;
    this.bonusSvc
      .getInvitationStatusInfo(userId, productId, 'en')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: BonusGatewayInvitationResponse) => {
        if (res.isSuccess && res.result) {
          this.invitedFriendsInfo = res.result;
          for (
            let index = 0;
            index < this.invitedFriendsInfo.registeredFriends.length;
            index++
          ) {
            const user = this.invitedFriendsInfo.registeredFriends[index];
            if (!user.avatar) {
              user.abrv = user.name.match(/\b(\w)/g);
            }
          }

          for (
            let index = 0;
            index < this.invitedFriendsInfo.pendingContacts.length;
            index++
          ) {
            const user = this.invitedFriendsInfo.pendingContacts[index];
            const diffTime = +new Date(user.expiresAt) - Date.now();
            user.availability = diffTime > 0 ? true : false;
            if (!user.avatar) {
              user.abrv = user.name.match(/\b(\w)/g);
            }
          }
        }
        this.isLoadedFriend = true;
      });
  }

  getLeads(userId: string, productId: string) {
    this.isLoadedFriend = false;
    const apiPath = 'GetFixedReferralFriends';
    const friendRequest = this.bonusSvc
      .getFriends(userId, productId, 'en', apiPath)
      .pipe(catchError((error) => of(error)));
    const leadRequest = this.bonusSvc
      .getPendingLeads(userId, productId, 'en')
      .pipe(catchError((error) => of(error)));

    forkJoin([friendRequest, leadRequest])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.friendInfo = x[0].result;
          for (let index = 0; index < this.friendInfo.friends.length; index++) {
            const element = this.friendInfo.friends[index];
            element.profile.abrv = element.profile.name.replace(/\W*(\w)\w*/g, '$1').toUpperCase(); //element.profile.name.match(/\b(\w)/g);
            if (element.currentStep.status == 'kickbackAvailable') {
              // || element.currentStep.status == 'referralPointsAdded'
              let date = new Date(element.currentStep.availableTo).getTime();
              let newDate = new Date().getTime();
              let offSet = date - newDate;
              let days = Math.floor(offSet / (1000 * 60 * 60 * 24));
              if (days > 7) {
                element.currentStep.class = 'green';
              }
              if (days >= 1 && days <= 7) {
                element.currentStep.class = 'orange';
              }
              if (days < 1) {
                element.currentStep.class = 'red';
              }
            }
          }
          this.friendInfo.friends = [...this.friendInfo.friends];

          this.pendingLeads = x[1].result;

          for (
            let index = 0;
            index < this.pendingLeads.pendingLeads.length;
            index++
          ) {
            const user = this.pendingLeads.pendingLeads[index];
            const diffTime = +new Date(user.expiresAt) - Date.now();
            user.availability = diffTime > 0 ? true : false;
            if (!user.avatar && user.name) {
              user.abrv = user.name.match(/\b(\w)/g);
            }
          }

          this.isLoadedFriend = true;
        },
        (err) => {
          if (err.error.error.detail) {
            this.hideWidget = true;
            this.error = err.error.error.detail;
          }
        }
      );
  }

  getFriends(userId: string, productId: string) {
    this.isLoadedFriend = false;
    const apiPath =
      this.activeBonus?.id === 'urn:pruvit:product:give-n-get-pb'
        ? 'GetFixedReferralFriends'
        : 'GetFriendsInformation';
    this.bonusSvc
      .getFriends(userId, productId, 'en', apiPath)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.friendInfo = x.result;
          for (let index = 0; index < this.friendInfo.friends.length; index++) {
            const element = this.friendInfo.friends[index];
            element.profile.abrv = element.profile.name.match(/\b(\w)/g);
            if (element.currentStep.status == 'kickbackAvailable') {
              // || element.currentStep.status == 'referralPointsAdded'
              let date = new Date(element.currentStep.availableTo).getTime();
              let newDate = new Date().getTime();
              let offSet = date - newDate;
              let days = Math.floor(offSet / (1000 * 60 * 60 * 24));
              if (days > 7) {
                element.currentStep.class = 'green';
              }
              if (days >= 1 && days <= 7) {
                element.currentStep.class = 'orange';
              }
              if (days < 1) {
                element.currentStep.class = 'red';
              }
            }
          }
          this.friendInfo.friends = [...this.friendInfo.friends];
          this.isLoadedFriend = true;
        },
        (err) => {
          if (err.error.error.detail) {
            this.hideWidget = true;
            this.error = err.error.error.detail;
          }
        }
      );
  }

  getPhoneCountries() {
    this.http
      .get('assets/countries.json')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: any) => {
        this.phoneCountries = data;
      });
  }

  createLeadForm() {
    this.leadForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ]),
      phone: new FormControl('', [
        Validators.pattern(
          '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s]?[(]?[0-9]{1,3}[)]?([-s]?[0-9]{3})([-s]?[0-9]{1,4})'
        ),
      ])
    });
  }

  onSubmitLeadForm() {
    this.genericError = false;
    let { firstName, lastName, email, phone } = this.leadForm.value;
    const phoneWithCountry = phone !== '' ? this.selectedCountry.phone_code + phone : '';
    
    let contactId = '';
    if (this.leadForm.valid) {
      this.isLeadFormSubmitted = true;

      this.websiteSvc
        .getContactByUserEmail(this.user.id, email)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (x: any) => {
            let contactReqArr: any = [];
            contactId = x != '' ? x : '';
            if (contactId !== '') {
              contactReqArr.push(
                this.websiteSvc.updateContactName(contactId, firstName, lastName)
              );
              contactReqArr.push(
                this.websiteSvc.updateContactSource(contactId, 'PersonalInvite')
              );
              if(phoneWithCountry) {
                contactReqArr.push(
                  this.websiteSvc.updateContactPhone(contactId, phoneWithCountry)
                );
              }
            } else {
              contactReqArr.push(
                this.websiteSvc
                  .createContact(
                    this.user.id,
                    firstName,
                    lastName,
                    email,
                    phoneWithCountry,
                    this.selectedCountry.country_code,
                    'PersonalInvite'
                  )
              );
            }
            forkJoin(contactReqArr)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
              (x: any) => {
                const isSuccess = x.every(
                  (el: { isSuccess: boolean }) => el.isSuccess === true
                );
                if (isSuccess) {
            
                  if (x.length === 1 && contactId === '' && x[0]?.result?.contactId) {
                    contactId = x[0].result.contactId;
                  }
               
                  this.bonusSvc
                    .createPersonalInvite(
                      {
                        composer: btoa(
                          'urn:' + this.tenant + ':profile:' + this.user.id
                        ),
                        productId: this.activeBonus.info.productId,
                        recipient: contactId,
                      },
                      'en'
                    )
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe(
                      (inviteResponse: any) => {
                        this.isLeadFormSubmitted = false;
                        if (inviteResponse.isSuccess) {
                          this.activeBonus.info.availableCredits--;
                          this.activeModal = 'leadSend';
                          this.leadUser = inviteResponse.result;
                        } else {
                          this.genericError = true;
                        }
                      },
                      (err: any) => {
                        this.genericError = true;
                        this.isLeadFormSubmitted = false;
                      },
                      () => {
                        this.leadForm.reset({ phone: '' });
                        this.selectedCountry = {
                          country_code: 'US',
                          phone_code: '+1',
                          name: 'United States',
                        };
                        console.log('contat and proposal completed');
                      }
                    );
                } else {
                  this.genericError = true;
                  this.isLeadFormSubmitted = false;
                }
              },
              (err) => {
                this.leadForm.reset({ phone: '' });
                this.selectedCountry = {
                  country_code: 'US',
                  phone_code: '+1',
                  name: 'United States',
                };
                this.genericError = true;
                this.isLeadFormSubmitted = false;
              }
            )
          } 
        );  
    }
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


  onChangePhoneCountry(event: any) {
    const index = event.target.value;
    this.selectedCountry = this.phoneCountries[index];
  }

  onClickPendingLead(pendingUser: any) {
    this.pendingLeadUser = pendingUser;
    this.activeModal = 'pendingLead';
    this.loadTooltip();
  }

  onSubmitRecycleCredit(pendingUser: any) {
    this.genericError = false;
    if (confirm('Are you sure to recycle the credit!')) {
      const payLoad = {
        senderId: 'urn:pruvit:profile:' + this.user.id,
        proposalId: pendingUser.proposalId,
      };
      this.isLeadFormSubmitted = true;
      this.bonusSvc.recycleCredit(payLoad, 'en').subscribe(
        (response: any) => {
          this.isLeadFormSubmitted = false;
          if (response.isSuccess) {
            const index = this.pendingLeads.pendingLeads.findIndex(
              (item: any) => {
                return item.proposalId === pendingUser.proposalId;
              }
            );
            if (index !== -1) this.pendingLeads.pendingLeads.splice(index, 1);
            this.activeBonus.info.availableCredits++;
            this.activeModal = 'manage';
          } else {
            this.genericError = true;
          }
        },
        (err: any) => {
          console.log(err);
          this.genericError = true;
          this.isLeadFormSubmitted = false;
        }
      );
    }
  }

  errorReset() {
    this.genericError = false;
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   if (event.target.innerWidth < 768) {
  //   }
  // }

  sendEmail(link: string) {
    const url = link
      ? link
      : this.isStaging
      ? this.user.code + '.mvdemo-pruvit.com'
      : this.user.code + '.shopketo.com';
    window.location.href = `mailto:?&body=Check this out! ${url}`;
  }

  sendSMS(link: string) {
    const url = link
      ? link
      : this.isStaging
      ? this.user.code + '.mvdemo-pruvit.com'
      : this.user.code + '.shopketo.com';
    window.location.href = `sms:?&body=${url}`;
  }

  getWistiaVideoHTML() {
    const videoID = this.getWistiaVideoID();
    const watchTheVideoTranslation = 'How it works';
    const tempWistiaHTML =
      '<span class="btn btn-brand-primary btn-large btn-icon btn-watch btn-watch-videopop wistia_embed wistia_async_' +
      videoID +
      ' popover=true popoverContent=link" style="display: inline;"> <span class="p-small font-bold link-hover color-brand how-it"><i class="far fa-play-circle mr-2"></i>' +
      watchTheVideoTranslation +
      '</span></span>';
    this.wistiaHTML = videoID === '' ? '' : tempWistiaHTML;
  }

  getWistiaVideoID() {
    const videoLink =
      this.activeBonus?.videoLink !== '' ? this.activeBonus?.videoLink : '';
    let videoID = '';
    if (videoLink) {
      if (videoLink.includes('pruvit.wistia.com')) {
        videoID = videoLink.substring(videoLink.lastIndexOf('/') + 1);
      } else {
        videoID = videoLink;
      }
    }
    return videoID;
  }

  isPruvitTVPresent(videoLink: string) {
    if (videoLink !== '') {
      if (videoLink?.includes('pruvit.tv')) {
        return true;
      }
    }
    return false;
  }

  onClickPruvitTvVideo(videoLink: string) {
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
