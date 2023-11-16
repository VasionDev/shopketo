import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { CommunicationProfileService } from 'src/app/shared/services/communication-profile.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { AppDataService } from '../../shared/services/app-data.service';
import { AppUserService } from '../../shared/services/app-user.service';
import { CartStatusService } from '../services/cart-status.service';
declare var tagSliderJS: any;
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public userUrl!: string;
  public invoiceInformation: any;
  public imageCollection: Array<any> = []
  public tenant!: string;
  public loading: boolean = false;
  public cartLoading: boolean = true;
  public selectedCountry: string = '';
  public error!: string;
  public selectedRegion: any = '';
  public impersonationPresent!: boolean;
  public countryLocked: any = {
    isCountryLocked: false,
    countryCode: ''
  };
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  public scheduleCount!: number;
  public countries: Array<any> = [];
  public regions!: Array<any>;
  public isAdmin: boolean = false;
  public language: string = '';
  public country: string = '';
  public hasShownComPopUp: boolean = false;
  public hasRegions: boolean = false;
  public isStaging: boolean = false;
  public statusInfo!: any;
  constructor(
    private userEmitterService: UserEmitterService,
    private newgenSvc: NewgenApiService,
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private comProfileSvc: CommunicationProfileService,
    private userService: AppUserService,
    private cartStatusSvc: CartStatusService
  ) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    this.userUrl = environment.userURL;
  }

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
    });
    this.dataService.adminStatus$.subscribe((x: boolean) => {
      this.isAdmin = x;
    });
    this.getImpersonationStatus()
    this.getSelectedLanguage();
    this.getSelectedCountry();

    this.getPaymentReview();
    if (this.tenant == 'pruvit' && this.isStaging && !this.impersonationPresent) {
      this.getCommunicationProfile();
    }
    this.cartStatusGet();

  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (language: string) => {
          this.language = language;
        }
      )
  }

  cartStatusGet() {
    this.cartLoading = true;
    this.cartStatusSvc.cartStatusGet().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.statusInfo = x;
      this.cartLoading = false;
    })
  }

  getImpersonationStatus() {
    this.dataService.impersonationStatus$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.impersonationPresent = x;
      });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((country: string) => {
        this.country = country;
        this.setRedirectURL();
      })
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.country);
  }

  getPaymentReview() {
    this.newgenSvc.getPaymentReview().subscribe((x) => {
      this.invoiceInformation = x;
    });
  }

  getScheduleCount($event: any) {
    this.scheduleCount = $event;
  }

  getCommunicationProfile() {
    setInterval(this.getCommunicationProfile, 5 * 60 * 1000);
    if (this.hasShownComPopUp || $('.modal.show').length > 0) {
      return;
    }
    else {
      this.comProfileSvc.getUserComProfile().subscribe((x) => {
        let countryLocked = {
          isCountryLocked: false,
          countryCode: ''
        }
        if (x.result.isCountryLocked) {
          this.countryLocked.countryCode = x.result.countryCode;
          this.countryLocked.isCountryLocked = x.result.isCountryLocked;
          //broadcastSvc.$emit('isCommLocked', countryLocked)
          // communicationProfileService.setLocked(countryLocked)
        }
        else {
          // communicationProfileService.setLocked(countryLocked)
        }

        if (x.result.requiresUserInput) {
          //show pop up
          this.getAvailableCountries();
          $('#communicationModal').modal('show');


        }
        this.hasShownComPopUp = true;
      })
    }
  }

  getAvailableCountries() {
    this.comProfileSvc.getAvailableCountries().subscribe((x) => {
      this.countries = x.result.countries;


      if (this.countryLocked.isCountryLocked) {
        this.selectedCountry = this.countryLocked.countryCode;
        let findCountry = this.countries.findIndex(x => x.code == this.selectedCountry);
        this.regions = this.countries[findCountry].regions;
        if (this.regions.length > 0) {
          this.hasRegions = true;
        } else {
          this.hasRegions = false;
        }
      }
    })
  }

  getRegions() {
    let findCountry = this.countries.findIndex(x => x.code == this.selectedCountry);
    this.regions = this.countries[findCountry].regions;
    if (this.regions.length > 0) {
      this.hasRegions = true;
      this.selectedRegion = '';
    } else {
      this.hasRegions = false;
      this.selectedRegion = '';
    }
  }

  updateCommunicationProfile() {
    this.error = '';
    this.loading = true;
    if (!this.selectedRegion || this.selectedRegion == '') {
      this.selectedRegion = null;
    }
    let profile = {
      countryCode: this.selectedCountry,
      regionCode: this.selectedRegion
    }
    this.comProfileSvc.updateProfile(profile).subscribe((x) => {
      if (!x.isSuccess) {
        this.error = x.error.title;
        $('#communicationModal').modal('hide');
      }
      else {
        $('#communicationModal').modal('hide');
      }
      this.loading = false;
    },
      err => {
        this.error = err.error.title;
        this.loading = false;
        $('#communicationModal').modal('hide');
      })
  }

  logout() {
    this.userService.logOut();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
