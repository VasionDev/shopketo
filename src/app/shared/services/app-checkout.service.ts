import { Injectable } from '@angular/core';
import * as cryptojs from 'crypto-js';
import { FoodCart } from 'src/app/foods/models/food-cart.model';
import { environment } from 'src/environments/environment';
import { AppDataService } from './app-data.service';
import { AppUserService } from './app-user.service';
import { AppUtilityService } from './app-utility.service';

@Injectable({
  providedIn: 'root',
})
export class AppCheckoutService {
  language = '';
  country = '';
  checkoutDomain = '';
  checkoutPath = '';
  foodCheckoutURL = '';
  isStaging: boolean;
  redirectURL = '';
  clientDomain = '';
  sha256Salt = '';
  referrer: any = {};
  user: any;

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private userService: AppUserService
  ) {
    this.isStaging = environment.isStaging;
    this.foodCheckoutURL = environment.foodCheckoutUrl;
    this.checkoutDomain = environment.checkoutDomain;
    this.redirectURL = environment.redirectDomain;
    this.clientDomain = environment.clientDomain;
    this.sha256Salt = environment.shaSalt;

    this.dataService.currentSelectedLanguage$.subscribe((language: string) => {
      this.language = language;
    });

    this.dataService.currentSelectedCountry$.subscribe((country: string) => {
      this.country = country;
    });

    this.dataService.currentReferrerData$.subscribe((referrer: any) => {
      if (referrer) {
        this.referrer = referrer;
      }
    });

    this.dataService.currentProductsData$.subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }

      this.checkoutPath = data.productSettings.checkoutFullPath;
    });

    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.user = user;
      }
    });
  }

  checkoutFood() {
    this.dataService.setIsCheckoutFromFoodStatus(true);

    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    if (VIUser !== null) {
      this.setFoodCheckoutUrl(
        VIUser.referrer,
        false,
        VIUser.promptLogin,
        VIUser.viCode
      );
    } else {
      if (this.user !== null) {
        const autoshipFoods: { sku: string; quantity: number }[] =
          this.user === null ||
          (Object.keys(this.user).length === 0 &&
            this.user.constructor === Object)
            ? []
            : this.user.food_autoship_data;

        if (autoshipFoods.length !== 0 || this.user.isEditSelections) {
          this.setFoodCheckoutUrl(this.user.mvuser_refCode, true, 'true', '');
        } else {
          this.setFoodCheckoutUrl(this.user.mvuser_refCode, false, 'true', '');
        }
      } else {
        this.setModals();
      }
    }
  }

  setFoodCheckoutUrl(
    refCode: string,
    isAutoshipFoods: boolean,
    promptLogin: string,
    viCode: string
  ) {
    let checkoutLink = '';

    let foodSkus = '';

    const LocalCheckoutOrder = localStorage.getItem('FoodDeliveryType');
    let CheckoutOrder: string = LocalCheckoutOrder
      ? JSON.parse(LocalCheckoutOrder)
      : '';

    const LocalCheckoutFoods = localStorage.getItem('CheckoutFoods');
    let CheckoutFoods: FoodCart[] = LocalCheckoutFoods
      ? JSON.parse(LocalCheckoutFoods)
      : [];

    const LocalCheckoutFoodOffers = localStorage.getItem('CheckoutFoodOffers');
    let CheckoutFoodOffers: any[] = LocalCheckoutFoodOffers
      ? JSON.parse(LocalCheckoutFoodOffers)
      : [];

    if (!isAutoshipFoods) {
      if (CheckoutOrder === 'weekly') {
        CheckoutFoods.forEach((food: FoodCart) => {
          foodSkus += food.food.sku + '-ONCE' + ':' + food.food.quantity;
          foodSkus += ',';
        });
        CheckoutFoods.forEach((food: FoodCart, index: any) => {
          foodSkus += food.food.sku + '-RENEW' + ':' + food.food.quantity;
          if (CheckoutFoods.length - 1 !== index) {
            foodSkus += ',';
          }
        });

        CheckoutFoodOffers.forEach((foodOffer) => {
          const offerSku = foodOffer.cart.productSku.oneTime.includes('ONCE')
            ? foodOffer.cart.productSku.oneTime.slice(0, -5)
            : foodOffer.cart.productSku.oneTime;
          const offerQuantity = foodOffer.cart.quantity;

          foodSkus += ',';
          foodSkus += offerSku + '-ONCE' + ':' + offerQuantity;
          foodSkus += ',';
          foodSkus += offerSku + '-RENEW' + ':' + offerQuantity;
        });
      } else {
        CheckoutFoods.forEach((food: FoodCart, index: any) => {
          foodSkus += food.food.sku + '-ONCE' + ':' + food.food.quantity;
          if (CheckoutFoods.length - 1 !== index) {
            foodSkus += ',';
          }
        });

        CheckoutFoodOffers.forEach((foodOffer) => {
          const offerSku = foodOffer.cart.productSku.oneTime.includes('ONCE')
            ? foodOffer.cart.productSku.oneTime.slice(0, -5)
            : foodOffer.cart.productSku.oneTime;
          const offerQuantity = foodOffer.cart.quantity;

          foodSkus += ',';
          foodSkus += offerSku + '-ONCE' + ':' + offerQuantity;
        });
      }
    } else {
      CheckoutFoods.forEach((food: FoodCart, index: any) => {
        foodSkus += food.food.sku + '-RENEW' + ':' + food.food.quantity;
        if (CheckoutFoods.length - 1 !== index) {
          foodSkus += ',';
        }
      });

      CheckoutFoodOffers.forEach((foodOffer) => {
        const offerSku = foodOffer.cart.productSku.oneTime.includes('ONCE')
          ? foodOffer.cart.productSku.oneTime.slice(0, -5)
          : foodOffer.cart.productSku.oneTime;
        const offerQuantity = foodOffer.cart.quantity;

        foodSkus += ',';
        foodSkus += offerSku + '-RENEW' + ':' + offerQuantity;
      });
    }

    const gaCode = this.referrer.hasOwnProperty('ga_track_id')
      ? this.referrer.ga_track_id
      : '';
    const fbCode = this.referrer.hasOwnProperty('fb_pixel_id')
      ? this.referrer.fb_pixel_id
      : '';
    const googleConversionId = this.referrer.hasOwnProperty('ga_ad_track_id')
      ? this.referrer.ga_ad_track_id
      : '';
    const googleConversionLabel = this.referrer.hasOwnProperty('ga_ad_conv_lbl')
      ? this.referrer.ga_ad_conv_lbl
      : '';

    checkoutLink =
      this.foodCheckoutURL +
      refCode +
      '?products=' +
      foodSkus +
      '&country=' +
      this.country.toLowerCase() +
      '&catalog=sunbasket' +
      '&redirect_url=' +
      this.redirectURL +
      '&language=' +
      this.language +
      '&gaCode=' +
      gaCode +
      '&fbCode=' +
      fbCode +
      '&googleConversionId=' +
      googleConversionId +
      '&googleConversionLabel=' +
      googleConversionLabel +
      '&promptLogin=' +
      promptLogin;

    checkoutLink =
      viCode !== '' ? checkoutLink + '&vicode=' + viCode : checkoutLink;

    const hash = cryptojs
      .SHA256(checkoutLink + this.sha256Salt)
      .toString(cryptojs.enc.Hex)
      .toUpperCase();

    checkoutLink += '&hash=' + hash;

    this.openCheckoutWindow(checkoutLink);
  }

  setSupplementsCheckoutUrl(
    refCode: string,
    promptLogin: string,
    viCode: string,
    viProductId?: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    productSku?: string,
    redirectURL?: string
  ) {
    const productSkus = productSku
      ? productSku
      : this.utilityService.productSkus;
    const redirectUrl = redirectURL
      ? redirectURL
      : this.clientDomain + '/dashboard/order-success';

    let checkoutLink = '';

    const gaCode = this.referrer.hasOwnProperty('ga_track_id')
      ? this.referrer.ga_track_id
      : '';
    const fbCode = this.referrer.hasOwnProperty('fb_pixel_id')
      ? this.referrer.fb_pixel_id
      : '';
    const googleConversionId = this.referrer.hasOwnProperty('ga_ad_track_id')
      ? this.referrer.ga_ad_track_id
      : '';
    const googleConversionLabel = this.referrer.hasOwnProperty('ga_ad_conv_lbl')
      ? this.referrer.ga_ad_conv_lbl
      : '';

    if (this.checkoutPath !== '') {
      checkoutLink = this.checkoutPath
        .replace('{invite_id}', refCode)
        .replace('{product_skus}', productSkus)
        .replace('{country}', this.country.toLowerCase())
        .replace('{language}', this.language)
        .replace('{redirect_url}', redirectUrl);
    } else {
      checkoutLink =
        this.checkoutDomain +
        refCode +
        '?products=' +
        productSkus +
        '&country=' +
        this.country.toLowerCase() +
        '&redirect_url=' +
        redirectUrl +
        '&language=' +
        this.language;
    }

    checkoutLink +=
      '&gaCode=' +
      gaCode +
      '&fbCode=' +
      fbCode +
      '&googleConversionId=' +
      googleConversionId +
      '&googleConversionLabel=' +
      googleConversionLabel +
      '&promptLogin=' +
      promptLogin;

    checkoutLink =
      viCode !== '' ? checkoutLink + '&vicode=' + viCode : checkoutLink;

    checkoutLink = viProductId
      ? checkoutLink + '&viProductId=' + viProductId
      : checkoutLink;

    checkoutLink = firstName
      ? checkoutLink + '&firstName=' + firstName
      : checkoutLink;

    checkoutLink = lastName
      ? checkoutLink + '&lastName=' + lastName
      : checkoutLink;

    checkoutLink = email ? checkoutLink + '&email=' + email : checkoutLink;

    const hash = cryptojs
      .SHA256(checkoutLink + this.sha256Salt)
      .toString(cryptojs.enc.Hex)
      .toUpperCase();

    checkoutLink =
      viCode !== '' ? checkoutLink + '&hash=' + hash : checkoutLink;

    this.openCheckoutWindow(checkoutLink);
  }

  setModals() {
    const modals = [];

    const referrerModal =
      this.referrer.hasOwnProperty('code') && this.referrer.code !== ''
        ? 'referrerBy'
        : 'referrerCode';

    modals.push({ modalName: referrerModal });

    this.dataService.changeCartOrCheckoutModal('checkout');

    this.dataService.changePostName({
      postName: 'referrer-modal',
      payload: { key: 'modals', value: modals },
    });
  }

  openCheckoutWindow(checkoutLink: string) {
    const height = 760;
    const width = 500;
    const leftPosition = window.innerWidth / 2 - width / 2;
    const topPosition =
      window.innerHeight / 2 -
      height / 2 +
      (window.outerHeight - window.innerHeight);

    window.open(
      checkoutLink,
      'checkoutWindowRef',
      'status=no,height=' +
        height +
        ',width=' +
        width +
        ',resizable=yes,left=' +
        leftPosition +
        ',top=' +
        topPosition +
        ',screenX=' +
        leftPosition +
        ',screenY=' +
        topPosition +
        ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no'
    );
  }
}
