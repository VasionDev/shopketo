import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Offer } from 'src/app/shared/models/offer.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppOfferService } from 'src/app/shared/services/app-offer.service';
import { environment } from 'src/environments/environment';
import { FoodCart } from '../models/food-cart.model';
import { FoodDelivery } from '../models/food-delivery.model';
import { FoodDiscount } from '../models/food-discount.model';
import { PreloadedMenus } from '../models/food-preloaded-menus.model';
import { QuickAddMenus } from '../models/food-quickadd-menus.model';
import { FoodVariation } from '../models/food-variation.model';
import { Food } from '../models/food.model';

@Injectable()
export class FoodApiService {
  private domainPath: string;
  private cloudDomainPath: string;
  private foodsPath = 'wp-json/wp/pruvitnow/food/items';
  private zipCodePath = 'wp-json/wp/pruvitnow/food/availability';
  private autoshipPath = 'wp-json/wp/pruvitnow/food/autoship/';

  constructor(
    private http: HttpClient,
    private dataService: AppDataService,
    private offerService: AppOfferService
  ) {
    this.domainPath = environment.apiDomain;
    this.cloudDomainPath = environment.userURL;
  }

  setNextRunDate(
    autoshipId: number,
    tokenType: string,
    accessToken: string,
    nextRun: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
    };
    const payLoad = { nextRun: nextRun };
    const apiPath = `${this.cloudDomainPath}api/autoship/${autoshipId}`;

