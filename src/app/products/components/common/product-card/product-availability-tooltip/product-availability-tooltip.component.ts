import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductAccess } from 'src/app/shared/models/product-access.model';
declare var tooltipJS: any;
declare var $: any;

@Component({
  selector: 'app-product-availability-tooltip',
  templateUrl: './product-availability-tooltip.component.html',
  styleUrls: ['./product-availability-tooltip.component.css'],
})
export class ProductAvailabilityTooltipComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() accessLevelTitle = '';
  @Input() isUserCanAccess = true;
  @Input() accessLevels = {} as ProductAccess;
  @Input() lockIconClass = 'fas fa-lock';
  tooltipText: string = '';

  constructor(
    private translate: TranslateService,
  ) {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  ngOnInit(): void {
    this.translate.getStreamOnTranslationChange('exclusively-for')
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe(res=>{
      this.tooltipText = res
    });
  }

  /*getAccessLevelTitleKey() {
    let key = '';
    if(this.accessLevels.isVisitor.on) {
      key = 'visitors';
    }else if(this.accessLevels.isCustomer.on) {
      key = 'customers';
    }else if(this.accessLevels.isPromoter.on) {
      key = 'pomoters';
    }else if(this.accessLevels.isSmartship.on) {
      key = 'vip-pruvers';
    }else if(this.accessLevels.isLoggedSmartship.on) {
      key = 'logged-in-vip-pruvers';
    }else if(this.accessLevels.isLoyalSmartship.on) {
      key = 'loyal-smartship-pruvers';
    }else if(this.accessLevels.isRank6.on) {
      key = 'champions-r6';
    }else if(this.accessLevels.isRank7.on) {
      key = '100k-pro-champs-r7';
    }else if(this.accessLevels.isRank8.on) {
      key = '250k-pro-champs-r8';
    }else if(this.accessLevels.isVipPlus.on) {
      key = 'vip-plus';
    }else {
      key = '';
    }
    return key;
  }*/

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
