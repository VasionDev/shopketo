import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { ProductsUtilityService } from '../services/products-utility.service';
import { ProductServingObj } from './product-serving.model';

export class ProductVariationBase {
  constructor(
    public uniqueId: string,
    public skuObj: {
      oneTime: string;
      everyMonth: string;
    },
    public priceObj: {
      oneTime: number;
      everyMonth: number;
    },
    public maxQuantity: number,
    public orderType: 'ordertype_1' | 'ordertype_2' | 'ordertype_3',

    public attribute1: string,
    public attribute2: string,
    public onetimeAndSmartshipDifference: number,
    public discountPrice: number,
    public discountPercent: number,
    public smartshipDiscountPrice: number,
    public smartshipDiscountPercent: number,
    public finalPrice: number,
    public hasDiscount: boolean,
    public accessLevels: ProductAccess,
    public customUsers: number[],
    public isOutOfStock?: boolean,
    public bonusValue?: number,
    public variationImage?: string,
    public variationDetails?: string
  ) {}
}

export class ProductVariation extends ProductVariationBase {
  price: number;
  sku: string;

  constructor(
    variationsArrayResponse: any[],
    variationResponse: any,
    servingKeys: ProductServingObj['keys'],
    productUtilityService: ProductsUtilityService
  ) {
    const varItem = variationResponse[1];

    const attribute1 = varItem[servingKeys.attribute1Key];
    const attribute2 = varItem[servingKeys.attribute2Key]
      ? varItem[servingKeys.attribute2Key]
      : '';

    const bonusValue = +varItem.mvproduct_bonus_value;
    const uniqueId = varItem.prod_var_unique_id;
    const variationImage = varItem.mvproduct_variation_image;
    const maxQuantity = +varItem.mvproduct_quantity;
    const variationDetails = varItem.mvproduct_variation_details;
    const orderType = varItem.mvproduct_ordertype;

    const initialIsOutOfStock =
      varItem.hasOwnProperty('mvproduct_outof_stock') &&
      varItem.mvproduct_outof_stock === 'on';

    const customUsers = varItem.hasOwnProperty('custom_users_list')
      ? varItem.custom_users_list.map((user: string) => +user[0])
      : [];
    const accessLevels = productUtilityService.getAccessLevels(
      varItem.hasOwnProperty('availability_for') ? varItem.availability_for : ''
    );

    const finalPrice = 0;
    const hasDiscount = false;

    const initialSkuObj = {
      oneTime: '',
      everyMonth: '',
    };

    const initialPriceObj = {
      oneTime: 0,
      everyMonth: 0,
    };

    const initialDiscountPrice = 0;
    const initialSmartshipDiscountPrice = 0;

    const initialDiscountPercent = 0;
    const initialSmartshipDiscountPercent = 0;

    const initialOnetimeAndSmartshipDifference = 0;

    variationsArrayResponse = variationsArrayResponse.map((v: any) => {
      const varItem = v[1];

      const attribute1 = varItem[servingKeys.attribute1Key];
      const attribute2 = varItem[servingKeys.attribute2Key]
        ? varItem[servingKeys.attribute2Key]
        : '';

      varItem.attribute1 = attribute1;
      varItem.attribute2 = attribute2;

      return v;
    });

    super(
      uniqueId,
      initialSkuObj,
      initialPriceObj,
      maxQuantity,
      orderType,
      attribute1,
      attribute2,
      initialOnetimeAndSmartshipDifference,
      initialDiscountPrice,
      initialDiscountPercent,
      initialSmartshipDiscountPrice,
      initialSmartshipDiscountPercent,
      finalPrice,
      hasDiscount,
      accessLevels,
      customUsers,
      initialIsOutOfStock,
      bonusValue,
      variationImage,
      variationDetails
    );

    this.price = +varItem.mvproduct_price;
    this.sku = varItem.mvproduct_sku;

    const {
      skuObj,
      priceObj,
      discountPrice,
      discountPercent,
      smartshipDiscountPrice,
      smartshipDiscountPercent,
      onetimeAndSmartshipDifference,
      isOutOfStock,
    } = this.getProductPricesAndSkus(
      variationResponse,
      attribute1,
      attribute2,
      variationsArrayResponse
    );

    this.skuObj = skuObj;
    this.priceObj = priceObj;
    this.discountPrice = discountPrice;
    this.discountPercent = discountPercent;
    this.smartshipDiscountPrice = smartshipDiscountPrice;
    this.smartshipDiscountPercent = smartshipDiscountPercent;
    this.onetimeAndSmartshipDifference = onetimeAndSmartshipDifference;
    this.isOutOfStock = isOutOfStock;
  }

