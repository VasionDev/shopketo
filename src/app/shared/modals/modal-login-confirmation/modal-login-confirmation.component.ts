import { Component, Input, OnInit } from '@angular/core';
import { AppCheckoutService } from '../../services/app-checkout.service';
import { environment } from 'src/environments/environment';
import { AppDataService } from '../../services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-modal-login-confirmation',
  templateUrl: './modal-login-confirmation.component.html',
  styleUrls: ['./modal-login-confirmation.component.css']
})
export class ModalLoginConfirmationComponent implements OnInit {

  @Input() user!: any;
  userRefCode: string = '';
  userFirstName: string = '';
  tenant: string = '';

  constructor(
    private appCheckoutService: AppCheckoutService,
    private dataService: AppDataService,
  ) { 
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.userRefCode = this.user.mvuser_refCode;
    this.userFirstName = this.user.mvuser_name.split(' ')[0];
  }

  onClickCheckout() {
    $('#ConfirmationCheckoutLoginModal').modal('hide');
    let canCheckout: boolean = true;
    if (this.tenant === 'pruvit') {
      canCheckout = this.appCheckoutService.canCheckoutFromCurrentCountry();
    }
    if (!canCheckout) {
      this.dataService.changePostName({ postName: 'restrict-checkout-modal' });
      $('#RestrictCheckoutModal').modal('show');
    } else {
      this.appCheckoutService.setSupplementsCheckoutUrl(
        this.userRefCode,
        'true',
        ''
      );
    }
  }

}
