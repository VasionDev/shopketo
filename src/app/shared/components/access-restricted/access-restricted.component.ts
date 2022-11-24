import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppDataService } from '../../services/app-data.service';
import { AppUserService } from '../../services/app-user.service';

@Component({
  selector: 'app-access-restricted',
  templateUrl: './access-restricted.component.html',
  styleUrls: ['./access-restricted.component.css'],
})
export class AccessRestrictedComponent implements OnInit, OnDestroy {
  @Input() accessLevelTitle = '';
  user: any = {};
  userAvatar = 'assets/images/avatar2.png';
  subscription!: Subscription;

  constructor(
    private userService: AppUserService,
    private dataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.subscription = this.dataService.currentUserWithScopes$.subscribe(
      (user) => {
        if (user !== null) {
          this.user = user;

          this.getUserAvatar(user);
        }
      }
    );
  }

  private getUserAvatar(user: any) {
    const userInfo = JSON.parse(user.mvuser_info);
    const imageUrl = userInfo?.collection[0]?.imageUrl;

    this.userAvatar = imageUrl ? imageUrl : 'assets/images/avatar2.png';
  }

  onLogOut() {
    this.userService.logOut();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
