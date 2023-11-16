import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { environment } from 'src/environments/environment';
import { AppDataService } from '../../services/app-data.service';
import { AppUserService } from '../../services/app-user.service';
import { UserEmitterService } from '../../services/user-emitter.service';
declare var $: any;

@Component({
  selector: 'side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.css'],
})
export class SideNavigationComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public hideNav: boolean = false;
  userCountry!: string;
  tenant!: string;
  isStaging!: boolean;
  @Input() sideBar = false;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,

        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };
  public invoiceInformation: any;
  public imageCollection: Array<any> = [];
  public isAdmin: boolean = false;
  public isImpersonationPresent: boolean = false;
  public isChampion: boolean = false;
  showCarousel: boolean = false;

  constructor(
    private userService: AppUserService,
    private userEmitterService: UserEmitterService,
    private newgenSvc: NewgenApiService,
    private dataService: AppDataService,
    private router: Router
  ) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.showCarousel = this.router.url.indexOf('/dashboard') !== -1 && window.innerWidth < 769;
      }
    });
  }

  ngOnInit(): void {
    if (this.tenant === 'pruvit') this.getBanners();
    this.dataService.adminStatus$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.isAdmin = x;
      });

    this.dataService.championStatus$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.isChampion = x;
      });

    this.dataService.impersonationStatus$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.isImpersonationPresent = x;
      });

    if (this.router.url.indexOf('/dashboard') !== -1 && window.innerWidth < 769) {
      this.showCarousel = true;
    }

    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.userCountry = x?.country;
      });

    $(document).on('shown.bs.collapse', '#accordionExample', () => {
      setTimeout(() => {
        $('.drawer').drawer('softRefresh');
      }, 0);
    });
    $(document).on('hidden.bs.collapse', '#accordionExample', () => {
      setTimeout(() => {
        $('.drawer').drawer('softRefresh');
      }, 0);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  logout() {
    this.userService.logOut();
  }

  getPaymentReview() {
    this.newgenSvc.getPaymentReview().subscribe((x) => {
      this.invoiceInformation = x;
    });
  }

  getBanners() {
    this.newgenSvc.adBanners().subscribe((x) => {
      this.imageCollection = x.result.collection;
    });
  }

  onManageImpersonationAccount() {
    if (this.isImpersonationPresent) {
      if (confirm('Are you sure?')) {
        sessionStorage.removeItem('ImpersonationUser');
        this.dataService.setImpersonationStatus(false);
        close();
      }
    } else {
      this.dataService.changePostName({
        postName: 'impersonation-modal',
      });
      $('#impersonationModal').modal('show');
    }
  }

  onClickSideNavigationItem() {
    if ($('.drawer-open').length) {
      $('.drawer').drawer('close');
      $('.collapse.mobile-nav-menu-wrap').collapse('hide');
    }
  }

  onClickChampionItem() {
    const url = this.isStaging
      ? 'https://demo.ladyboss.io/#/'
      : 'https://cloud.ladyboss.io/#/';
    window.open(url, '_blank');
  }

  onClickCloseSidebar() {
    $('.drawer').drawer('close');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
