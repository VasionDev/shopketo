import { Component, Input } from '@angular/core';
declare var tooltipJS: any;
declare var $: any;

@Component({
  selector: 'app-product-availability-tooltip',
  templateUrl: './product-availability-tooltip.component.html',
  styleUrls: ['./product-availability-tooltip.component.css'],
})
export class ProductAvailabilityTooltipComponent {
  @Input() accessLevelTitle = '';
  @Input() isUserCanAccess = true;

  constructor() {
    $(document).ready(() => {
      tooltipJS();
    });
  }
}
