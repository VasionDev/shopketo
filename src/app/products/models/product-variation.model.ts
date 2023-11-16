import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { ProductsUtilityService } from '../services/products-utility.service';
import { ProductServingObj } from './product-serving.model';
import { environment } from 'src/environments/environment';

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
    public regularSSDiscountPercent: number,
    public regularSSDiscountPrice: number,
    public finalPrice: number,
    public hasDiscount: boolean,
    public accessLevels: ProductAccess,
    public customUsers: number[],
    public ssDiscountAccessLevels: ProductAccess,
    public ssDiscountCustomUsers: number[],
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

    const ssDiscountCustomUsers = varItem.hasOwnProperty('custom_users_list')
    ? varItem.custom_users_list.map((user: string) => +user[0])
    : [];
  const ssDiscountAccessLevels = productUtilityService.getAccessLevels(
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

    const initialSSDiscountPercent = 0;
    const initialSSDiscountPrice = 0;

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
      initialSSDiscountPrice,
      initialSSDiscountPercent,
      finalPrice,
      hasDiscount,
      accessLevels,
      customUsers,
      ssDiscountAccessLevels,
      ssDiscountCustomUsers,
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
      regularSSDiscountPercent,
      regularSSDiscountPrice,
      onetimeAndSmartshipDifference,
      isOutOfStock,
      modifiedAccessLevels,
      ssAccessLevels
    } = this.getProductPricesAndSkus(
      variationResponse,
      attribute1,
      attribute2,
      variationsArrayResponse,
      productUtilityService
    );

    if(orderType == 'ordertype_2') this.price = priceObj.everyMonth

    this.skuObj = skuObj;
    this.priceObj = priceObj;
    this.discountPrice = discountPrice;
    this.discountPercent = discountPercent;
    this.smartshipDiscountPrice = smartshipDiscountPrice;
    this.smartshipDiscountPercent = smartshipDiscountPercent;
    this.regularSSDiscountPercent = regularSSDiscountPercent;
    this.regularSSDiscountPrice = regularSSDiscountPrice;
    this.onetimeAndSmartshipDifference = onetimeAndSmartshipDifference;
    this.isOutOfStock = isOutOfStock;
    this.accessLevels = modifiedAccessLevels;
    this.ssDiscountAccessLevels = ssAccessLevels;
  }

  private getProductPricesAndSkus(
    variation: any,
    attribute1: string,
    attribute2: string,
    variationsArray: any,
    productUtilityService: ProductsUtilityService
  ): {
    skuObj: ProductVariationBase['skuObj'];
    priceObj: ProductVariationBase['priceObj'];
    discountPrice: number;
    discountPercent: number;
    smartshipDiscountPrice: number;
    smartshipDiscountPercent: number;
    regularSSDiscountPercent: number;
    regularSSDiscountPrice: number;
    onetimeAndSmartshipDifference: number;
    isOutOfStock: boolean;
    modifiedAccessLevels: ProductAccess;
    ssAccessLevels: ProductAccess;
  } {
    let skuObj = {} as ProductVariationBase['skuObj'];
    let priceObj = {} as ProductVariationBase['priceObj'];
    let discountPrice = 0;
    let discountPercent = 0;
    let smartshipDiscountPrice = 0;
    let smartshipDiscountPercent = 0;
    let regularSSDiscountPercent = 0;
    let regularSSDiscountPrice = 0;
    let onetimeAndSmartshipDifference = 0;
    let isOutOfStock = false;
    let modifiedAccessLevels: ProductAccess = {
      isHidden: {
        on: false,
        title: 'Hidden',
      },
      isEveryone: {
        on: false,
        title: 'Everyone',
      },
      isVisitor: {
        on: false,
        title: 'Visitors',
      },
      isLoggedUser: {
        on: false,
        title: 'Logged in Users',
      },
      isCustomer: {
        on: false,
        title: 'Customers',
      },
      isPromoter: {
        on: false,
        title: 'Promoters',
      },
      isRank6: {
        on: false,
        title: 'Rank 6',
      },
      isRank7: {
        on: false,
        title: 'Rank 7',
      },
      isRank8: {
        on: false,
        title: 'Rank 8',
      },
      isSmartship: {
        on: false,
        title: 'VIP Prüvers',
      },
      isLoggedSmartship: {
        on: false,
        title: 'Logged In VIP Prüvers',
      },
      isLoyalSmartship: {
        on: false,
        title: 'Loyal Active Smartship',
      },
      isVip: {
        on: false,
        title: 'VIP',
      },
      isVipPlus: {
        on: false,
        title: 'VIP+',
      },
      isCustom: {
        on: false,
        title: 'Custom users',
      },
      isSpromoter: {
        on: false,
        title: 'S&SPromoters'
      },
      isScustomer: {
        on: false,
        title: 'S&SCustomers'
      }
    };

    let ssAccessLevels: ProductAccess;

    let isVipPlusExist: boolean = false;
    const LocalMVUser = sessionStorage.getItem('MVUser');
    const user = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    if (user) {
      isVipPlusExist = user?.mvuser_scopes.includes('vipPlus');
    }
    const viDiscount = isVipPlusExist ? 25 : 15;

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

      if(environment.tenant === 'pruvit') {
        priceObj = {
          oneTime: orderType1Obj.price,
          everyMonth: orderType2Obj.price > 0 ? (orderType1Obj.price > 0 ? this.staticSmartshipDiscount(orderType1Obj.price, viDiscount) : orderType2Obj.price) : 0,
        };
      }else {
        priceObj = {
          oneTime: orderType1Obj.price,
          everyMonth: orderType2Obj.price,
        };
      }

      discountPrice = orderType1Obj.discountPrice;
      discountPercent = orderType1Obj.discountPercent;
      smartshipDiscountPrice = orderType1Obj.smartshipDiscountPrice;
      smartshipDiscountPercent = orderType1Obj.smartshipDiscountPercent;

      isOutOfStock =
        (varItem.hasOwnProperty('mvproduct_outof_stock') &&
          varItem.mvproduct_outof_stock === 'on') ||
        orderType1Obj.isOutOfStock;
      modifiedAccessLevels = productUtilityService.getAccessLevels(orderType1Obj.availabilityFor);
      ssAccessLevels = productUtilityService.getAccessLevels(orderType2Obj.availabilityFor);
    } else if (varItem.mvproduct_ordertype === 'ordertype_2') {
      skuObj = {
        oneTime: orderType1Obj.sku,
        everyMonth: varItem.mvproduct_sku,
      };

      if(environment.tenant === 'pruvit') {
        priceObj = {
          oneTime: orderType1Obj.price,
          everyMonth: +varItem.mvproduct_price > 0 ? (orderType1Obj.price > 0 ? this.staticSmartshipDiscount(orderType1Obj.price, viDiscount) : +varItem.mvproduct_price) : 0,
        };
      }else {
        priceObj = {
          oneTime: orderType1Obj.price,
          everyMonth: +varItem.mvproduct_price,
        };
      }

      discountPrice = 0;
      discountPercent = 0;
      smartshipDiscountPrice = 0;
      smartshipDiscountPercent = 0;

      isOutOfStock =
        varItem.hasOwnProperty('mvproduct_outof_stock') &&
        varItem.mvproduct_outof_stock === 'on';
      modifiedAccessLevels = productUtilityService.getAccessLevels(orderType2Obj.availabilityFor);
      ssAccessLevels = productUtilityService.getAccessLevels(orderType2Obj.availabilityFor);
    } else {
      skuObj = {
        oneTime: varItem.mvproduct_sku,
        everyMonth: orderType2Obj.sku,
      };

      if(environment.tenant === 'pruvit') {
        priceObj = {
          oneTime: +varItem.mvproduct_price,
          everyMonth: orderType2Obj.price > 0 ? (+varItem.mvproduct_price > 0 ? this.staticSmartshipDiscount(+varItem.mvproduct_price, viDiscount) : orderType2Obj.price) : 0,
        };
      }else {
        priceObj = {
          oneTime: +varItem.mvproduct_price,
          everyMonth: orderType2Obj.price,
        };
      }

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
      modifiedAccessLevels = productUtilityService.getAccessLevels(orderType1Obj.availabilityFor);
      ssAccessLevels = productUtilityService.getAccessLevels(orderType2Obj.availabilityFor);
    }

    regularSSDiscountPercent = orderType2Obj.ssDiscountPercent;
    regularSSDiscountPrice = this.staticSmartshipDiscount(
      priceObj.oneTime > 0 ? priceObj.oneTime : priceObj.everyMonth,
      regularSSDiscountPercent
    );

    onetimeAndSmartshipDifference =
      priceObj.oneTime - priceObj.everyMonth > 0
        ? +(priceObj.oneTime - priceObj.everyMonth).toFixed(2)
        : 0;

    return {
      skuObj,
      priceObj,
      discountPrice,
      discountPercent,
      smartshipDiscountPrice,
      smartshipDiscountPercent,
      regularSSDiscountPercent,
      regularSSDiscountPrice,
      onetimeAndSmartshipDifference,
      isOutOfStock,
      modifiedAccessLevels,
      ssAccessLevels
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
    ssDiscountPercent: number;
    isOutOfStock: boolean;
    availabilityFor: string
  } {
    let sku = '';
    let price = 0;
    let discountPrice = 0;
    let discountPercent = 0;
    let smartshipDiscountPrice = 0;
    let smartshipDiscountPercent = 0;
    let ssDiscountPercent = 0;
    let isOutOfStock = false;
    let availabilityFor = '';

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

              ssDiscountPercent = varItem.hasOwnProperty(
                'ss_discount'
              )
                ? +varItem.ss_discount
                : 0;

              isOutOfStock =
                varItem.hasOwnProperty('mvproduct_outof_stock') &&
                varItem.mvproduct_outof_stock === 'on';
              availabilityFor = 
                varItem.hasOwnProperty('availability_for') ? varItem.availability_for : '';
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

            ssDiscountPercent = varItem.hasOwnProperty(
              'ss_discount'
            )
              ? +varItem.ss_discount
              : 0;

            isOutOfStock =
              varItem.hasOwnProperty('mvproduct_outof_stock') &&
              varItem.mvproduct_outof_stock === 'on';
            availabilityFor = 
              varItem.hasOwnProperty('availability_for') ? varItem.availability_for : '';
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
      ssDiscountPercent,
      isOutOfStock,
      availabilityFor
    };
  }

  private calculateDiscountPrice(oneTimePrice: number, percent: number) {
    return percent > 0 ? oneTimePrice - (percent / 100) * oneTimePrice : 0;
  }

  private staticSmartshipDiscount(regularPrice: number, discountPercent: number) {
    if(regularPrice > 0 && discountPercent > 0) {
      const discountAmount = +((regularPrice * discountPercent) / 100).toFixed(2);
      return regularPrice - discountAmount;
    }
    return 0;
  }
}
