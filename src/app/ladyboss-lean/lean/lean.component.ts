import { Component, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
declare var $:any;
@Component({
  selector: 'app-lean',
  templateUrl: './lean.component.html',
  styleUrls: ['./lean.component.css']
})
export class LeanComponent implements OnInit {

  isUserLoggedIn = false;
  userAvatar = '';
  constructor(private dataService: AppDataService) { }

  ngOnInit(): void {
    this.getUserAvatar();
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

}
