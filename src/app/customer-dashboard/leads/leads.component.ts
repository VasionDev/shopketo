import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ReplaySubject, forkJoin, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InviteService } from 'src/app/ladyboss-invite/service/invite.service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { BonusService } from 'src/app/shared/services/bonus.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { WebsiteService } from '../websites/service/websites-service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css'],
})
export class LeadsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant!: string;
  isLoaded: boolean = false;
  openContacts: any = [];
  closedContacts: any = [];
  activeLead: any = {
    contactId: '',
    givenName: '',
    familyName: '',
    email: '',
    phoneNumber: '',
    status: {
      translation: 'Joined',
      value: 'Joined',
    },
    inviteLink: {
      title: '',
      link: '',
      expiresAt: '',
    },
  };
  leadForm!: FormGroup;
  activeModal: string = 'manageLead';
  isLeadFormSubmitted: boolean = false;
  genericError: boolean = false;
  phoneCountries: Array<any> = [];
  selectedCountryInd = 42;
  selectedCountry: any = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  user!: any;
  bonuses: Array<any> = [];
  inviteErrorMsg!: string;
  error!: string;
  activeBonus: any;
  linkCopied!: boolean;
  isMobile: boolean = false;
  isInviteLinkLoaded: boolean = false;
  enableCreateInviteBtn!: boolean;
  skipRecords: number = 0;
  pageSize: number = 100;
  totalLeads: number = Number.MAX_SAFE_INTEGER;
  loadingLeads: boolean = false;

  constructor(
    private apiService: AppApiService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private userEmitterService: UserEmitterService,
    private bonusSvc: BonusService,
    private inviteSvc: InviteService,
    private clipboard: Clipboard,
    private websiteService: WebsiteService
  ) {
    this.tenant = environment.tenant;
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        navigator.userAgent
      );
  }

  ngOnInit(): void {
    this.getUser();
    this.getPhoneCountries();
    this.createLeadForm();
    this.getLeads();
  }

  getUser() {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
        if (this.user) {
          this.getBonusMeta(this.user.id);
        }
      });
  }

  getLeads() {
    this.loadingLeads = true;
    this.apiService
      .getContacts(this.skipRecords, this.pageSize)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res: any) => {
          if (res.isSuccess) {
            const contacts = res.result.records;
            this.totalLeads = res.result.total;
            contacts.forEach((contact: any, ind: number) => {
              const date =
                contact.status.value.toLowerCase() === 'joined'
                  ? new Date(contact.updatedAt)
                  : new Date(contact.dateCreated);
              const day = String(date.getDate()).padStart(2, '0');
              const month = date.toLocaleString('default', { month: 'short' });
              const year =
                date.getFullYear() < new Date().getFullYear()
                  ? date.getFullYear() + ' '
                  : '';
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              const isHot =
                84000 >
                Math.floor(Date.now() / 1000) -
                  Math.floor(date.getTime() / 1000)
                  ? true
                  : false;

              contact.dateCreated =
                month + ' ' + day + ' ' + year + 'at ' + hours + ':' + minutes;
              contact.isHot = isHot;
              if (contact.status.value.toLowerCase() === 'joined')
                this.closedContacts.push(contact);
              else this.openContacts.push(contact);
            });
            // this.skipRecords = res.result.skipRecords;
            // this.pageSize = res.result.pageSize;
            this.isLoaded = true;
            this.loadingLeads = false;
          }
        },
        (error: any) => {
          this.isLoaded = true;
        }
      );

    // this.http.get('assets/ladyboss/contact.json').subscribe(
    //   (res: any) => {
    //   },
    //   (err) => {
    //     console.log(err);
    //   }
    // );
  }

  getBonusMeta(userId: string) {
    this.bonusSvc
      .getBonusMeta(userId, 'en')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.bonuses = x.result.records;
          for (let index = 0; index < this.bonuses.length; index++) {
            const element = this.bonuses[index];
            this.getBonusCredits(this.user.id, element.id, index);
          }
        },
        (err) => {
          if (err.error.error.detail) {
            this.error = err.error.error.detail;
          }
        }
      );
  }

  getBonusCredits(userId: string, productId: string, index?: number) {
    this.bonusSvc
      .getBonusCredits(userId, productId, 'en')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.bonuses[index!].info = x.result;
          this.isLoaded = true;
        },
        (err) => {
          if (err?.error?.error?.detail) {
            this.isLoaded = true;
            this.error = err.error.error.detail;
          }
        }
      );
  }

  onCreateInviteLink(bonus: any, index: number) {
    this.inviteErrorMsg = '';
    if (bonus.isAvailable && bonus.info.availableCredits > 3) {
      this.isLeadFormSubmitted = true;
      this.inviteSvc
        .createPersonalInvite({
          composer: btoa('urn:' + this.tenant + ':profile:' + this.user.id),
          productId: bonus.info.productId,
          contactId: this.activeLead.contactId,
        })
        .subscribe(
          (response: any) => {
            console.log(response);
            this.isLeadFormSubmitted = false;
            if (response.isSuccess) {
              this.bonuses[index].info.availableCredits--;
              this.activeLead.inviteLink = {
                title: bonus.title,
                link: response.result.link,
                expiresAt: response.result.expiresAt,
              };
            } else {
              this.genericError = true;
            }
          },
          (error: any) => {
            this.isLeadFormSubmitted = false;
            if (error.error.error.detail) {
              this.inviteErrorMsg = error.error.error.detail;
            }
          }
        );
    } else {
      if (!bonus.isAvailable)
        this.inviteErrorMsg = 'This offer is not available';
      else this.inviteErrorMsg = 'No credits are available';
    }
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
      ]),
      phoneCountry: new FormControl('+1'),
    });
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

  get phoneCountryControl() {
    return this.leadForm.controls['phoneCountry'];
  }

  onClickEditLead() {
    //this.leadForm.reset();
    this.resetSelectedPhoneCountry();
    this.activeModal = 'editLead';
    let phoneCode = '+1';
    let phone = '';
    if (this.activeLead.phoneNumber) {
      for (const phoneCountry of this.phoneCountries) {
        if (this.activeLead.phoneNumber.startsWith(phoneCountry.phone_code)) {
          phone = this.activeLead.phoneNumber.split(phoneCountry.phone_code)[1];
          phoneCode = phoneCountry.phone_code;
          this.selectedCountry = {
            country_code: phoneCode === '+1' ? 'US' : phoneCountry.country_code,
            phone_code: phoneCode,
            name: phoneCountry.name,
          };
          break;
        }
      }
    }
    const leadFormData = {
      firstName: this.activeLead.givenName,
      lastName: this.activeLead.familyName,
      email: this.activeLead.email,
      phone: phone,
      phoneCountry: phoneCode,
    };

    this.leadForm.setValue(leadFormData);
  }

  resetSelectedPhoneCountry() {
    this.selectedCountry = {
      country_code: 'US',
      phone_code: '+1',
      name: 'United States',
    };
  }

  onSubmitDeleteLead() {
    this.genericError = false;
    if (confirm('Are you sure to delete the lead!')) {
      this.isLeadFormSubmitted = true;
      this.apiService.deleteContact(this.activeLead.contactId).subscribe(
        (response: any) => {
          console.log(response);
          this.isLeadFormSubmitted = false;
          if (response.isSuccess) {
            this.activeModal = 'manageLead';
            $('#manageModal').modal('hide');
            if (this.activeLead.status.value === 'Joined') {
              this.closedContacts = this.closedContacts.filter(
                (contact: any) =>
                  contact.contactId !== this.activeLead.contactId
              );
            } else {
              this.openContacts = this.openContacts.filter(
                (contact: any) =>
                  contact.contactId !== this.activeLead.contactId
              );
            }
          } else {
            this.genericError = true;
          }
        },
        (err: any) => {
          this.genericError = true;
          this.isLeadFormSubmitted = false;
        },
        () => {
          console.log('Contact deleted');
        }
      );
    }
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  onChangePhoneCountry(event: any) {
    const index = event.target.value;
    this.selectedCountry = this.phoneCountries[index];
    this.phoneCountryControl.setValue(this.selectedCountry.phone_code);
  }

  onSubmitLeadForm() {
    this.genericError = false;
    let { firstName, lastName, email, phone, phoneCountry } = this.leadForm.value;
    const phoneWithCountry = phone !== '' ? phoneCountry + phone : '';
    if (this.leadForm.valid) {
      this.isLeadFormSubmitted = true;
   
      let nameRequest, emailRequest, phoneRequest;
      if (firstName !== this.activeLead.givenName || lastName !== this.activeLead.familyName) {
          nameRequest = this.websiteService.updateContactName(this.activeLead.contactId, firstName, lastName);
      } else {
        nameRequest = of({ isSuccess: true });
      }

      if (email !== this.activeLead.email) {
        emailRequest = this.websiteService.updateContactEmail(this.activeLead.contactId, email);
      } else {
        emailRequest = of({ isSuccess: true });
      }

      if (phoneWithCountry !== '' && phoneWithCountry !== this.activeLead.phoneNumber) {
        phoneRequest = this.websiteService.updateContactPhone(this.activeLead.contactId, phoneWithCountry);
      } else {
        phoneRequest = of({ isSuccess: true });
      }

      forkJoin([nameRequest, emailRequest, phoneRequest])
        .subscribe(
          (contactResponse) => {
            console.log(contactResponse);
            const isSuccess = contactResponse.every(
              (el: any) => el.isSuccess === true
            );

            if (isSuccess) {
              if (this.activeLead.status.value === 'Joined') {
                const index = this.closedContacts.findIndex(
                  (contact: any) =>
                    contact.contactId === this.activeLead.contactId
                );
                if (index !== -1) {
                  this.closedContacts[index].givenName = firstName;
                  this.closedContacts[index].familyName = lastName;
                  this.closedContacts[index].email = email;
                  this.closedContacts[index].phoneNumber = phoneWithCountry;
                }
              } else {
                const index = this.openContacts.findIndex(
                  (contact: any) =>
                    contact.contactId === this.activeLead.contactId
                );
                if (index !== -1) {
                  this.openContacts[index].givenName = firstName;
                  this.openContacts[index].familyName = lastName;
                  this.openContacts[index].email = email;
                  this.openContacts[index].phoneNumber = phoneWithCountry;
                }
              }
              this.activeModal = 'manageLead';
            } else {
              this.genericError = true;
            }
            this.isLeadFormSubmitted = false;
          },
          (err: any) => {
            this.genericError = true;
            this.isLeadFormSubmitted = false;
          }
        );
    }
  }

  getInvitationStatusInfo(userId: string, bonus: any) {}

  copy(link: string) {
    let copy = link;
    this.clipboard.copy(copy);
    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
      this.loadTooltip();
    }, 1500);
  }

  onClickOpenLead(lead: any) {
    this.activeModal = 'manageLead';
    this.resetErrors();
    lead.inviteLink = {
      title: '',
      link: '',
      expiresAt: '',
    };
    this.activeLead = lead;
    this.isInviteLinkLoaded = false;
    this.bonusSvc
      .getInviteLink(this.user.id, lead.contactId, 'en')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res: any) => {
          console.log(res);
          if (res.isSuccess) {
            this.enableCreateInviteBtn = false;
            this.activeLead.inviteLink = {
              title: 'Early access',
              link: res.result.link,
              expiresAt: res.result.expiresAt,
            };
            this.isInviteLinkLoaded = true;
          } else {
            this.enableCreateInviteBtn = true;
          }
        },
        (err) => {
          this.isInviteLinkLoaded = true;
          this.enableCreateInviteBtn = true;
        }
      );

    if (this.isMobile) {
      if (lead.givenName.length + lead.familyName.length + 1 > 20)
        this.activeLead.marginTop = 135;
      else this.activeLead.marginTop = 90;
    }
  }

  resetErrors() {
    this.error = '';
    this.inviteErrorMsg = '';
  }

  onLoadMore() {
    this.skipRecords += this.pageSize;
    this.totalLeads = Number.MAX_SAFE_INTEGER;
    this.getLeads();
  }

  onDownloadLeads() {
    this.apiService.downloadLeadCSVFile()
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe(res=>{
      const fileName = res.headers.get('content-disposition')?.split(';')[1].split('=')[1];
      const blob: Blob = res.body as Blob;
      const refA = document.createElement("a");
      refA.setAttribute("download", fileName && fileName != '' ? fileName : 'Contacts.csv');
      refA.href = window.URL.createObjectURL(blob);
      refA.click();
    })
  }

  hasMoreLeard() {
    return (this.skipRecords + this.pageSize) < this.totalLeads;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
