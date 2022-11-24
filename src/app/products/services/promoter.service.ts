import { Injectable } from '@angular/core';
import { Cart } from 'src/app/shared/models/cart.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { ProductVariation } from '../models/product-variation.model';
import { Product } from '../models/product.model';
import { ProductSettings } from '../models/product-settings.model';

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
      selectedCountry !== 'IT' &&
      selectedCountry !== 'HK' &&
      selectedCountry !== 'MO' &&
      selectedCountry !== 'MY' &&
      selectedCountry !== 'SG'
    ) {
      const promoterFee: Cart = this.getPromoterFeeCart(
        selectedCountry,
        selectedLanguage,
        productSettings
      );
      cartDataWithLanguages.push(promoterFee);
    }

    if (variationObj.length !== 0 && product && selectedCountry !== 'IT') {
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
    productSettings: ProductSettings
  ): Cart {
    return {
      country: selectedCountry.toLowerCase(),
      language: selectedLanguage,
      orderType: 'ordertype_1',
      isPromoter: true,
      isCurrent: true,
      cart: {
        productID: -1,
        productName: 'Promoter membership',
        productImageUrl: 'assets/images/badge-promoter-membership.png',
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
          oneTime: productSettings.promoterSku,
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
