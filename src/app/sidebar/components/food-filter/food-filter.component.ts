import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import {
  SetFoodSelectedCategoryActon,
  SetFoodSelectedDietsActon,
  SetFoodSelectedSortActon,
} from 'src/app/foods/store/foods-list.actions';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-food-filter',
  templateUrl: './food-filter.component.html',
  styleUrls: ['./food-filter.component.css'],
})
export class FoodFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  dietTypes: string[] = [];
  categories: string[] = [];
  selectedCategory = 'all';
  selectedDiets: string[] = [];
  selectedSort = 'default';
  isSortOrFilterApplied = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getFoods();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.categories = res.categories;
        this.dietTypes = res.dietTypes;
        this.selectedCategory = res.selectedCategory;
        this.selectedDiets = res.selectedDiets;
        this.selectedSort = res.selectedSort;
      })
    );
  }

  onCategorySelect(event: any) {
    this.isSortOrFilterApplied = true;
    this.selectedCategory = event.target.value;

    this.store.dispatch(
      new SetFoodSelectedCategoryActon(this.selectedCategory)
    );
  }

  onSortSelect(event: any) {
    this.isSortOrFilterApplied = true;
    this.selectedSort = event.target.value;

    this.store.dispatch(new SetFoodSelectedSortActon(this.selectedSort));
  }

  onDietSelect(event: any) {
    this.isSortOrFilterApplied = true;

    const tempDiets = Object.assign([], [...this.selectedDiets]);

    if (event.target.checked) {
      tempDiets.push(event.target.value);
    } else {
      const dietIndex = tempDiets.findIndex(
        (diet) => diet == event.target.value
      );

      if (dietIndex > -1) {
        tempDiets.splice(dietIndex, 1);
      }
    }

    this.selectedDiets = tempDiets;

    this.store.dispatch(new SetFoodSelectedDietsActon(this.selectedDiets));
  }

  isDietSelected(diet: string) {
    const dietIndex = this.selectedDiets.findIndex(
      (selectedDiet) => selectedDiet === diet
    );

    return dietIndex !== -1;
  }

  close() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }

  resetFilterAndSort() {
    this.selectedCategory = 'all';
    this.selectedDiets = [];
    this.selectedSort = 'default';
    this.isSortOrFilterApplied = false;

    this.store.dispatch(
      new SetFoodSelectedCategoryActon(this.selectedCategory)
    );

    this.store.dispatch(new SetFoodSelectedSortActon(this.selectedSort));

    this.store.dispatch(new SetFoodSelectedDietsActon(this.selectedDiets));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
