import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-dashboard-wrapper',
  templateUrl: './dashboard-wrapper.component.html',
  styleUrls: ['./dashboard-wrapper.component.css'],
})
export class DashboardWrapperComponent implements OnInit, OnDestroy {
  public hideNav: boolean = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant!: string;
  isLoaded: boolean = false;
  discountHeight = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private newgenSvc: NewgenApiService,
    private dataService: AppDataService
  ) {
    this.tenant = environment.tenant;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (
          val.url.indexOf('/websites/') !== -1 ||
          val.url.indexOf('/training-center/') !== -1
        ) {
          this.hideNav = true;
        } else {
          this.hideNav = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    const routePath = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;
    if (routePath === '/cloud') this.router.navigateByUrl('cloud/dashboard');

    if (
      this.router.url.indexOf('/websites/') !== -1 ||
      this.router.url.indexOf('/training-center/') !== -1
    ) {
      this.hideNav = true;
    } else {
      this.hideNav = false;
    }

    if (this.tenant === 'ladyboss') {
      this.newgenSvc
        .getChampionStatus()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((x: any) => {
          if (x.isSuccess) {
            const isChampion = x.collection[0].isChampion;
            this.dataService.setChampionStatus(isChampion);
            this.isLoaded = true;
          }
        });
    } else {
      this.isLoaded = true;
      const modalName = this.route.snapshot.queryParamMap.get('modal');
      const category = this.route.snapshot.queryParamMap.get('category');
      if(modalName) {
        if(modalName === 'new_order') {
          this.openBundleBuilderModal(category ? category : '');
        }
        this.router.navigate([], {
          queryParams: {
            'modal': null,
            'category': null,
          },
          queryParamsHandling: 'merge'
        });
      }
    }
  }

  openBundleBuilderModal(category: string) {
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: { key: 'bundleBuilder', value: {autoshipOrder: null, onetimeOrder: true, category: category, modalTitle: 'New order', modalDescription: 'VIP Points will be calculated and applied at checkout.'} },
    });
    $('#bundleBuilderModal').modal('show');
    return false;
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
