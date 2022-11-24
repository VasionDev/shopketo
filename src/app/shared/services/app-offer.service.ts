import { Injectable } from '@angular/core';
import { ProductVariationBase } from 'src/app/products/models/product-variation.model';
import { Product } from 'src/app/products/models/product.model';
import { ProductsFormService } from 'src/app/products/services/products-form.service';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { Cart } from '../models/cart.model';
import { Offer } from '../models/offer.model';
import { AppUserService } from './app-user.service';

@Injectable()
export class AppOfferService {
  constructor(
    private utilityService: AppUtilityService,
    private productsFormService: ProductsFormService,
    private productsUtilityService: ProductsUtilityService,
    private userService: AppUserService
  ) {}

  getProductOffers(offersMap: any[]): Offer[] {
    const offers: Offer[] = [];

    offersMap.forEach((offer: any) => {
      if (
        offer.product.length === 0 ||
        (Object.keys(offer.product).length === 0 &&
          offer.product.constructor === Object)
      ) {
        return;
      }

      const productInfo = offer.product.hasOwnProperty('product_info')
        ? this.productsFormService.getProduct(offer.product.product_info)
        : ({} as Product);

      const oneTimeDiscount: {
        sku: string;
        amount: number;
      }[] = Object.entries(offer.product.discount.onetime).map(
        (oneTimeItem: any[]) => {
          return { sku: oneTimeItem[0], amount: +oneTimeItem[1] };
        }
      );

      const everyMonthDiscount: {
        sku: string;
        amount: number;
      }[] = Object.entries(offer.product.discount.smartship).map(
        (everyMonthItem: any[]) => {
          return { sku: everyMonthItem[0], amount: +everyMonthItem[1] };
        }
      );

      const mapOffer: Offer = {
        title: offer.hasOwnProperty('offer_title') ? offer.offer_title : '',
        description: offer.hasOwnProperty('description')
          ? offer.description
          : '',
        additionalDescription: offer.hasOwnProperty('info') ? offer.info : '',
        condition: offer.hasOwnProperty('conditions') ? offer.conditions : '',
        tag: offer.hasOwnProperty('title') ? offer.title : '',
        isSmartshipDiscount: offer.hasOwnProperty('smartship')
          ? offer.smartship
          : false,
        offerAppliedFor: offer.hasOwnProperty('offer_applied_for')
          ? offer.offer_applied_for === 'onetime'
            ? 'ONE_TIME'
            : offer.offer_applied_for === 'smartship'
            ? 'SMARTSHIP'
            : 'ONE_TIME_SMARTSHIP'
          : 'ONE_TIME_SMARTSHIP',

        includeRegularDiscount: offer.include_regular_discount === 'on',
        type:
          offer.offer_type === 'sku_purchase'
            ? 'SKU_PURCHASE'
            : offer.offer_type === 'cart_total'
            ? 'CART_TOTAL'
            : offer.offer_type === 'food_offer'
            ? 'FOOD'
            : '',
        customUsers: offer.hasOwnProperty('custom_users_list')
          ? offer.custom_users_list?.map((user: string) => +user[0])
          : [],
        accessLevels: this.productsUtilityService.getAccessLevels(
          offer.hasOwnProperty('availability_for') ? offer.availability_for : ''
        ),
        product: productInfo ? productInfo : ({} as Product),

        discount: {
          oneTime: oneTimeDiscount,
          everyMonth: everyMonthDiscount,
        },
        qualifiedSkus: offer.hasOwnProperty('qualify_sku')
          ? {
              oneTime: offer.qualify_sku.onetime
                ? offer.qualify_sku.onetime
                : [],
              everyMonth: offer.qualify_sku.smartship
                ? offer.qualify_sku.smartship
                : [],
            }
          : ({} as Offer['qualifiedSkus']),
        priceOver: offer.hasOwnProperty('price_over') ? offer.price_over : 0,
        priceUnder: offer.hasOwnProperty('price_under') ? offer.price_under : 0,
      };

      offers.push(mapOffer);
    });

    return offers;
  }