  private getProductPricesAndSkus(
    variation: any,
    attribute1: string,
    attribute2: string,
    variationsArray: any
  ): {
    skuObj: ProductVariationBase['skuObj'];
    priceObj: ProductVariationBase['priceObj'];
    discountPrice: number;
    discountPercent: number;
    smartshipDiscountPrice: number;
    smartshipDiscountPercent: number;
    onetimeAndSmartshipDifference: number;
    isOutOfStock: boolean;
  } {
    let skuObj = {} as ProductVariationBase['skuObj'];
    let priceObj = {} as ProductVariationBase['priceObj'];
    let discountPrice = 0;
    let discountPercent = 0;
    let smartshipDiscountPrice = 0;
    let smartshipDiscountPercent = 0;
    let onetimeAndSmartshipDifference = 0;
    let isOutOfStock = false;

    const varItem = variation[1];

    const orderType1Obj = this.calculateAllPricesAndSkus(
      'ordertype_1',
      attribute1,
      attribute2,
      variationsArray
    );
    const orderType2Obj = this.calculateAllPricesAndSkus(
      'ordertype_2',
      attribute1,
      attribute2,
      variationsArray
    );

    if (varItem.mvproduct_ordertype === 'ordertype_3') {
      skuObj = {
        oneTime: orderType1Obj.sku,
        everyMonth: orderType2Obj.sku,
      };

      priceObj = {
        oneTime: orderType1Obj.price,
        everyMonth: orderType2Obj.price,
      };

      discountPrice = orderType1Obj.discountPrice;
      discountPercent = orderType1Obj.discountPercent;
      smartshipDiscountPrice = orderType1Obj.smartshipDiscountPrice;
      smartshipDiscountPercent = orderType1Obj.smartshipDiscountPercent;

      isOutOfStock =
        (varItem.hasOwnProperty('mvproduct_outof_stock') &&
          varItem.mvproduct_outof_stock === 'on') ||
        orderType1Obj.isOutOfStock;
    } else if (varItem.mvproduct_ordertype === 'ordertype_2') {
      skuObj = {
        oneTime: orderType1Obj.sku,
        everyMonth: varItem.mvproduct_sku,
      };

      priceObj = {
        oneTime: orderType1Obj.price,
        everyMonth: +varItem.mvproduct_price,
      };

      discountPrice = 0;
      discountPercent = 0;
      smartshipDiscountPrice = 0;
      smartshipDiscountPercent = 0;

      isOutOfStock =
        varItem.hasOwnProperty('mvproduct_outof_stock') &&
        varItem.mvproduct_outof_stock === 'on';
    } else {
      skuObj = {
        oneTime: varItem.mvproduct_sku,
        everyMonth: orderType2Obj.sku,
      };

      priceObj = {
        oneTime: +varItem.mvproduct_price,
        everyMonth: orderType2Obj.price,
      };

      discountPercent = varItem.hasOwnProperty('percent_of_discount')
        ? +varItem.percent_of_discount
        : 0;
      discountPrice = this.calculateDiscountPrice(
        priceObj.oneTime,
        discountPercent
      );

      smartshipDiscountPercent = varItem.hasOwnProperty(
        'percent_of_smartship_discount'
      )
        ? +varItem.percent_of_smartship_discount
        : 0;
      smartshipDiscountPrice = this.calculateDiscountPrice(
        priceObj.oneTime,
        smartshipDiscountPercent
      );

      isOutOfStock =
        varItem.hasOwnProperty('mvproduct_outof_stock') &&
        varItem.mvproduct_outof_stock === 'on';
    }

    onetimeAndSmartshipDifference =
      priceObj.oneTime - priceObj.everyMonth > 0
        ? priceObj.oneTime - priceObj.everyMonth
        : 0;

    return {
      skuObj,
      priceObj,
      discountPrice,
      discountPercent,
      smartshipDiscountPrice,
      smartshipDiscountPercent,
      onetimeAndSmartshipDifference,
      isOutOfStock,
    };
  }

  private calculateAllPricesAndSkus(
    orderType: string,
    attribute1: string,
    attribute2: string,
    variationsArray: any
  ): {
    sku: string;
    price: number;
    discountPrice: number;
    discountPercent: number;
    smartshipDiscountPrice: number;
    smartshipDiscountPercent: number;
    isOutOfStock: boolean;
  } {
    let sku = '';
    let price = 0;
    let discountPrice = 0;
    let discountPercent = 0;
    let smartshipDiscountPrice = 0;
    let smartshipDiscountPercent = 0;
    let isOutOfStock = false;

    variationsArray.forEach((variation: any) => {
      const varItem = variation[1];

      if (varItem.attribute1 === attribute1) {
        if (varItem.attribute2 !== '') {
          if (varItem.attribute2 === attribute2) {
            if (varItem.mvproduct_ordertype === orderType) {
              sku = varItem.mvproduct_sku;
              price = +varItem.mvproduct_price;

              discountPercent = varItem.hasOwnProperty('percent_of_discount')
                ? +varItem.percent_of_discount
                : 0;
              discountPrice = this.calculateDiscountPrice(
                price,
                discountPercent
              );

              smartshipDiscountPercent = varItem.hasOwnProperty(
                'percent_of_smartship_discount'
              )
                ? +varItem.percent_of_smartship_discount
                : 0;
              smartshipDiscountPrice = this.calculateDiscountPrice(
                price,
                smartshipDiscountPercent
              );

              isOutOfStock =
                varItem.hasOwnProperty('mvproduct_outof_stock') &&
                varItem.mvproduct_outof_stock === 'on';
            }
          }
        } else {
          if (varItem.mvproduct_ordertype === orderType) {
            sku = varItem.mvproduct_sku;
            price = +varItem.mvproduct_price;

            discountPercent = varItem.hasOwnProperty('percent_of_discount')
              ? +varItem.percent_of_discount
              : 0;
            discountPrice = this.calculateDiscountPrice(price, discountPercent);

            smartshipDiscountPercent = varItem.hasOwnProperty(
              'percent_of_smartship_discount'
            )
              ? +varItem.percent_of_smartship_discount
              : 0;
            smartshipDiscountPrice = this.calculateDiscountPrice(
              price,
              smartshipDiscountPercent
            );

            isOutOfStock =
              varItem.hasOwnProperty('mvproduct_outof_stock') &&
              varItem.mvproduct_outof_stock === 'on';
          }
        }
      }
    });

    return {
      sku,
      price,
      discountPrice,
      discountPercent,
      smartshipDiscountPrice,
      smartshipDiscountPercent,
      isOutOfStock,
    };
  }

  private calculateDiscountPrice(oneTimePrice: number, percent: number) {
    return percent > 0 ? oneTimePrice - (percent / 100) * oneTimePrice : 0;
  }
}
