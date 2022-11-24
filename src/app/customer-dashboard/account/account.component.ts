import { Component, OnInit } from '@angular/core';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  public user: any;
  constructor(
    private userEmitterService: UserEmitterService,
    private userService: AppUserService
  ) {}

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
    });
  }

  logout() {
    this.userService.logOut();
  }
}
