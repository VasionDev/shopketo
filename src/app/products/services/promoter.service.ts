import { Injectable } from '@angular/core';
import { Cart } from 'src/app/shared/models/cart.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { ProductVariation } from '../models/product-variation.model';
import { Product } from '../models/product.model';
import { ProductSettings } from '../models/product-settings.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class PromoterService {
  constructor(
    private dataService: AppDataService,
    public utilityService: AppUtilityService
  ) {}

  getPromoters(products: Product[], isLimitedPromoters: boolean) {
    const tempPromoters: Product[] = [];

    products.forEach((product) => {
      if (isLimitedPromoters) {
        if (product.isForLimitedPromoter) {
          tempPromoters.push(product);
        }
      } else {
        if (product.isForPromoter) {
          tempPromoters.push(product);
        }
      }
    });

    const sortedPromoters = tempPromoters.sort(
      (a, b) => b.promoterOrder - a.promoterOrder
    );

    return sortedPromoters;
  }

  private getAttributeName(attr: string, product: Product) {
    let servingName = '';

    product.servings.forEach((serving) => {
      serving.servingAttributes.forEach((attribute) => {
        if (attribute.key === attr) {
          servingName = attribute.name;
        }
      });
    });

    return servingName;
  }

  getAttributeValue(
    variation: { key: string; value: any }[],
    searchedAttribute: string
  ) {
    let attributeValue: any;

    variation.forEach((attribute) => {
      if (attribute.key === searchedAttribute) {
        attributeValue = attribute.value;
      }
    });

    return attributeValue;
  }

  getVariations(variations: ProductVariation[]) {
    const tempVariations: { key: string; value: any }[][] = [];

    variations = variations.filter(
      (variation) => variation.orderType === 'ordertype_1'
    );

    variations.forEach((variation) => {
      const tempAttributes: { key: string; value: any }[] = [];
      Object.entries(variation).forEach((varItem: any[]) => {
        tempAttributes.push({ key: varItem[0], value: varItem[1] });
      });
      tempVariations.push(tempAttributes);
    });

    return tempVariations;
  }

  getOnetimeAndEveryMonthVariations(variations: ProductVariation[]) {
    const ordertype_1 = variations.filter(
      (variation) => variation.orderType === 'ordertype_1'
    );

    const ordertype_3 = variations.filter(
      (variation) => variation.orderType === 'ordertype_3'
    );
    return { ordertype_1, ordertype_3 };
  }

  onPromoterAddToCart(
    selectedCountry: string,
    selectedLanguage: string,
    product: Product | null,
    variationObj: any[],
    productSettings: ProductSettings
  ) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);

    let cartDataWithLanguages: Cart[] = [];
    if (
      // selectedCountry !== 'IT' &&
      selectedCountry !== 'HK' &&
      selectedCountry !== 'MO' &&
      selectedCountry !== 'MY' &&
      selectedCountry !== 'SG' &&
      selectedCountry !== 'TW' /*&&
      selectedCountry !== 'JP'*/
    ) {
      if (environment.tenant === 'ladyboss' && product?.promoterSku !== '') {
        const promoterFee: Cart = this.getPromoterFeeCartLadyboss(
          selectedCountry,
          selectedLanguage,
          productSettings,
          product?.promoterSku
        );
        cartDataWithLanguages.push(promoterFee);
      }
      if (environment.tenant !== 'ladyboss') {
        const promoterFee: Cart = this.getPromoterFeeCart(
          selectedCountry,
          selectedLanguage,
          productSettings
        );
        cartDataWithLanguages.push(promoterFee);
      }
    }

    // if (variationObj.length !== 0 && product && selectedCountry !== 'IT') {
    if (variationObj.length !== 0 && product) {
      const promoter: Cart = this.getPromoterCart(
        selectedCountry,
        selectedLanguage,
        product,
        variationObj
      );
      cartDataWithLanguages.push(promoter);
    }
    this.utilityService.setCarts(
      cartDataWithLanguages,
      selectedCountry,
      selectedLanguage
    );

    this.dataService.changeSidebarName('add-to-cart');
  }

  getServingName(variationObj: any[], product: Product) {
    const servingObj = variationObj.find((i) => i.key === 'attribute1');
    const servingKey = servingObj ? servingObj.value : '';
    return this.getAttributeName(servingKey, product);
  }

  getCaffeineStateName(variationObj: any[], product: Product) {
    const servingObj = variationObj.find((i) => i.key === 'attribute2');
    const servingKey = servingObj ? servingObj.value : '';
    return this.getAttributeName(servingKey, product);
  }

  private getPromoterCart(
    selectedCountry: string,
    selectedLanguage: string,
    product: any,
    variationObj: any[]
  ): Cart {
    return {
      country: selectedCountry.toLowerCase(),
      language: selectedLanguage,
      orderType: 'ordertype_1',
      isPromoter: true,
      isCurrent: true,
      cart: {
        productID: product.id,
        productName: product.title,
        productImageUrl: this.getAttributeValue(variationObj, 'variationImage'),
        servingsName: this.getServingName(variationObj, product),
        caffeineState: this.getCaffeineStateName(variationObj, product),
        totalQuantity: this.getAttributeValue(variationObj, 'maxQuantity'),
        quantity: 1,
        price: this.getAttributeValue(variationObj, 'priceObj'),
        discountPrice: this.getAttributeValue(variationObj, 'discountPrice'),
        productSku: this.getAttributeValue(variationObj, 'skuObj'),

        discountPercent: this.getAttributeValue(
          variationObj,
          'discountPercent'
        ),
        smartshipDiscountPrice: this.getAttributeValue(
          variationObj,
          'smartshipDiscountPrice'
        ),
        smartshipDiscountPercent: this.getAttributeValue(
          variationObj,
          'smartshipDiscountPercent'
        ),
        isUserCanAccess: true,
        discountType: '',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: false,
      },
      finalPrice: 0,
    };
  }

  getPromoterFeeCart(
    selectedCountry: string,
    selectedLanguage: string,
    productSettings: ProductSettings,
  ): Cart {
    const promoterMembership = this.dataService.getPromoterMembership();
    const membershipVariation = promoterMembership && 
      promoterMembership.variations.length 
        ? promoterMembership.variations[0]
        : null;
    const membershipServing = promoterMembership && 
      promoterMembership.servings.length
        ? promoterMembership.servings[0]
        : null;
    const membershipAttribute = membershipServing &&
      (membershipServing.servingAttributes && membershipServing.servingAttributes.length)
      ? membershipServing.servingAttributes[0] : null;
    return {
      country: selectedCountry.toLowerCase(),
      language: selectedLanguage,
      orderType: 'ordertype_1',
      isPromoter: true,
      isCurrent: true,
      cart: {
        productID: -1,
        productName: promoterMembership ? promoterMembership.title : 'Promoter membership',
        productImageUrl: promoterMembership ? promoterMembership.thumbUrl : 'assets/images/badge-promoter-membership.png',
        servingsName: membershipAttribute ? membershipAttribute.name : '(Annual fee)',
        caffeineState: '',
        totalQuantity: 1,
        quantity: 1,
        price: {
          oneTime: membershipVariation ? membershipVariation.priceObj.oneTime : productSettings.promoterPrice,
          everyMonth: 0,
        },
        discountPrice: 0,
        productSku: {
          oneTime: membershipVariation ? membershipVariation.skuObj.oneTime : productSettings.promoterSku,
          everyMonth: '',
        },
        discountPercent: 0,
        smartshipDiscountPrice: 0,
        smartshipDiscountPercent: 0,
        isUserCanAccess: true,
        discountType: '',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: false,
      },
      finalPrice: 0,
    };
  }

  getPromoterFeeCartLadyboss(
    selectedCountry: string,
    selectedLanguage: string,
    productSettings: ProductSettings,
    promoterSku = ''
  ): Cart {
    return {
      country: selectedCountry.toLowerCase(),
      language: selectedLanguage,
      orderType: 'ordertype_1',
      isPromoter: true,
      isCurrent: true,
      cart: {
        productID: -1,
        productName: 'Champion membership',
        productImageUrl: 'assets/ladyboss/images/champion-badge.jpeg',
        servingsName: '(Annual fee)',
        caffeineState: '',
        totalQuantity: 1,
        quantity: 1,
        price: {
          oneTime: productSettings.promoterPrice,
          everyMonth: 0,
        },
        discountPrice: 0,
        productSku: {
          oneTime:
            promoterSku !== '' ? promoterSku : productSettings.promoterSku,
          everyMonth: '',
        },
        discountPercent: 0,
        smartshipDiscountPrice: 0,
        smartshipDiscountPercent: 0,
        isUserCanAccess: true,
        discountType: '',
        offerDiscountPrice: 0,
        isSmartshipDiscountOn: false,
      },
      finalPrice: 0,
    };
  }
}