    return this.http.patch<any>(apiPath, payLoad, {
      headers: new HttpHeaders(headers),
    });
  }

  getAutoshipScheduleOptions(
    autoshipId: number,
    tokenType: string,
    accessToken: string
  ) {
    const apiPath = `${this.cloudDomainPath}api/autoship/${autoshipId}/scheduleoptions`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Authorization', `${tokenType} ${accessToken}`);

    return this.http.get<any>(apiPath, { headers: headers });
  }

  patchAutoshipNextRun(
    autoshipId: number,
    tokenType: string,
    accessToken: string,
    nextRun: string
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
    };
    const payLoad = { nextRun: nextRun };
    const apiPath = `${this.cloudDomainPath}api/autoship/${autoshipId}`;

    return this.http.patch<any>(apiPath, payLoad, {
      headers: new HttpHeaders(headers),
    });
  }

  getSyncAutoshipData(
    country: string,
    userId: string,
    tokenType: string,
    accessToken: string
  ) {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      fullApiPath = this.domainPath + '/' + this.autoshipPath;
    } else {
      fullApiPath =
        this.domainPath + '/' + country.toLowerCase() + '/' + this.autoshipPath;
    }

    fullApiPath =
      fullApiPath +
      '/?user_id=' +
      userId +
      '&token_type=' +
      tokenType +
      '&access_token=' +
      accessToken;

    const request = new XMLHttpRequest();
    request.open('GET', fullApiPath, false);
    request.send();

    return { status: request.status, response: JSON.parse(request.response) };
  }

  getAutoshipData(
    country: string,
    userId: string,
    tokenType: string,
    accessToken: string
  ) {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      fullApiPath = this.domainPath + '/' + this.autoshipPath;
    } else {
      fullApiPath =
        this.domainPath + '/' + country.toLowerCase() + '/' + this.autoshipPath;
    }

    fullApiPath =
      fullApiPath +
      '/?user_id=' +
      userId +
      '&token_type=' +
      tokenType +
      '&access_token=' +
      accessToken;

    return this.http.get<any>(fullApiPath);
  }

  getZipCode(country: string, postalCode: string) {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      fullApiPath = this.domainPath + '/' + this.zipCodePath;
    } else {
      fullApiPath =
        this.domainPath + '/' + country.toLowerCase() + '/' + this.zipCodePath;
    }

    const params = new HttpParams().set('postal_code', postalCode);

    return this.http.get<any>(fullApiPath, { params: params });
  }

  getFoods(country: string): Observable<{
    foods: Food[];
    types: string[];
    categories: string[];
    subCategories: string[];
    discounts: FoodDiscount;
    dietTypes: string[];
    preloadedMenus: PreloadedMenus;
    quickAddMenus: QuickAddMenus;
    foodDelivery: FoodDelivery;
    offers: any[];
  }> {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      fullApiPath = this.domainPath + '/' + this.foodsPath;
    } else {
      fullApiPath =
        this.domainPath + '/' + country.toLowerCase() + '/' + this.foodsPath;
    }

    return this.http.get<any>(fullApiPath).pipe(
      map((responseData) => {
        const foodArray: Food[] = [];

        responseData.items.forEach((item: any) => {
          const foodVariation = this.getFoodVariation(
            responseData.variations,
            item.id
          );

          const limitedTimeObj = this.checkLimitedTimeStatus(
            responseData?.limited_time_availability,
            item.id
          );

          foodArray.push({
            id: item.id,
            type: item.type,
            subType: item.sub_type ? item.sub_type : '',
            name: item.name,
            description: item.description ? item.description : '',
            mainCategory: item.main_category ? item.main_category : '',
            subCategory: item.sub_category ? item.sub_category : '',
            slug: item.slug,
            imageUrl: item.image_url ? item.image_url : '',
            thumbnailUrl: item.thumbnail_url ? item.thumbnail_url : '',
            ingredients: item.ingredients ? item.ingredients : [],
            instructions: item.instructions ? item.instructions : [],
            nutritions: this.setNutritions(item?.nutrition),
            allergens: this.setAllergens(item?.allergens),
            nutritionDisclaimer: item.nutrition_disclaimer
              ? item.nutrition_disclaimer
              : '',
            dietTypes: item?.diet_types ? item?.diet_types : [],
            mappedDietTypes: this.mapDietTypes(item?.diet_types),
            sku: foodVariation.sku,
            price: foodVariation.price,
            quantity: this.setFoodQuantity(item.id, foodVariation),
            maxQuantity: foodVariation.quantity,
            isOutOfStock: foodVariation.isOutOfStock,
            show: foodVariation.show,
            isNew: this.setNewFood(responseData?.new_items, item.id),
            limitedTimeAvailability: {
              isSet: limitedTimeObj.isSet,
              availableUntil: limitedTimeObj.availableUntil,
              isModalShown: false,
            },
          });
        });

        const offers: Offer[] = responseData.hasOwnProperty('offer')
          ? this.offerService.getProductOffers(responseData.offer)
          : [];

        return {
          foods: foodArray,
          types: this.getFoodTypes(responseData.items),
          categories: this.getFoodCategories(responseData.items),
          subCategories: this.getFoodSubCategories(responseData.items),
          discounts: this.getFoodDiscounts(responseData.food_discount_info),
          dietTypes: this.getFoodDietTypes(responseData.items),
          preloadedMenus: this.setPreloadedMenus(responseData.preloaded_data),
          quickAddMenus: this.setQuickAddMenus(responseData.preloaded_data),
          foodDelivery: this.setFoodDelivery(responseData.food_discount_info),
          offers: offers,
        };
      })
    );
  }

  private checkLimitedTimeStatus(limitedTimeFoods: any, foodId: string) {
    let isSet = false;
    let availableUntil = '';

    if (limitedTimeFoods) {
      Object.entries(limitedTimeFoods).forEach((item: any[]) => {
        if (item[0] === foodId && item[1]?.availability === 'on') {
          isSet = true;
          availableUntil = item[1]?.date;
        }
      });
    }

    return { isSet, availableUntil };
  }

  private setFoodDelivery(discountInfo: FoodDiscount) {
    const LocalFoodDelivery = localStorage.getItem('FoodDelivery');
    const FoodDelivery: FoodDelivery = LocalFoodDelivery
      ? JSON.parse(LocalFoodDelivery)
      : null;

    const defaultFoodDelivery: FoodDelivery = {
      totalItems: 0,
      totalPrice: 0,
      appliedDiscount: 0,
      shippingDateShort: discountInfo.shippingDateShort
        ? discountInfo.shippingDateShort
        : '',
      autoshipShippingDateShort: discountInfo.autoshipShippingDateShort
        ? discountInfo.autoshipShippingDateShort
        : '',
      editDate: discountInfo.editDate ? discountInfo.editDate : '',
      itemsPerBox: discountInfo.itemsPerBox,
      maxBoxes: discountInfo.maxBoxes,
    };

    if (FoodDelivery === null || FoodDelivery.totalItems === 0) {
      localStorage.setItem('FoodDelivery', JSON.stringify(defaultFoodDelivery));

      return defaultFoodDelivery;
    } else {
      localStorage.setItem('FoodDelivery', JSON.stringify(FoodDelivery));

      return FoodDelivery;
    }
  }

  private setQuickAddMenus(preloadedData: any): QuickAddMenus {
    const quickAddItems = {} as QuickAddMenus;

    if (preloadedData) {
      quickAddItems.title = preloadedData.quick_add_title
        ? preloadedData.quick_add_title
        : '';
      quickAddItems.description = preloadedData.quick_add_description
        ? preloadedData.quick_add_description
        : '';
      quickAddItems.bGColor = preloadedData.quick_add_bg_color
        ? preloadedData.quick_add_bg_color
        : '#a231e6';
      quickAddItems.image = preloadedData.quick_add_image
        ? preloadedData.quick_add_image
        : 'assets/images/quick-add-bundle-img.png';
      quickAddItems.quantity = 0;

      const tempMenus: { id: string; quantity: number }[] = [];
      Object.entries(preloadedData.items).forEach((item: any[]) => {
        tempMenus.push({ id: item[0], quantity: +item[1] });
      });

      quickAddItems.menus = tempMenus;
    }

    return quickAddItems;
  }

  private setPreloadedMenus(preloadedData: any): PreloadedMenus {
    const preloadedItems = {} as PreloadedMenus;

    if (preloadedData) {
      preloadedItems.text = preloadedData.preload_text;

      const tempMenus: { id: string; quantity: number }[] = [];
      Object.entries(preloadedData.items).forEach((item: any[]) => {
        tempMenus.push({ id: item[0], quantity: +item[1] });
      });

      preloadedItems.menus = tempMenus;
    }

    return preloadedItems;
  }

  private setNutritions(nutritions: any[]): {
    name: string;
    unitSize: number;
    quantity: string;
  }[] {
    return nutritions.map((nutrient) => {
      nutrient.unitSize = nutrient.unit_size;
      nutrient.quantity = nutrient.quantity;

      delete nutrient.unit_size;
      delete nutrient.unit_of_measure;

      return nutrient;
    });
  }

  private getFoodDiscounts(info: any): FoodDiscount {
    const discountInfo = {} as FoodDiscount;
    const LocalFoodUser = sessionStorage.getItem('MVUser');
    const FoodUser = LocalFoodUser ? JSON.parse(LocalFoodUser) : null;

    if (info) {
      discountInfo.itemsPerBox = +info.items_per_box;
      discountInfo.maxBoxes = +info.max_boxes;
      discountInfo.shippingDate = info.next_shipping_date_str;
      discountInfo.shippingDateShort = info.next_shipping_date_str2;

      discountInfo.discounts = info.discount.map((discount: any) => {
        return {
          numberOfBox: +discount.number_of_box,
          discountPercent: +discount.discount,
        };
      });

      if (FoodUser !== null) {
        discountInfo.autoshipShippingDate = FoodUser.mvuser_autoship_date
          ? FoodUser.mvuser_autoship_date
          : info.next_shipping_date_autoship;
        discountInfo.autoshipShippingDateShort = FoodUser.mvuser_autoship_date2
          ? FoodUser.mvuser_autoship_date2
          : info.next_shipping_date_autoship2;
        discountInfo.editDate = FoodUser.mvuser_edit_date
          ? FoodUser.mvuser_edit_date
          : info.edit_by_date;
      }
    }

    return discountInfo;
  }

  private getFoodTypes(foodItems: any[]): string[] {
    const types: string[] = [];

    foodItems.forEach((item: any) => {
      const newTypeIndex = types.findIndex(
        (type: string) => type === item.sub_type
      );
      if (newTypeIndex === -1 && item.sub_type) {
        types.push(item.sub_type);
      }
    });

    return types;
  }

  private setAllergens(allergens: any[]) {
    let foodAllergens: string[] = [];

    if (allergens) {
      foodAllergens = allergens.map((allergen) => allergen.name);
    }

    return foodAllergens;
  }

  private getFoodCategories(foodItems: any[]): string[] {
    const categories: string[] = [];

    foodItems.forEach((item: any) => {
      const newCategoryIndex = categories.findIndex(
        (category: string) => category === item.main_category
      );
      if (newCategoryIndex === -1 && item.main_category) {
        categories.push(item.main_category);
      }
    });

    return categories;
  }

  private getFoodSubCategories(foodItems: any[]): string[] {
    const subCategories: string[] = [];

    foodItems.forEach((item: any) => {
      const newCategoryIndex = subCategories.findIndex(
        (category: string) => category === item.sub_category
      );
      if (newCategoryIndex === -1 && item.sub_category) {
        subCategories.push(item.sub_category);
      }
    });

    return subCategories;
  }

  private getFoodDietTypes(foodItems: any[]): string[] {
    let dietTypes: string[] = [];

    foodItems.forEach((item: any) => {
      dietTypes = dietTypes.concat(item.diet_types);
    });

    dietTypes = dietTypes.filter(
      (item, index) => dietTypes.indexOf(item) === index
    );

    return dietTypes;
  }

  private mapDietTypes(dietTypes: string[]): string[] {
    if (dietTypes) {
      return dietTypes.map((diet: string) => {
        let finalDiet = '';
        const words = diet.split('_');

        words.forEach((word: string) => {
          finalDiet += word.charAt(0);
        });

        return finalDiet;
      });
    } else {
      return [];
    }
  }

  private setNewFood(newItems: any[], foodId: string): boolean {
    if (newItems) {
      const newFoodIndex = Object.values(newItems).findIndex(
        (item: string) => item === foodId
      );

      return newFoodIndex !== -1;
    } else {
      return false;
    }
  }

  private setFoodQuantity(
    foodId: string,
    foodVariation: FoodVariation
  ): number {
    let foodQuantity = 0;
    const LocalFoods = localStorage.getItem('Foods');
    let Foods: FoodCart[] = LocalFoods ? JSON.parse(LocalFoods) : null;

    if (!Foods) {
      Foods = [];
    }

    combineLatest([
      this.dataService.currentSelectedCountry$,
      this.dataService.currentSelectedLanguage$,
    ])
      .pipe(take(1))
      .subscribe((res: [string, string]) => {
        const foodIndex = Foods.findIndex((food: FoodCart) => {
          return (
            food.country === res[0] &&
            food.language === res[1] &&
            food.food.id === foodId &&
            !foodVariation.isOutOfStock
          );
        });
        if (foodIndex !== -1) {
          foodQuantity = Foods[foodIndex].food.quantity!;
        }
      });

    return foodQuantity;
  }

  private getFoodVariation(variations: any, foodId: string): FoodVariation {
    const variation = {} as FoodVariation;

    Object.entries(variations).forEach((item: any[]) => {
      if (item[0] === foodId) {
        const varItem: any = Object.values(item[1])[0];

        variation.sku = varItem.mvproduct_sku;
        variation.price = +varItem.mvproduct_price;
        variation.quantity = varItem.mvproduct_quantity;
        variation.isOutOfStock =
          varItem.mvproduct_outof_stock === 'on' ? true : false;
        variation.show =
          varItem.mvproduct_hide_variation === 'on' ? false : true;
      }
    });
    return variation;
  }
}
