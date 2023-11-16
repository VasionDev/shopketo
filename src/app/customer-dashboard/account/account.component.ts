import { Component, OnInit } from '@angular/core';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  public user: any;
  tenant: string = '';
  constructor(
    private userEmitterService: UserEmitterService,
    private userService: AppUserService
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
    });
  }

  logout() {
    this.userService.logOut();
  }
}