  getAvailableOffers(
    offers: Offer[],
    cartDataWithLanguages: any[],
    cartOneTime: Cart[],
    cartEveryMonth: Cart[]
  ): Offer[] {
    const availableOffers: Offer[] = [];

    offers.forEach((offer) => {
      const isUserCanAccess = this.userService.checkUserAccess(
        offer.accessLevels,
        offer.customUsers
      );

      if (offer.type === 'CART_TOTAL') {
        const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
          offer.includeRegularDiscount,
          offer.priceOver,
          offer.priceUnder,
          cartDataWithLanguages
        );

        const isOfferSkuFound = this.getOfferSkuFoundStatus(
          offer,
          cartOneTime,
          cartEveryMonth
        );

        if (cartTotalOfferFound && !isOfferSkuFound && isUserCanAccess) {
          availableOffers.push(offer);
        }
      }
      if (offer.type === 'SKU_PURCHASE') {
        let skuBasedOfferFound = false;

        cartOneTime.forEach((cartOneTime) => {
          offer.qualifiedSkus.oneTime.forEach((qualifiedOneTime) => {
            if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
              skuBasedOfferFound = true;
            }
          });
        });

        cartEveryMonth.forEach((cartEveryMonth) => {
          offer.qualifiedSkus.everyMonth.forEach((qualifiedSmartship) => {
            if (
              cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
            ) {
              skuBasedOfferFound = true;
            }
          });
        });

        const isOfferSkuFound = this.getOfferSkuFoundStatus(
          offer,
          cartOneTime,
          cartEveryMonth
        );

        if (skuBasedOfferFound && !isOfferSkuFound && isUserCanAccess) {
          availableOffers.push(offer);
        }
      }
    });

    return availableOffers;
  }

  getOfferSkuFoundStatus(
    offer: Offer,
    oneTimeCart: Cart[],
    everyMonthCart: Cart[]
  ) {
    let offeredSkuFound = false;

    const offeredSkus: string[] = [];
    offer.product.variations.forEach((variation) => {
      const oneTimeSkuFound = offeredSkus.find(
        (sku) => sku === variation.skuObj.oneTime
      );
      if (!oneTimeSkuFound) {
        offeredSkus.push(variation.skuObj.oneTime);
      }

      const everyMonthSkuFound = offeredSkus.find(
        (sku) => sku === variation.skuObj.everyMonth
      );
      if (!everyMonthSkuFound && variation.skuObj.everyMonth) {
        offeredSkus.push(variation.skuObj.everyMonth);
      }
    });

    oneTimeCart.forEach((cartOneTime) => {
      offeredSkus.forEach((sku) => {
        if (cartOneTime.cart.productSku.oneTime === sku) {
          offeredSkuFound = true;
        }
      });
    });

    everyMonthCart.forEach((cartEveryMonth) => {
      offeredSkus.forEach((sku) => {
        if (cartEveryMonth.cart.productSku.everyMonth === sku) {
          offeredSkuFound = true;
        }
      });
    });

    return offeredSkuFound;
  }

  isSkuBaseOfferFound(
    offer: Offer,
    oneTimeCart: Cart[],
    everyMonthCart: Cart[],
    orderType: ProductVariationBase['orderType']
  ) {
    let offerFound = false;

    if (offer.isSmartshipDiscount) {
      let isOfferQualified = false;
      let smartshipProductFound = false;

      everyMonthCart.forEach((cartEveryMonth) => {
        offer.qualifiedSkus.everyMonth.forEach((qualifiedSmartship) => {
          if (
            cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
          ) {
            isOfferQualified = true;
          }
        });
      });

      everyMonthCart.forEach((cartEveryMonth) => {
        offer.discount.everyMonth.forEach((discountItem) => {
          if (discountItem.sku === cartEveryMonth.cart.productSku.everyMonth) {
            smartshipProductFound = true;
          }
        });
      });

      if (
        ((orderType === 'ordertype_3' || orderType === 'ordertype_2') &&
          isOfferQualified) ||
        (isOfferQualified && smartshipProductFound)
      ) {
        offerFound = true;
      }
    } else {
      oneTimeCart.forEach((cartOneTime) => {
        offer.qualifiedSkus.oneTime.forEach((qualifiedOneTime) => {
          if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
            offerFound = true;
          }
        });
      });

      everyMonthCart.forEach((cartEveryMonth) => {
        offer.qualifiedSkus.everyMonth.forEach((qualifiedSmartship) => {
          if (
            cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
          ) {
            offerFound = true;
          }
        });
      });
    }

    return offerFound;
  }

  getOfferTypeForProduct(
    offers: Offer[],
    skuObj: any,
    orderType: ProductVariationBase['orderType']
  ): Offer['type'] {
    let skuBasedOfferFound = false;
    let cartTotalOfferFound = false;

    if (orderType === 'ordertype_1') {
      offers.forEach((offer) => {
        if (offer.type === 'SKU_PURCHASE') {
          offer.discount.oneTime.forEach((oneTimeItem) => {
            if (oneTimeItem.sku === skuObj.oneTime) {
              skuBasedOfferFound = true;
            }
          });
        }
      });
    } else {
      offers.forEach((offer) => {
        if (offer.type === 'SKU_PURCHASE') {
          offer.discount.everyMonth.forEach((everyMonthItem) => {
            if (everyMonthItem.sku === skuObj.everyMonth) {
              skuBasedOfferFound = true;
            }
          });
        }
      });
    }

    if (orderType === 'ordertype_1') {
      offers.forEach((offer) => {
        if (offer.type === 'CART_TOTAL') {
          offer.discount.oneTime.forEach((oneTimeItem) => {
            if (oneTimeItem.sku === skuObj.oneTime) {
              cartTotalOfferFound = true;
            }
          });
        }
      });
    } else {
      offers.forEach((offer) => {
        if (offer.type === 'CART_TOTAL') {
          offer.discount.everyMonth.forEach((everyMonthItem) => {
            if (everyMonthItem.sku === skuObj.everyMonth) {
              cartTotalOfferFound = true;
            }
          });
        }
      });
    }

    return skuBasedOfferFound
      ? 'SKU_PURCHASE'
      : cartTotalOfferFound
      ? 'CART_TOTAL'
      : '';
  }
}
