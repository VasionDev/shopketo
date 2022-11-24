import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppDataService } from '../shared/services/app-data.service';
import { AppUserService } from '../shared/services/app-user.service';
import { AppUtilityService } from '../shared/services/app-utility.service';
import { FoodCart } from './models/food-cart.model';
import { Food } from './models/food.model';
import { FoodApiService } from './services/food-api.service';
import {
  SetFoodCategoriesActon,
  SetFoodDeliveryActon,
  SetFoodDietTypesActon,
  SetFoodDiscountInfoAction,
  SetFoodOfferActon,
  SetFoodsAction,
  SetFoodSubCategoriesActon,
  SetFoodTypesActon,
  SetPreloadedMenusActon,
  SetQuickAddMenusActon,
} from './store/foods-list.actions';
import { FoodsState } from './store/foods-list.reducer';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css'],
})
export class FoodsComponent implements OnInit, OnDestroy {
  country = '';
  isLoaded = false;
  production: boolean;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private foodApiService: FoodApiService,
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private utilityService: AppUtilityService,
    private userService: AppUserService,
    private store: Store<FoodsState>
  ) {
    this.production = environment.production;
  }

  ngOnInit(): void {
    this.checkFoodAccess();
  }

  checkFoodAccess() {
    const viCode = this.route.snapshot.queryParamMap.get('vicode');
    const referrer = this.route.snapshot.queryParamMap.get('ref');
    const promptLogin = this.route.snapshot.queryParamMap.get('promptLogin');
    const isWindowReferrer = document.referrer.includes('experienceketo.com');

    const isMVRedirected =
      this.route.snapshot.queryParamMap.get('edit_selections');

    if (
      viCode !== null &&
      referrer !== null &&
      promptLogin !== null &&
      isWindowReferrer
    ) {
      this.getFoodsWithCountry();

      this.userService.setVIUser(referrer, promptLogin, viCode);
    } else {
      if (isMVRedirected !== null && isMVRedirected === 'true') {
        this.userService.login();
      } else {
        this.getFoodsWithCountry();
      }
    }

    if (viCode !== null) {
      const removedParamsUrl = this.router.url.substring(
        0,
        this.router.url.indexOf('?')
      );
      this.location.go(removedParamsUrl);
    }
  }

  getFoodsWithCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe(
        (countryCode: string) => {
          this.country = countryCode;

          this.getFoods(countryCode);
        }
      )
    );
  }

  getFoods(country: string) {
    this.subscriptions.push(
      this.foodApiService.getFoods(country).subscribe((foodData) => {
        this.isLoaded = true;

        this.store.dispatch(new SetFoodDiscountInfoAction(foodData.discounts));
        this.store.dispatch(new SetFoodTypesActon(foodData.types));
        this.store.dispatch(new SetFoodCategoriesActon(foodData.categories));
        this.store.dispatch(
          new SetFoodSubCategoriesActon(foodData.subCategories)
        );
        this.store.dispatch(
          new SetPreloadedMenusActon(foodData.preloadedMenus)
        );
        this.store.dispatch(new SetQuickAddMenusActon(foodData.quickAddMenus));
        this.store.dispatch(new SetFoodDietTypesActon(foodData.dietTypes));
        this.store.dispatch(new SetFoodDeliveryActon(foodData.foodDelivery));
        this.store.dispatch(new SetFoodsAction(foodData.foods));
        this.store.dispatch(new SetFoodOfferActon(foodData.offers));

        this.setAutoshipFoods(foodData.foods);
        this.setRedirectURL();
      })
    );
  }

  setAutoshipFoods(foods: Food[]) {
    const LocalMVUser = sessionStorage.getItem('MVUser');
    const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const autoshipFoods: { sku: string; quantity: number }[] =
      FoodUser === null ||
      (Object.keys(FoodUser).length === 0 && FoodUser.constructor === Object)
        ? []
        : FoodUser.food_autoship_data;

    let localStorageFoods: FoodCart[] = [];

    if (autoshipFoods.length > 0) {
      foods = foods.map((food) => {
        const tempFood = Object.assign({}, food);
        tempFood.quantity = 0;

        return tempFood;
      });
    }

    const updatedFoods = foods.map((food) => {
      const tempFood = Object.assign({}, food);

      autoshipFoods.forEach((item) => {
        if (food.sku === item.sku && !food.isOutOfStock && item.quantity > 0) {
          tempFood.quantity = item.quantity;

          localStorageFoods.push({
            country: 'US',
            language: 'en',
            food: tempFood,
          });
        }
      });

      return tempFood;
    });

    if (localStorageFoods.length > 0) {
      this.store.dispatch(new SetFoodsAction(updatedFoods));
      localStorage.setItem('Foods', JSON.stringify(localStorageFoods));
      localStorage.setItem('CheckoutFoods', JSON.stringify(localStorageFoods));
    }
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.country);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
