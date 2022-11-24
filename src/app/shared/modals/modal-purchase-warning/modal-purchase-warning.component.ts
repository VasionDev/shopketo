import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetCheckoutFoodsAction } from 'src/app/foods/store/foods-list.actions';
import { setEveryMonth, setOneTime } from 'src/app/sidebar/store/cart.actions';
import { AppState } from 'src/app/store/app.reducer';
import { AppDataService } from '../../services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-modal-purchase-warning',
  templateUrl: './modal-purchase-warning.component.html',
  styleUrls: ['./modal-purchase-warning.component.css'],
})
export class ModalPurchaseWarningComponent {
  constructor(
    private dataService: AppDataService,
    private store: Store<AppState>
  ) {}

  goToCart() {
    this.dataService.changeSidebarName('checkout-cart');
    $('.drawer').drawer('open');

    $('#PurchaseWarningModal').modal('hide');
  }

  emptyCart() {
    localStorage.setItem('OneTime', JSON.stringify([]));
    localStorage.setItem('EveryMonth', JSON.stringify([]));
    localStorage.removeItem('CheckoutFoods');

    this.store.dispatch(setOneTime({ oneTimeCart: [] }));
    this.store.dispatch(setEveryMonth({ everyMonthCart: [] }));

    this.store.dispatch(new SetCheckoutFoodsAction([]));

    this.dataService.changeSidebarName('');

    this.dataService.changeCartStatus(false);

    $('#PurchaseWarningModal').modal('hide');
  }
}
