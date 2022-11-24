import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  SetFoodSelectedCategoryActon,
  SetFoodSelectedDietsActon,
  SetFoodSelectedSortActon,
} from 'src/app/foods/store/foods-list.actions';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-food-reset-sidebar',
  templateUrl: './food-reset-sidebar.component.html',
  styleUrls: ['./food-reset-sidebar.component.css'],
})
export class FoodResetSidebarComponent {
  constructor(
    private dataService: AppDataService,
    private store: Store<AppState>
  ) {}

  close() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }

  resetFilterAndSort() {
    this.store.dispatch(new SetFoodSelectedCategoryActon('all'));

    this.store.dispatch(new SetFoodSelectedSortActon('default'));

    this.store.dispatch(new SetFoodSelectedDietsActon([]));
  }
}
