import { Injectable } from '@angular/core';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { CartTotal } from 'src/app/shared/models/cart-total.model';
import { Cart } from '../models/cart.model';
import { CurrencyPipe } from '../pipes/currency.pipe';
import { AppDataService } from './app-data.service';
import { AppUserService } from './app-user.service';

@Injectable({
  providedIn: 'root',
})
export class AppCartTotalService {
  user: any;

  constructor(
    private userService: AppUserService,
    private currencyPipe: CurrencyPipe,
    private dataService: AppDataService
  ) {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.user = user;
      }
    });
  }

  getQualifiedSkus(cartTotalDiscount: any, isOneTime: boolean): Array<string> {
    const qualifiedSkus: Array<string> = [];

    const qualifiedKeys = isOneTime
      ? cartTotalDiscount?.cart_total_discounted_qualified_sku
      : cartTotalDiscount?.smartship_cart_total_discounted_qualified_sku;

    if (qualifiedKeys) {
      Object.entries(qualifiedKeys).forEach((element: any[]) => {
        qualifiedSkus.push(element[1].sku);
      });
    }

    return qualifiedSkus;
  }

  getDiscountedSkus(
    cartTotalDiscount: any,
    isOneTime: boolean
  ): Array<{ sku: string; percent: number }> {
    const discountedSkus: Array<{ sku: string; percent: number }> = [];

    const discountedKeys = isOneTime
      ? cartTotalDiscount?.cart_total_discounted_sku
      : cartTotalDiscount?.smartship_cart_total_discounted_sku;

    if (discountedKeys) {
      Object.entries(discountedKeys).forEach((element: any[]) => {
        discountedSkus.push({
          sku: element[1].sku,
          percent: +element[1].price,
        });
      });
    }

    return discountedSkus;
  }

  checkCartTotalEnabled(
    carts: any[],
    isOneTime: boolean,
    qualifiedSkus: string[]
  ) {
    const isQualifiedSkuFound: boolean = carts.some((item: any) => {
      if (isOneTime) {
        return qualifiedSkus.indexOf(item.cart.productSku.oneTime) !== -1;
      } else {
        return qualifiedSkus.indexOf(item.cart.productSku.everyMonth) !== -1;
      }
    });

    return isQualifiedSkuFound;
  }

  calculateCartTotalRequiredItems(
    isOneTime: boolean,
    carts: any[],
    qualifiedSkus: string[]
  ) {
    return isOneTime
      ? carts.reduce((sum: number, oneTimeItem: any) => {
          if (
            qualifiedSkus.indexOf(oneTimeItem.cart.productSku.oneTime) !== -1
          ) {
            return sum + oneTimeItem.cart.quantity;
          } else {
            return sum;
          }
        }, 0)
      : carts.reduce((sum: number, everyMonthItem: any) => {
          if (
            qualifiedSkus.indexOf(everyMonthItem.cart.productSku.everyMonth) !==
            -1
          ) {
            return sum + everyMonthItem.cart.quantity;
          } else {
            return sum;
          }
        }, 0);
  }

  calculateOneTimeTotalSumPrice(
    oneTimeCart: any[],
    everyMonthCart: any[],
    qualifiedSkus: string[],
    settings: any
  ) {
    const isSmartshipOnForOneTime =
      settings?.smartship_discount === 0 ? false : true;

    const isSmartshipUserCanAccess = this.userService.checkSmartshipUserAccess(
      isSmartshipOnForOneTime
    );

    return oneTimeCart.reduce((sum: number, oneTimeItem: any) => {
      if (qualifiedSkus.indexOf(oneTimeItem.cart.productSku.oneTime) !== -1) {
        const includeRegularDiscount = settings?.include_regular_discount;

        let updatedDiscountPrice = 0;
        if (oneTimeItem.cart.smartshipDiscountPrice !== 0) {
          if (
            everyMonthCart.length > 0 ||
            (this.user !== null && this.user?.food_autoship) ||
            (this.user !== null && this.user?.keto_autoship) ||
            isSmartshipUserCanAccess
          ) {
            updatedDiscountPrice =
              oneTimeItem.cart.discountPrice <
                oneTimeItem.cart.smartshipDiscountPrice &&
              oneTimeItem.cart.discountPrice !== 0
                ? oneTimeItem.cart.discountPrice
                : oneTimeItem.cart.smartshipDiscountPrice;
          } else {
            updatedDiscountPrice = oneTimeItem.cart.discountPrice;
          }
        } else {
          updatedDiscountPrice = oneTimeItem.cart.discountPrice;
        }

        if (includeRegularDiscount) {
          if (updatedDiscountPrice !== 0) {
            return sum + updatedDiscountPrice * oneTimeItem.cart.quantity;
          } else {
            return (
              sum + oneTimeItem.cart.price.oneTime * oneTimeItem.cart.quantity
            );
          }
        } else {
          return (
            sum + oneTimeItem.cart.price.oneTime * oneTimeItem.cart.quantity
          );
        }
      } else {
        return sum;
      }
    }, 0);
  }

  calculateEveryMonthTotalSumPrice(
    everyMonthCart: any[],
    qualifiedSkus: string[],
    settings: any
  ) {
    return everyMonthCart.reduce((sum: number, everyMonthItem: any) => {
      if (
        qualifiedSkus.indexOf(everyMonthItem.cart.productSku.everyMonth) !== -1
      ) {
        const includeRegularDiscount = settings?.include_regular_discount;

        if (includeRegularDiscount) {
          return (
            sum +
            everyMonthItem.cart.price.everyMonth * everyMonthItem.cart.quantity
          );
        } else {
          return (
            sum +
            everyMonthItem.cart.price.oneTime * everyMonthItem.cart.quantity
          );
        }
      } else {
        return sum;
      }
    }, 0);
  }

  getCartTotalRequiredPriceOrItems(
    settings: any,
    sumPriceOrRequiredItems: number
  ) {
    const cartTotalPriceOrItems =
      settings?.cart_discount === 'cart_total_value'
        ? +settings?.cart_total_price
        : +settings?.cart_total_item;

    return cartTotalPriceOrItems - sumPriceOrRequiredItems >= 0
      ? cartTotalPriceOrItems - sumPriceOrRequiredItems
      : 0;
  }

  getCartTotalBannerText(
    settings: any,
    requiredPriceOrItems: number,
    productSettings: ProductSettings
  ) {
    return settings !== ''
      ? settings?.cart_discount === 'cart_total_value'
        ? (settings?.banner_info?.banner_text as string)?.replace(
            '{XXX}',
            productSettings.currencySymbol +
              this.currencyPipe.transform(requiredPriceOrItems, productSettings)
          )
        : (settings?.banner_info?.banner_text as string)?.replace(
            '{XXX}',
            requiredPriceOrItems.toString()
          )
      : '';
  }

  getInitialDiscountText(
    settings: any,
    productSettings: ProductSettings,
    discountedSkus: Array<{ sku: string; percent: number }>,
    catalogOneTimeSku: string,
    catalogOneTimePrice: number
  ) {
    let finalInitialDiscountText = '';

    const cartTotalPriceOrItems =
      settings?.cart_discount === 'cart_total_value'
        ? +settings?.cart_total_price
        : +settings?.cart_total_item;

    let cartTotalDiscountPrice = 0;

    discountedSkus.forEach((skuObj) => {
      if (skuObj.sku === catalogOneTimeSku) {
        cartTotalDiscountPrice =
          catalogOneTimePrice - (skuObj.percent / 100) * catalogOneTimePrice;
      }
    });

    finalInitialDiscountText = settings?.banner_info?.discount_initial_text
      ? settings?.cart_discount === 'cart_total_value'
        ? (settings?.banner_info?.discount_initial_text as string)?.replace(
            '{YYY}',
            productSettings.currencySymbol +
              this.currencyPipe.transform(
                cartTotalPriceOrItems,
                productSettings
              )
          )
        : (settings?.banner_info?.discount_initial_text as string)?.replace(
            '{YYY}',
            cartTotalPriceOrItems.toString()
          )
      : '';

    finalInitialDiscountText =
      finalInitialDiscountText !== ''
        ? finalInitialDiscountText?.replace(
            '{XXX}',
            productSettings.currencySymbol +
              this.currencyPipe.transform(
                cartTotalDiscountPrice,
                productSettings
              )
          )
        : '';

    return finalInitialDiscountText;
  }

  getCartTotalProgressPercent(settings: any, requiredPriceOrItems: number) {
    const cartTotalPriceOrItems =
      settings?.cart_discount === 'cart_total_value'
        ? +settings?.cart_total_price
        : +settings?.cart_total_item;

    return requiredPriceOrItems > 0
      ? 100 - Math.round((requiredPriceOrItems * 100) / cartTotalPriceOrItems)
      : 100;
  }

  checkCartTotalUnlocked(
    everyMonthCart: any[],
    settings: any,
    isEnabled: boolean,
    requiredPriceOrItems: number
  ) {
    let isUnlocked: boolean;

    const isSmartshipOnForOneTime =
      settings?.smartship_discount === 0 ? false : true;

    const isSmartshipUserCanAccess = this.userService.checkSmartshipUserAccess(
      isSmartshipOnForOneTime
    );

    if (isEnabled && requiredPriceOrItems <= 0) {
      if (isSmartshipOnForOneTime) {
        if (
          everyMonthCart.length > 0 ||
          (this.user !== null && this.user?.food_autoship) ||
          (this.user !== null && this.user?.keto_autoship) ||
          isSmartshipUserCanAccess
        ) {
          isUnlocked = true;
        } else {
          isUnlocked = false;
        }
      } else {
        isUnlocked = true;
      }
    } else {
      isUnlocked = false;
    }

    return isUnlocked;
  }

  checkCartTotalAlmostUnlocked(
    everyMonthCart: any[],
    settings: any,
    isEnabled: boolean,
    requiredPriceOrItems: number
  ) {
    let isAlmostUnlocked: boolean;

    const isSmartshipOnForOneTime =
      settings?.smartship_discount === 0 ? false : true;

    const isSmartshipUserCanAccess = this.userService.checkSmartshipUserAccess(
      isSmartshipOnForOneTime
    );

    if (isEnabled && requiredPriceOrItems <= 0) {
      if (isSmartshipOnForOneTime) {
        if (
          everyMonthCart.length > 0 ||
          (this.user !== null && this.user?.food_autoship) ||
          (this.user !== null && this.user?.keto_autoship) ||
          isSmartshipUserCanAccess
        ) {
          isAlmostUnlocked = false;
        } else {
          isAlmostUnlocked = true;
        }
      } else {
        isAlmostUnlocked = false;
      }
    } else {
      isAlmostUnlocked = false;
    }

    return isAlmostUnlocked;
  }

  checkDiscountableInCart(
    carts: any[],
    isOneTime: boolean,
    discountedSkus: {
      sku: string;
      percent: number;
    }[]
  ) {
    let isDiscountedSkuFound = false;

    carts.forEach((item: any) => {
      const found = discountedSkus.find((skuObj) => {
        if (isOneTime) {
          return skuObj.sku === item.cart.productSku.oneTime;
        } else {
          return skuObj.sku === item.cart.productSku.everyMonth;
        }
      });

      if (found) {
        isDiscountedSkuFound = true;
      }
    });

    return isDiscountedSkuFound;
  }

  checkDiscountableInCatalog(
    catalogSku: string,
    discountedSkus: {
      sku: string;
      percent: number;
    }[]
  ) {
    let isDiscountedSkuFound = false;

    const found = discountedSkus.find((skuObj) => skuObj.sku === catalogSku);

    if (found) {
      isDiscountedSkuFound = true;
    }

    return isDiscountedSkuFound;
  }

  /* ------------ Cart total final Object ---------------------- */
  getCartTotalObject(
    isOneTime: boolean,
    discount: any,
    oneTimeCart: Cart[],
    everyMonthCart: Cart[],
    productSettings: ProductSettings,
    catalogOneTimeSku: string,
    catalogOneTimePrice: number,
    maxRegularDiscount: number
  ): CartTotal {
    const settings = isOneTime
      ? discount?.cart_total_settings
      : discount?.smartship_cart_total_settings;

    const qualifiedSkus = this.getQualifiedSkus(discount, isOneTime);

    const discountedSkus = this.getDiscountedSkus(discount, isOneTime);

    const isEnabled = isOneTime
      ? this.checkCartTotalEnabled(oneTimeCart, isOneTime, qualifiedSkus)
      : this.checkCartTotalEnabled(everyMonthCart, isOneTime, qualifiedSkus);

    const isDiscountableInCart = isOneTime
      ? this.checkDiscountableInCart(oneTimeCart, isOneTime, discountedSkus)
      : this.checkDiscountableInCart(everyMonthCart, isOneTime, discountedSkus);

    const isDiscountableInCatalog = this.checkDiscountableInCatalog(
      catalogOneTimeSku,
      discountedSkus
    );

    const sumPrice = isOneTime
      ? this.calculateOneTimeTotalSumPrice(
          oneTimeCart,
          everyMonthCart,
          qualifiedSkus,
          settings
        )
      : this.calculateEveryMonthTotalSumPrice(
          everyMonthCart,
          qualifiedSkus,
          settings
        );

    const qualifiedItems = isOneTime
      ? this.calculateCartTotalRequiredItems(
          isOneTime,
          oneTimeCart,
          qualifiedSkus
        )
      : this.calculateCartTotalRequiredItems(
          isOneTime,
          everyMonthCart,
          qualifiedSkus
        );

    const requiredPriceOrItems =
      settings?.cart_discount === 'cart_total_value'
        ? this.getCartTotalRequiredPriceOrItems(settings, sumPrice)
        : this.getCartTotalRequiredPriceOrItems(settings, qualifiedItems);

    const bannerText = this.getCartTotalBannerText(
      settings,
      requiredPriceOrItems,
      productSettings
    );

    const initialDiscountText = this.getInitialDiscountText(
      settings,
      productSettings,
      discountedSkus,
      catalogOneTimeSku,
      catalogOneTimePrice
    );

    const progressPercent = this.getCartTotalProgressPercent(
      settings,
      requiredPriceOrItems
    );

    const isUnlocked = this.checkCartTotalUnlocked(
      everyMonthCart,
      settings,
      isEnabled,
      requiredPriceOrItems
    );

    const isAlmostUnlocked = this.checkCartTotalAlmostUnlocked(
      everyMonthCart,
      settings,
      isEnabled,
      requiredPriceOrItems
    );

    const unlockedText = settings?.banner_info
      ?.discount_unlocked_text as string;

    const almostUnlockedText = settings?.banner_info
      ?.discount_eligble_text_1 as string;

    const claimText = settings?.banner_info?.discount_eligble_text_2 as string;

    let maxCartTotalDiscount = Number.MAX_SAFE_INTEGER;

    discountedSkus.forEach((skuObj) => {
      if (skuObj.sku === catalogOneTimeSku) {
        const discount =
          catalogOneTimePrice - (skuObj.percent / 100) * catalogOneTimePrice;

        maxCartTotalDiscount = Math.min(maxCartTotalDiscount, discount);
      }
    });

    if (maxCartTotalDiscount === Number.MAX_SAFE_INTEGER) {
      maxCartTotalDiscount = 0;
    }

    let discountObj = Object.assign(
      {},
      {
        settings,
        qualifiedSkus,
        discountedSkus,
        isEnabled,
        isDiscountableInCart,
        isDiscountableInCatalog: false,
        sumPrice,
        requiredPriceOrItems,
        initialDiscountText,
        bannerText,
        progressPercent,
        isUnlocked: false,
        isAlmostUnlocked: false,
        unlockedText: unlockedText ? unlockedText : '',
        almostUnlockedText: almostUnlockedText ? almostUnlockedText : '',
        claimText: claimText ? claimText : '',
        showItem: !(
          typeof maxRegularDiscount !== 'undefined' &&
          maxRegularDiscount !== 0 &&
          maxCartTotalDiscount !== 0 &&
          maxCartTotalDiscount >= maxRegularDiscount
        ),
      }
    );

    if (isOneTime) {
      discountObj = {
        ...discountObj,
        isUnlocked,
        isAlmostUnlocked,
      };
    }

    if (catalogOneTimeSku !== '') {
      discountObj = {
        ...discountObj,
        isDiscountableInCatalog,
      };
    }

    return discountObj;
  }

  getOneTimeBestCartTotalPriceAndStatus(
    regularDiscountedPrice: number,
    oneTimePrice: number,
    oneTimeSku: string,
    cartTotal: CartTotal,
    everyMonthCart: any[]
  ): { price: number; status: boolean } {
    let productPrice = 0;
    let productStatus: boolean;

    let cartTotalOneTimeDiscountedPrice = 0;

    cartTotal.discountedSkus.forEach((skuObj) => {
      if (skuObj.sku === oneTimeSku) {
        cartTotalOneTimeDiscountedPrice =
          oneTimePrice - (skuObj.percent / 100) * oneTimePrice;
      }
    });

    const isSmartshipOnForOneTime =
      cartTotal.settings?.smartship_discount === 0 ? false : true;

    const isSmartshipUserCanAccess = this.userService.checkSmartshipUserAccess(
      isSmartshipOnForOneTime
    );

    if (regularDiscountedPrice === 0 && cartTotalOneTimeDiscountedPrice === 0) {
      productPrice = oneTimePrice;
      productStatus = false;
    } else if (
      regularDiscountedPrice === 0 &&
      cartTotalOneTimeDiscountedPrice !== 0
    ) {
      if (isSmartshipOnForOneTime) {
        if (
          everyMonthCart.length > 0 ||
          (this.user !== null && this.user?.food_autoship) ||
          (this.user !== null && this.user?.keto_autoship) ||
          isSmartshipUserCanAccess
        ) {
          if (cartTotal.isEnabled && cartTotal.requiredPriceOrItems <= 0) {
            productPrice = cartTotalOneTimeDiscountedPrice;
            productStatus = true;
          } else {
            productPrice = oneTimePrice;
            productStatus = false;
          }
        } else {
          productPrice = oneTimePrice;
          productStatus = false;
        }
      } else {
        if (cartTotal.isEnabled && cartTotal.requiredPriceOrItems <= 0) {
          productPrice = cartTotalOneTimeDiscountedPrice;
          productStatus = true;
        } else {
          productPrice = oneTimePrice;
          productStatus = false;
        }
      }
    } else if (
      regularDiscountedPrice !== 0 &&
      cartTotalOneTimeDiscountedPrice === 0
    ) {
      productPrice = regularDiscountedPrice;
      productStatus = true;
    } else {
      const maximumDiscount =
        cartTotalOneTimeDiscountedPrice >= regularDiscountedPrice
          ? regularDiscountedPrice
          : cartTotalOneTimeDiscountedPrice;

      if (cartTotal.isEnabled && cartTotal.requiredPriceOrItems <= 0) {
        if (isSmartshipOnForOneTime) {
          if (
            everyMonthCart.length > 0 ||
            (this.user !== null && this.user?.food_autoship) ||
            (this.user !== null && this.user?.keto_autoship) ||
            isSmartshipUserCanAccess
          ) {
            productPrice = maximumDiscount;
            productStatus = true;
          } else {
            productPrice = regularDiscountedPrice;
            productStatus = true;
          }
        } else {
          productPrice = maximumDiscount;
          productStatus = true;
        }
      } else {
        productPrice = regularDiscountedPrice;
        productStatus = true;
      }
    }
    return { price: productPrice, status: productStatus };
  }

  removeDisqualifiedFromCartTotalOneTime(
    cartTotalOneTime: CartTotal[],
    isForCatalog: boolean
  ) {
    cartTotalOneTime = isForCatalog
      ? cartTotalOneTime.filter((oneTime) => oneTime.isDiscountableInCatalog)
      : cartTotalOneTime.filter((oneTime) => oneTime.isDiscountableInCart);

    const isAllTierMet = cartTotalOneTime.every(
      (item: CartTotal) => item.showItem && item.isUnlocked
    );
    const isAllTierShown = cartTotalOneTime.every(
      (item: CartTotal) => item.showItem && !item.isUnlocked
    );

    let lastDiscountedIndex = -1,
      firstNonDiscountedIndex = -1;

    cartTotalOneTime.forEach((cartTotalItem: CartTotal, index: number) => {
      if (cartTotalItem.isUnlocked) {
        lastDiscountedIndex = index;
      }
    });

    firstNonDiscountedIndex = cartTotalOneTime.findIndex(
      (cartTotalItem: CartTotal) => {
        return !cartTotalItem.isUnlocked;
      }
    );

    cartTotalOneTime.forEach((cartTotalItem: CartTotal, index: number) => {
      if (
        isAllTierMet &&
        cartTotalOneTime.length - 1 !== index &&
        cartTotalOneTime.length > 1
      ) {
        cartTotalItem.showItem = false;
      } else if (isAllTierShown && index > 0 && cartTotalOneTime.length > 1) {
        cartTotalItem.showItem = false;
      } else {
        if (
          lastDiscountedIndex !== index &&
          lastDiscountedIndex !== -1 &&
          firstNonDiscountedIndex !== index &&
          firstNonDiscountedIndex !== -1
        ) {
          cartTotalItem.showItem = false;
        }
      }
    });

    return cartTotalOneTime;
  }

  removeDisqualifiedFromEveryMonth(cartTotalEveryMonth: CartTotal[]) {
    cartTotalEveryMonth = cartTotalEveryMonth.filter(
      (everyMonth) => everyMonth.isDiscountableInCart
    );

    const isAllTierMet = cartTotalEveryMonth.every(
      (item: CartTotal) => item.isEnabled && item.requiredPriceOrItems <= 0
    );

    const isAllTierUnlocked = cartTotalEveryMonth.every(
      (item: CartTotal) => item.isEnabled && item.requiredPriceOrItems > 0
    );

    cartTotalEveryMonth.forEach((cartTotalItem: CartTotal, index: number) => {
      if (
        isAllTierMet &&
        cartTotalEveryMonth.length - 1 !== index &&
        cartTotalEveryMonth.length > 1
      ) {
        cartTotalItem.showItem = false;
      }

      if (isAllTierUnlocked && index > 0 && cartTotalEveryMonth.length > 1) {
        cartTotalItem.showItem = false;
      }
    });

    return cartTotalEveryMonth;
  }
}
