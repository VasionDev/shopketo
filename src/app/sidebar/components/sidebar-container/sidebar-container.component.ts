import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-sidebar-container',
  templateUrl: './sidebar-container.component.html',
  styleUrls: ['./sidebar-container.component.css'],
})
export class SidebarContainerComponent implements AfterViewInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any = null;
  public userAvatar: string ='';
  constructor(private dataService: AppDataService) {
    this.getUser();
  }

  getUser() {
    this.dataService.currentUserWithScopes$
    .pipe(takeUntil(this.destroyed$))
    .subscribe((user) => {
      if(user) {
        this.user = user;
        const userInfo = JSON.parse(user.mvuser_info);
        const imageUrl = userInfo?.collection[0]?.imageUrl;
        this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  onClickClose() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
