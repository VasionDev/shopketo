import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-thank-you-no',
  templateUrl: './thank-you-no.component.html',
  styleUrls: ['./thank-you-no.component.css']
})
export class ThankYouNoComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  discountHeight = 0;
  referrer: any = null;
  country: string = '';

  error: string = '';
  settings = {
    eventDate: '',
    countdownDate: '',
    freeFbGroup: '',
  };
  isUserLoggedIn = false;
  userAvatar = '';

  constructor(private dataService: AppDataService,) { }

  ngOnInit(): void {
    this.getUserAvatar();
    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (data?.challengeSettings) {
          this.settings = data.challengeSettings;
        }
      });
  }

  getUserAvatar() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.isUserLoggedIn = true;
        const userInfo = JSON.parse(user.mvuser_info);
        const imageUrl = userInfo?.collection[0]?.imageUrl;
        this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
      } else {
        this.isUserLoggedIn = false;
      }
    });
  }

  onClickAvatar() {
    this.dataService.changeSidebarName('account');
    $('.drawer').drawer('open');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
