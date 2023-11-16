import { Component, Input } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { AppUserService } from '../../services/app-user.service';
import { ProductAccess } from '../../models/product-access.model';

@Component({
  selector: 'app-special-login',
  templateUrl: './special-login.component.html',
  styleUrls: ['./special-login.component.css'],
})
export class SpecialLoginComponent {
  @Input() accessLevelTitle = '';
  @Input() accessLevels!: ProductAccess;
  subscriptions: SubscriptionLike[] = [];

  constructor(private userService: AppUserService) {}

  onLogin() {
    this.userService.login();
  }
}
