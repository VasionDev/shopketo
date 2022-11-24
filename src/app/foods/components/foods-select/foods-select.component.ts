import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { FoodDiscount } from '../../models/food-discount.model';
import { QuickAddMenus } from '../../models/food-quickadd-menus.model';
import { Food } from '../../models/food.model';
import { FoodApiService } from '../../services/food-api.service';
import { FoodUtilityService } from '../../services/food-utility.service';
import {
  SetFoodsAction,
  SetQuickAddMenusActon,
  UpdateNextShipmentActon,
} from '../../store/foods-list.actions';
declare var $: any;
declare var tooltipJS: any;

export function sliderConfig(sliderLength: number) {
  let finalSlides = sliderLength >= 3 ? 3 : sliderLength;

  return {
    infinite: false,
    slidesToShow: finalSlides,
    slidesToScroll: 1,
    autoplay: false,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 768,

        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };
}

@Component({
  selector: 'app-foods-select',
  templateUrl: './foods-select.component.html',
  styleUrls: ['./foods-select.component.css'],
})
export class FoodsSelectComponent implements OnInit, OnDestroy {
  foods: Food[] = [];
  newFoods: Food[] = [];
  foodTypes: string[] = [];
  foodSubCategories: string[] = [];
  isAutoshipAvailable = false;
  discountHeight = 0;
  language = '';
  country = '';
  defaultLanguage = '';
  selectedCategory = '';
  selectedDiets: string[] = [];
  selectedSort = '';
  selectedSubCategory = 'all';
  discountInfo = {} as FoodDiscount;
  quickAddMenus = {} as QuickAddMenus;
  boxTotalPrice = 0;
  quickAddMenusList = '';
  noOfItems = 0;
  eligibleNoOfItems = 0;
  isTooltipShown = false;
  isEditSelections = false;
  autoshipScheduleOptions: {
    nextRun: string;
    expire: string;
    description: string;
  }[] = [];
  editDate = '';
  shippingDate = '';
  editOptionsTooltipTitle = '';
  currentNextRun = '';
  newFoodsSliderConfig: any;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private foodUtilityService: FoodUtilityService,
    private titleService: Title,
    private metaService: Meta,
    private foodApiService: FoodApiService,
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    $(document).on('hidden.bs.modal', '#foodDetailsModal', () => {
      $('.modal-backdrop').remove();
    });
  }

  ngOnInit(): void {
    this.setSeo();
    this.loadZipModal();
    this.getDiscountHeight();
    this.getFoods();
    this.getSelectedLanguage();
    this.getSelectedCountry();

    window.scroll(0, 0);
  }

  loadZipModal() {
    const localFoodUser = sessionStorage.getItem('MVUser');
    const FoodUser = localFoodUser ? JSON.parse(localFoodUser) : null;

    const autoshipFoods: { sku: string; quantity: number }[] =
      FoodUser === null ||
      (Object.keys(FoodUser).length === 0 && FoodUser.constructor === Object)
        ? []
        : FoodUser.food_autoship_data;

    if (FoodUser !== null && autoshipFoods.length === 0) {
      this.dataService.changePostName({ postName: 'zip-modal' });
      $('#userZipModal').modal('show');
    }
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.language = language;

          this.getDefaultLanguage();
        }
      )
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.country = country;
      })
    );
  }

  getDefaultLanguage() {
    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }

        this.defaultLanguage = data.productsData.default_lang;
      })
    );
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.foods = res.foods;
        this.foodTypes = res.types;
        this.foodSubCategories = res.subCategories;
        this.discountInfo = res.discountsInfo;
        this.quickAddMenus = res.quickAddMenus;
        this.newFoods = res.foods.filter((food) => food.isNew);

        this.selectedDiets = res.selectedDiets;
        this.selectedCategory = res.selectedCategory;
        this.selectedSort = res.selectedSort;

        this.noOfItems = res.boxes.noOfItems;

        this.eligibleNoOfItems =
          this.discountInfo.itemsPerBox && this.discountInfo.maxBoxes
            ? this.discountInfo.itemsPerBox * this.discountInfo.maxBoxes
            : 0;

        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          let quickAddPrice = 0;

          this.quickAddMenus.menus.forEach((item) => {
            if (item.id === food.id && !food.isOutOfStock) {
              quickAddPrice = food.price * item.quantity;
            }
          });

          return sum + quickAddPrice;
        }, 0);

        this.quickAddMenusList = this.quickAddMenus.menus
          .map((item) => {
            let foodItem = '';
            res.foods.forEach((food) => {
              if (item.id === food.id) {
                foodItem = item.quantity + ' x ' + food.name;
              }
            });
            return foodItem;
          })
          .join('<br>');

        this.setShippingInfo();

        this.isEditSelections = this.utilityService.getEditSelectionsStatus();

        if (this.isEditSelections) {
          this.setAutoships();
        }

        this.newFoodsSliderConfig = sliderConfig(this.newFoods.length);

        $(document).ready(() => {
          tooltipJS();
        });
      })
    );
  }

  newFoodTrackBy(index: number, food: Food) {
    return food.id;
  }

  setAutoships() {
    this.editOptionsTooltipTitle = '';

    const LocalMVUser = sessionStorage.getItem('MVUser');
    const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const autoshipId = FoodUser.food_autoship_id;
    const tokenType = FoodUser.token_type;
    const accessToken = FoodUser.access_token;

    this.foodApiService
      .getAutoshipScheduleOptions(autoshipId, tokenType, accessToken)
      .subscribe((res) => {
        this.autoshipScheduleOptions = res.isSuccess ? res.collection : [];

        this.autoshipScheduleOptions.forEach((option) => {
          if (option.description.startsWith('Current')) {
            this.currentNextRun = option.nextRun;
            this.editDate = this.formatEditDate(option.nextRun);

            this.shippingDate = this.formatShippingDate(
              option.description,
              false,
              false
            ).shippingDate;

            const orderProcessDay = this.getOrderProcessDay(option.nextRun);
            const shippingDay = this.formatShippingDate(
              option.description,
              false,
              false
            ).shippingDay;

            this.editOptionsTooltipTitle =
              this.translate.instant('weekly-food-orders-process-at') +
              ' 00:00am CT on ' +
              orderProcessDay +
              ', ' +
              this.translate.instant('and-ship-the-following') +
              ' ' +
              shippingDay +
              '.';

            $(document).ready(() => {
              tooltipJS();
            });
          }
        });
      });
  }

  formatShippingDate(
    shippingDate: string,
    isForDropdown: boolean,
    isForConfirm: boolean
  ) {
    let tempShipDate = '';

    if (shippingDate.startsWith('Current')) {
      tempShipDate = shippingDate.split('Current (Ships')[1];
      tempShipDate = tempShipDate.trimStart();
      tempShipDate = tempShipDate.split(')')[0];
    } else {
      tempShipDate = shippingDate;
    }

    let finalDate = '';

    const CTShippingDate = new Date(tempShipDate);

    const weekName = this.foodUtilityService.getDayOfTheWeekName(
      CTShippingDate.getDay(),
      false
    );
    const weekNameShort = this.foodUtilityService.getDayOfTheWeekName(
      CTShippingDate.getDay(),
      true
    );

    const monthName = this.foodUtilityService.getMonthName(
      CTShippingDate.getMonth(),
      true
    );

    if (isForDropdown) {
      finalDate = `${weekNameShort}, ${monthName} ${CTShippingDate.getDate()}, ${CTShippingDate.getFullYear()}`;
    } else if (isForConfirm) {
      finalDate = `${weekNameShort}, ${monthName} ${CTShippingDate.getDate()}`;
    } else {
      finalDate = `${weekName}, ${monthName} ${CTShippingDate.getDate()}`;
    }

    return { shippingDate: finalDate, shippingDay: weekName };
  }

  formatEditDate(editDate: string) {
    let finalDate = '';

    let CTEditDate = new Date(
      new Date(editDate).toLocaleString('en-US', {
        timeZone: 'America/Chicago',
      })
    );
    CTEditDate.setHours(CTEditDate.getHours() - 1);

    const weekName = this.foodUtilityService.getDayOfTheWeekName(
      CTEditDate.getDay(),
      true
    );
    const monthName = this.foodUtilityService.getMonthName(
      CTEditDate.getMonth(),
      true
    );

    let hours = CTEditDate.getHours();
    let minutes: number | string = CTEditDate.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const time = hours + ':' + minutes + ' ' + ampm;

    finalDate = `${weekName}, ${monthName} ${CTEditDate.getDate()}, ${time} CT`;

    return finalDate;
  }

  getOrderProcessDay(nextRun: string) {
    const nextRunDate = new Date(nextRun);

    const weekName = this.foodUtilityService.getDayOfTheWeekName(
      nextRunDate.getDay(),
      false
    );

    return weekName;
  }

  setNextShippingDate(autoshipOption: {
    nextRun: string;
    expire: string;
    description: string;
  }) {
    if (this.currentNextRun !== autoshipOption.nextRun) {
      this.dataService.changePostName({ postName: 'shipping-confirm-modal' });
      this.store.dispatch(
        new UpdateNextShipmentActon({
          nextRun: autoshipOption.nextRun,
          shippingDate: this.formatShippingDate(
            autoshipOption.description,
            false,
            true
          ).shippingDate,
          isSet: false,
        })
      );

      $('#foodShippingConfirmModal').modal('show');
    }
  }

  setShippingInfo() {
    const localFoodUser = sessionStorage.getItem('MVUser');
    const FoodUser = localFoodUser ? JSON.parse(localFoodUser) : null;

    const autoshipFoods: { sku: string; quantity: number }[] =
      FoodUser === null ||
      (Object.keys(FoodUser).length === 0 && FoodUser.constructor === Object)
        ? []
        : FoodUser.food_autoship_data;

    this.isAutoshipAvailable = autoshipFoods.length > 0;
  }

  onClickQuickAddPlus() {
    let isMenuOutOfBound = false;
    this.foods.forEach((food) => {
      this.quickAddMenus.menus.forEach((item) => {
        if (
          item.id === food.id &&
          !food.isOutOfStock &&
          typeof food.quantity !== 'undefined'
        ) {
          if (food.quantity + item.quantity > food.maxQuantity) {
            isMenuOutOfBound = true;
          }
        }
      });
    });

    const noOfQuickMenuItems = this.quickAddMenus.menus.reduce(
      (sum, item) => item.quantity + sum,
      0
    );
    const totalQuickMenuItems = this.noOfItems + noOfQuickMenuItems;

    if (totalQuickMenuItems <= this.eligibleNoOfItems && !isMenuOutOfBound) {
      const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);

      tempQuickAddMenus.quantity++;

      this.quickAddMenus = tempQuickAddMenus;

      this.store.dispatch(new SetQuickAddMenusActon(this.quickAddMenus));

      this.updateQuickMenusToCarts(true);
    }
  }

  onClickQuickAddMinus() {
    const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);

    tempQuickAddMenus.quantity--;

    this.quickAddMenus = tempQuickAddMenus;

    this.store.dispatch(new SetQuickAddMenusActon(this.quickAddMenus));

    this.updateQuickMenusToCarts(false);
  }

  updateQuickMenusToCarts(isSet: boolean) {
    const updatedFoods = this.foods.map((food) => {
      const tempFood = Object.assign({}, food);
      this.quickAddMenus.menus.forEach((item) => {
        if (
          item.id === food.id &&
          !food.isOutOfStock &&
          typeof food.quantity !== 'undefined'
        ) {
          if (isSet) {
            tempFood.quantity = food.quantity + item.quantity;
          } else {
            if (food.quantity >= item.quantity) {
              tempFood.quantity = food.quantity - item.quantity;
            }
          }
        }
      });
      return tempFood;
    });

    this.store.dispatch(new SetFoodsAction(updatedFoods));
    this.foodUtilityService.saveFoodsToLocalStorage(
      updatedFoods,
      this.country,
      this.language
    );
  }

  toggleTooltip(event: Event) {
    event.preventDefault();

    this.isTooltipShown = !this.isTooltipShown;

    if (this.isTooltipShown) {
      $('[data-toggle="tooltip"]#toolTipCard').tooltip('show');
    } else {
      $('[data-toggle="tooltip"]#toolTipCard').tooltip('hide');
    }
  }

  getTooltipPlacement() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      return 'bottom';
    } else {
      return 'right';
    }
  }

  onClickSubCategory(subCategory: string) {
    this.selectedSubCategory = subCategory;
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onClickFilterAndSort() {
    this.dataService.changeSidebarName('food-filter');
    $('.drawer').drawer('open');
  }

  setSeo() {
    this.titleService.setTitle(
      'Choose Your Delicious Meals and Snacks | Prüvit Food'
    );
    this.metaService.updateTag({
      name: 'description',
      content:
        'Healthy, delicious, Prüvit approved meals made with farm-fresh ingredients, ready in 5 minutes or less.',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: 'assets/images/food-site-image.jpeg',
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
