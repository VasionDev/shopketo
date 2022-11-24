import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppUserService } from '../../services/app-user.service';
import { Router, NavigationEnd } from '@angular/router';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from '../../services/app-data.service';
declare var $: any;

@Component({
  selector: 'side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.css'],
})
export class SideNavigationComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public hideNav: boolean = false;
  @Input() isDashboard = true;
  slideConfig = {
    "slidesToShow": 1, "slidesToScroll": 1, responsive: [
      {
        breakpoint: 768,

        settings: {
          slidesToShow: 2,
        },
      },
    ]
  };
  public invoiceInformation: any;
  public imageCollection: Array<any> = [];
  public isAdmin: boolean = false;
  public isImpersonationPresent: boolean = false;

  constructor(
    private userService: AppUserService,
    private newgenSvc: NewgenApiService,
    private dataService: AppDataService,
    private router: Router
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {

        if (this.router.url.indexOf("/dashboard/") != -1 && window.innerWidth < 769) {
          this.hideNav = true;
        }
        else {
          this.hideNav = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getBanners();
    this.dataService.adminStatus$.pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.isAdmin = x;
      })

    this.dataService.impersonationStatus$.pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.isImpersonationPresent = x;
      })
    if (this.router.url.indexOf("/dashboard/") != -1 && window.innerWidth < 769) {
      this.hideNav = true;
    }
  }

  logout() {
    this.userService.logOut();
  }

  getPaymentReview() {
    this.newgenSvc.getPaymentReview().subscribe(x => {
      this.invoiceInformation = x;
    })
  }

  getBanners() {
    this.newgenSvc.adBanners().subscribe(x => {
      this.imageCollection = x.result.collection;
    })
  }

  onManageImpersonationAccount() {
    if (this.isImpersonationPresent) {
      if (confirm("Are you sure?")) {
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

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
