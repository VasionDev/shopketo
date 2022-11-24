import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { UpdateNextShipmentStartActon } from '../../store/foods-list.actions';

@Component({
  selector: 'app-modal-shipping-confirm',
  templateUrl: './modal-shipping-confirm.component.html',
  styleUrls: ['./modal-shipping-confirm.component.css'],
})
export class ModalShippingConfirmComponent {
  @Input() nextRun!: string;
  @Input() shippingDate!: string;

  constructor(private store: Store<AppState>) {}

  setNextShippingDate() {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const autoshipId = FoodUser.food_autoship_id;
    const tokenType = FoodUser.token_type;
    const accessToken = FoodUser.access_token;

    this.store.dispatch(
      new UpdateNextShipmentStartActon({
        autoshipId: autoshipId,
        tokenType: tokenType,
        accessToken: accessToken,
        nextRun: this.nextRun,
      })
    );
  }
}
