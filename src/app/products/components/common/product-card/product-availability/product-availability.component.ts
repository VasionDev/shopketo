import { Component, Input } from '@angular/core';
import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
declare var $: any;

@Component({
  selector: 'app-product-availability',
  templateUrl: './product-availability.component.html',
  styleUrls: ['./product-availability.component.css'],
})
export class ProductAvailabilityComponent {
  @Input() accessLevels = {} as ProductAccess;
  @Input() accessLevelTitle = '';

  constructor(
    private dataService: AppDataService,
    private userService: AppUserService
  ) {}

  onClickAccessLevel() {
    this.dataService.changePostName({
      postName: 'access-level-modal',
      payload: { key: 'accessLevels', value: this.accessLevels },
    });
    $('#accessLevelModal').modal('show');
  }

  onLogin() {
    this.userService.login();
  }
}
