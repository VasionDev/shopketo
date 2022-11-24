import { Component, Input } from '@angular/core';
import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';

@Component({
  selector: 'app-modal-access-level',
  templateUrl: './modal-access-level.component.html',
  styleUrls: ['./modal-access-level.component.css'],
})
export class ModalAccessLevelComponent {
  @Input() accessLevels = {} as ProductAccess;

  constructor(private utilityService: AppUtilityService) {}

  onClickSmartship() {
    this.utilityService.navigateToRoute('/smartship');
  }

  onClickVip() {
    this.utilityService.navigateToRoute('/vip');
  }

  onClickPromoter() {
    this.utilityService.navigateToRoute('/promoter');
  }
}
