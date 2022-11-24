import { DOCUMENT } from '@angular/common';
import {
  ComponentFactoryResolver,
  Inject,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Food } from 'src/app/foods/models/food.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
import { setEveryMonth, setOneTime } from 'src/app/sidebar/store/cart.actions';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { Cart } from '../models/cart.model';
import { isEuropeanCountry } from '../utils/country-list';
import { AppApiService } from './app-api.service';
import { AppDataService } from './app-data.service';
import { AppUserService } from './app-user.service';

declare var $: any;

interface ComponentType<T> {
  new (...args: any[]): T;
}

@Injectable({
  providedIn: 'root',
})
export class AppUtilityService {
  oneTimeCart: Cart[] = [];
  everyMonthCart: Cart[] = [];
  foodsCart: Food[] = [];
  productSkus = '';
  private user: any;
  productSkusWithProdID: string = '';
  private hasLockedProduct: boolean = false;
  private checkoutUrl = '';
  private shareCartUrl = '';
  private redirectUrl = '';
  private language = '';
  private country = '';
  private isStaging: boolean;
  private referrer: any = {};
  private productSettings = {} as ProductSettings;
  private readonly latestCheckoutUrl$ = new BehaviorSubject('');

  constructor(
    private router: Router,
    private dataService: AppDataService,
    private userService: AppUserService,
    private resolver: ComponentFactoryResolver,
    private apiService: AppApiService,
    private store: Store<AppState>,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isStaging = environment.isStaging;
    this.checkoutUrl = environment.checkoutDomain;
    this.shareCartUrl = environment.shareCartDomain;
    this.redirectUrl = environment.redirectDomain;

    this.dataService.currentProductsData$.subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }

      this.productSettings = data.productSettings;
    });

    this.store.select('cartList').subscribe((res) => {
      this.oneTimeCart = res.oneTime ? res.oneTime : [];
      this.everyMonthCart = res.everyMonth ? res.everyMonth : [];
      const oneTimeHasNoRestriction = this.oneTimeCart.filter((cart: Cart)=> {
        return cart.hasUserRestriction && cart.hasUserRestriction === true
      })

      const everyMonthHasNoRestriction = this.everyMonthCart.filter((cart: Cart)=> {
        return cart.hasUserRestriction && cart.hasUserRestriction === true
      })
      if(oneTimeHasNoRestriction.length > 0 || everyMonthHasNoRestriction.length > 0) {
        this.hasLockedProduct = true;
      }else {
        this.hasLockedProduct = false;
      }

      /*const modifiedOnetime = this.oneTimeCart.map(oneTime=> {
        return {...oneTime, orderType: 'ordertype_1'}
      })
      const modifiedEverymonth = this.everyMonthCart.map(everyMonth=> {
        return {...everyMonth, orderType: 'ordertype_2'}
      })
      const totalCart = modifiedOnetime.concat(modifiedEverymonth)
      this.productSkusWithCarts = JSON.stringify(totalCart)*/
      this.setProductSkus();
      this.setProductSkusWithProdID();
    });

    this.store.select('foodsList').subscribe((res) => {
      this.foodsCart = res.checkoutFoods;
    });

    this.dataService.currentSelectedLanguage$.subscribe((language: string) => {
      this.language = language;
    });

    this.dataService.currentSelectedCountry$.subscribe((country: string) => {
      this.country = country;
    });

    this.dataService.currentReferrerData$.subscribe((referrer: any) => {
      if (referrer) {
        this.referrer = referrer;

        // this.setProductSkus();
        // this.setProductSkusWithProdID();
        this.setTinyUrl()
      }
    });

    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.user = user;
      }
    });
  }

  private setProductSkus() {
    let tempProductSkus = '';

    this.oneTimeCart.forEach((element, index) => {
      tempProductSkus +=
        element.cart.productSku.oneTime + ':' + element.cart.quantity;
      if (this.oneTimeCart.length - 1 !== index) {
        tempProductSkus += ',';
      }
    });

    if (this.oneTimeCart.length > 0 && this.everyMonthCart.length > 0) {
      tempProductSkus += ',';
    }

    this.everyMonthCart.forEach((element, index) => {
      tempProductSkus +=
        element.cart.productSku.everyMonth + ':' + element.cart.quantity;
      if (this.everyMonthCart.length - 1 !== index) {
        tempProductSkus += ',';
      }
    });

    this.productSkus = tempProductSkus;
  }

  private setProductSkusWithProdID() {
    let tempProductSkus = '';

    this.oneTimeCart.forEach((element, index) => {
      tempProductSkus +=
        element.cart.productID + ':' + element.cart.productSku.oneTime + ':' + element.cart.quantity;
      if (this.oneTimeCart.length - 1 !== index) {
        tempProductSkus += ',';
      }
    });

    if (this.oneTimeCart.length > 0 && this.everyMonthCart.length > 0) {
      tempProductSkus += ',';
    }

    this.everyMonthCart.forEach((element, index) => {
      tempProductSkus +=
        element.cart.productID + ':' + element.cart.productSku.everyMonth + ':' + element.cart.quantity;
      if (this.everyMonthCart.length - 1 !== index) {
        tempProductSkus += ',';
      }
    });

    this.productSkusWithProdID = tempProductSkus;
  }

  cartHasLockedProduct(): boolean {
    return this.hasLockedProduct;
  }

  setTinyUrl() {

    const referrerCode = this.referrer.hasOwnProperty('code')
      ? this.referrer.code
      : '';
    const gaCode = this.referrer.hasOwnProperty('ga_track_id')
      ? this.referrer.ga_track_id
      : '';
    const fbCode = this.referrer.hasOwnProperty('fb_pixel_id')
      ? this.referrer.fb_pixel_id
      : '';
    
    const baseUrl = this.country.toLowerCase() !== 'us' ? this.shareCartUrl.replace('{country}', this.country.toLowerCase()) : this.shareCartUrl.replace('/{country}', '');
    const rootUrl = baseUrl.replace("{code}", referrerCode);
    let checkoutUrl = '';

    if(isEuropeanCountry(this.country)) {
      this.hasLockedProduct = false;
      checkoutUrl =
      this.checkoutUrl +
      referrerCode +
      '?products=' +
      this.productSkus +
      '&country=' +
      this.country.toLowerCase() +
      '&redirect_url=' +
      this.redirectUrl +
      '&language=' +
      this.language +
      '&gaCode=' +
      gaCode +
      '&fbCode=' +
      fbCode;
    } else {
      checkoutUrl =
      rootUrl + (!environment.isStaging ? '?products=' : '&products=') +
      this.productSkusWithProdID +
      '&lang=' +
      this.language;
    }

    this.latestCheckoutUrl$.next(checkoutUrl);
    this.dataService.setTinyUrl({ isConversionStarted: true, url: '' });
    this.latestCheckoutUrl$
      .pipe(
        take(1),
        switchMap((latestUrl) => {
          return this.apiService.getUnicomShortenUrl({originalUrl: latestUrl});
          // return this.apiService.getTinyUrl(latestUrl);
        })
      )
      .subscribe((tinyUrl) => {
        if (tinyUrl) {
          this.dataService.setTinyUrl({
            isConversionStarted: false,
            url: tinyUrl,
          });
        }
      });
  }

  /*
  private setTinyUrl() {

    const referrerCode = this.referrer.hasOwnProperty('code')
      ? this.referrer.code
      : '';
    const gaCode = this.referrer.hasOwnProperty('ga_track_id')
      ? this.referrer.ga_track_id
      : '';
    const fbCode = this.referrer.hasOwnProperty('fb_pixel_id')
      ? this.referrer.fb_pixel_id
      : '';
    
    const baseUrl = this.country.toLowerCase() !== 'us' ? this.shareCartUrl.replace('{country}', this.country.toLowerCase()) : this.shareCartUrl.replace('/{country}', '');
    const rootUrl = baseUrl.replace("{code}", referrerCode);
    let checkoutUrl = '';

    if(isEuropeanCountry(this.country)) {
      this.hasLockedProduct = false;
      checkoutUrl =
      this.checkoutUrl +
      referrerCode +
      '?products=' +
      this.productSkus +
      '&country=' +
      this.country.toLowerCase() +
      '&redirect_url=' +
      this.redirectUrl +
      '&language=' +
      this.language +
      '&gaCode=' +
      gaCode +
      '&fbCode=' +
      fbCode;
    } else {
      checkoutUrl =
      rootUrl + (!environment.isStaging ? '?products=' : '&products=') +
      this.productSkusWithProdID +
      '&lang=' +
      this.language;
    }

    this.latestCheckoutUrl$.next(checkoutUrl);
    this.dataService.setTinyUrl({ isConversionStarted: true, url: '' });
    this.latestCheckoutUrl$
      .pipe(
        take(1),
        switchMap((latestUrl) => {
          return this.apiService.getTinyUrl(latestUrl);
        })
      )
      .subscribe((tinyUrl) => {
        if (tinyUrl) {
          this.dataService.setTinyUrl({
            isConversionStarted: false,
            url: tinyUrl,
          });
        }
      });
  }
  */

  getOneTimeStorage(country: string, language: string) {
    const LocalOneTime = localStorage.getItem('OneTime');
    let cartOneTime: Cart[] = LocalOneTime ? JSON.parse(LocalOneTime) : [];

    const tempOneTimeCart: Cart[] = [];
    cartOneTime.forEach((oneTime) => {
      if (
        (oneTime.country === country &&
          oneTime.language === language &&
          oneTime.orderType === 'ordertype_1') ||
        (oneTime.country === country &&
          oneTime.language === language &&
          oneTime.orderType === 'ordertype_3')
      ) {
        tempOneTimeCart.push(oneTime);
      }
    });
    return tempOneTimeCart;
  }

  getEveryMonthStorage(country: string, language: string) {
    const LocalEveryMonth = localStorage.getItem('EveryMonth');
    let cartEveryMonth: Cart[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : [];

    const tempEveryMonthCart: Cart[] = [];
    cartEveryMonth.forEach((everyMonth) => {
      if (
        (everyMonth.country === country &&
          everyMonth.language === language &&
          everyMonth.orderType === 'ordertype_2') ||
        (everyMonth.country === country &&
          everyMonth.language === language &&
          everyMonth.orderType === 'ordertype_3')
      ) {
        tempEveryMonthCart.push(everyMonth);
      }
    });
    return tempEveryMonthCart;
  }

  navigateToRoute(routeURL: string, specifiedCountry?: string) {
    let country = this.country;

    const referrerCode = this.referrer.hasOwnProperty('code')
      ? this.referrer.code
      : '';

    if (specifiedCountry) {
      country = specifiedCountry;
    }

    if (country === 'US') {
      if (
        this.language === this.productSettings.defaultLanguage ||
        specifiedCountry
      ) {
        if (referrerCode === '') {
          this.router.navigate([routeURL]);
        } else {
          if (this.isStaging) {
            this.router.navigate([routeURL], {
              queryParams: { ref: referrerCode },
            });
          } else {
            this.router.navigate([routeURL]);
          }
        }
      } else {
        if (referrerCode === '') {
          this.router.navigate([routeURL], {
            queryParams: { lang: this.language },
          });
        } else {
          if (this.isStaging) {
            this.router.navigate([routeURL], {
              queryParams: { lang: this.language, ref: referrerCode },
            });
          } else {
            this.router.navigate([routeURL], {
              queryParams: { lang: this.language },
            });
          }
        }
      }
    } else {
      if (
        this.language === this.productSettings.defaultLanguage ||
        specifiedCountry
      ) {
        if (referrerCode === '') {
          this.router.navigate([country.toLowerCase() + routeURL]);
        } else {
          if (this.isStaging) {
            this.router.navigate([country.toLowerCase() + routeURL], {
              queryParams: { ref: referrerCode },
            });
          } else {
            this.router.navigate([country.toLowerCase() + routeURL]);
          }
        }
      } else {
        if (referrerCode === '') {
          this.router.navigate([country.toLowerCase() + routeURL], {
            queryParams: { lang: this.language },
          });
        } else {
          if (this.isStaging) {
            this.router.navigate([country.toLowerCase() + routeURL], {
              queryParams: { lang: this.language, ref: referrerCode },
            });
          } else {
            this.router.navigate([country.toLowerCase() + routeURL], {
              queryParams: { lang: this.language },
            });
          }
        }
      }
    }
  }

  setRedirectURL(routerUrl: string, selectedCountry: string) {
    let redirectRoute: string = routerUrl.includes('?')
      ? routerUrl.split('?')[0]
      : routerUrl;

    if (selectedCountry !== 'US') {
      redirectRoute = redirectRoute.replace(
        '/' + selectedCountry.toLowerCase(),
        ''
      );
    }

    this.dataService.changeRedirectURL(redirectRoute);
  }

  getUrlParameter(sParam: string) {
    let sPageURL = this.document.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName: string[],
      i: number;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined
          ? true
          : decodeURIComponent(sParameterName[1]);
      }
    }
    return false;
  }

  getCartTotalInCart(
    oneTimeCart: any[],
    everyMonthCart: any[],
    includeRegularDiscount: boolean
  ) {
    let cartTotalPrice = 0;

    if (includeRegularDiscount) {
      oneTimeCart.forEach((element) => {
        let updatedDiscountPrice = 0;

        if (element.cart.smartshipDiscountPrice !== 0) {
          if (everyMonthCart.length > 0) {
            updatedDiscountPrice =
              element.cart.smartshipDiscountPrice >=
                element.cart.discountPrice && element.cart.discountPrice !== 0
                ? element.cart.discountPrice
                : element.cart.smartshipDiscountPrice;
          } else {
            updatedDiscountPrice = element.cart.discountPrice;
          }
        } else {
          updatedDiscountPrice = element.cart.discountPrice;
        }

        if (updatedDiscountPrice === 0) {
          updatedDiscountPrice = element.cart.price.oneTime;
        }

        cartTotalPrice += updatedDiscountPrice * element.cart.quantity;
      });
    } else {
      oneTimeCart.forEach((element) => {
        cartTotalPrice += element.cart.price.oneTime * element.cart.quantity;
      });
    }

    return cartTotalPrice;
  }

  isCartTotalOffer(
    includeRegularDiscount: boolean,
    totalPriceOver: number,
    totalPriceUnder: number,
    currentCarts: any[]
  ) {
    let cartTotalOffer = false;

    let oneTimeCart = [];
    let everyMonthCart = [];

    if (currentCarts.length === 0) {
      oneTimeCart = this.oneTimeCart;
      everyMonthCart = this.everyMonthCart;
    } else {
      oneTimeCart = this.getCartIfAdded(currentCarts).oneTime;
      everyMonthCart = this.getCartIfAdded(currentCarts).everyMonth;
    }

    const newCartTotal = this.getCartTotalInCart(
      oneTimeCart,
      everyMonthCart,
      includeRegularDiscount
    );

    if (newCartTotal >= totalPriceOver && newCartTotal <= totalPriceUnder) {
      cartTotalOffer = true;
    } else {
      cartTotalOffer = false;
    }

    return cartTotalOffer;
  }

  getCartIfAdded(currentCarts: Cart[]) {
    const LocalOneTime = localStorage.getItem('OneTime');
    const LocalEveryMonth = localStorage.getItem('EveryMonth');

    const cartOneTime: Cart[] = LocalOneTime ? JSON.parse(LocalOneTime) : [];
    const cartEveryMonth: Cart[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : [];

    if (
      currentCarts[0].orderType === 'ordertype_1' ||
      currentCarts[0].orderType === 'ordertype_3'
    ) {
      if (cartOneTime.length !== 0) {
        currentCarts.forEach((currentCart) => {
          const cartOneTimeIndex = cartOneTime.findIndex((oneTime) => {
            return (
              (currentCart.cart.caffeineState === '' &&
                currentCart.country === oneTime.country &&
                currentCart.language === oneTime.language &&
                oneTime.cart.productID === currentCart.cart.productID &&
                oneTime.cart.servingsName === currentCart.cart.servingsName) ||
              (currentCart.cart.caffeineState !== '' &&
                currentCart.country === oneTime.country &&
                currentCart.language === oneTime.language &&
                oneTime.cart.productID === currentCart.cart.productID &&
                oneTime.cart.servingsName === currentCart.cart.servingsName &&
                oneTime.cart.caffeineState === currentCart.cart.caffeineState)
            );
          });
          if (cartOneTimeIndex !== -1) {
            cartOneTime[cartOneTimeIndex].cart.quantity =
              currentCart.cart.quantity;
            cartOneTime[cartOneTimeIndex].cart.price = currentCart.cart.price;
          } else {
            cartOneTime.push(currentCart);
          }
        });
      } else {
        currentCarts.forEach((element) => {
          cartOneTime.push(element);
        });
      }
    }

    if (
      currentCarts[0].orderType === 'ordertype_2' ||
      currentCarts[0].orderType === 'ordertype_3'
    ) {
      if (cartEveryMonth.length !== 0) {
        currentCarts.forEach((currentCart) => {
          const cartEveryMonthIndex = cartEveryMonth.findIndex((everyMonth) => {
            return (
              (currentCart.cart.caffeineState === '' &&
                currentCart.country === everyMonth.country &&
                currentCart.language === everyMonth.language &&
                everyMonth.cart.productID === currentCart.cart.productID &&
                everyMonth.cart.servingsName ===
                  currentCart.cart.servingsName) ||
              (currentCart.cart.caffeineState !== '' &&
                currentCart.country === everyMonth.country &&
                currentCart.language === everyMonth.language &&
                everyMonth.cart.productID === currentCart.cart.productID &&
                everyMonth.cart.servingsName ===
                  currentCart.cart.servingsName &&
                everyMonth.cart.caffeineState ===
                  currentCart.cart.caffeineState)
            );
          });
          if (cartEveryMonthIndex !== -1) {
            cartEveryMonth[cartEveryMonthIndex].cart.quantity =
              currentCart.cart.quantity;
            cartEveryMonth[cartEveryMonthIndex].cart.price =
              currentCart.cart.price;
          } else {
            cartEveryMonth.push(currentCart);
          }
        });
      } else {
        currentCarts.forEach((element) => {
          cartEveryMonth.push(element);
        });
      }
    }

    return { oneTime: cartOneTime, everyMonth: cartEveryMonth };
  }

  isIncompatibleCheckout(fromFood: boolean) {
    if (fromFood) {
      return this.oneTimeCart.length > 0 || this.everyMonthCart.length > 0;
    } else {
      return this.foodsCart.length > 0;
    }
  }

  getBestRegularDiscount(
    discountPrice: number,
    smartshipDiscountPrice: number,
    everyMonthCart: any[],
    isSmartshipDiscountOn: boolean
  ) {
    let updatedDiscountPrice = 0;

    const isSmartshipUserCanAccess = this.userService.checkSmartshipUserAccess(
      isSmartshipDiscountOn
    );

    if (smartshipDiscountPrice !== 0) {
      if (
        everyMonthCart.length > 0 ||
        (this.user !== null && this.user?.food_autoship) ||
        (this.user !== null && this.user?.keto_autoship) ||
        isSmartshipUserCanAccess
      ) {
        updatedDiscountPrice =
          smartshipDiscountPrice >= discountPrice && discountPrice !== 0
            ? discountPrice
            : smartshipDiscountPrice;
      } else {
        updatedDiscountPrice = discountPrice;
      }
    } else {
      updatedDiscountPrice = discountPrice;
    }

    return updatedDiscountPrice;
  }

  createDynamicComponent(
    container: ViewContainerRef,
    component: ComponentType<any>,
    ...args: { key: string; value: any }[]
  ) {
    const factory = this.resolver.resolveComponentFactory(component);
    const componentRef = container.createComponent(factory);

    args.forEach((item) => {
      componentRef.instance[item.key] = item.value;
    });
  }

  getPageSlug(productsData: any, url: string, elementID: number) {
    let pageSlug = '';

    if (url === 'product') {
      productsData.list.forEach((product: any) => {
        if (product.ID === elementID) {
          pageSlug = product.post_name;
        }
      });
    } else if (url === 'page') {
      productsData.page.forEach((product: any) => {
        if (product.id === elementID) {
          pageSlug = product.slug;
        }
      });
    } else {
      let searchList = [];

      if (url === 'category') {
        searchList = Object.values(productsData.parent_category);
      }
      if (url === 'tag') {
        searchList = productsData.product_tag;
      }

      if (searchList.length > 0) {
        searchList.forEach((product: any) => {
          if (product.term_id === elementID) {
            pageSlug = product.slug;
          } else {
            if (product.hasOwnProperty('child_categories')) {
              product.child_categories.forEach((child: any) => {
                if (child.term_id === elementID) {
                  pageSlug = child.slug;
                }
              });
            }
          }
        });
      }
    }
    return pageSlug;
  }

  getNativeCountryName(unParsedCountryObj: any, language: string): string {
    let countryName = '';
    const countryObjs = JSON.parse(unParsedCountryObj.country_ml);
    Object.entries(countryObjs).forEach((element: any[]) => {
      if (element[0] === language) {
        countryName = element[1];
      }
    });
    return countryName !== '' ? countryName : unParsedCountryObj.country;
  }

  setCarts(currentCarts: Cart[], country: string, language: string) {
    if (currentCarts.length !== 0) {
      const currentProduct = currentCarts[0];
      const LocalOneTime = localStorage.getItem('OneTime');
      let cartOneTime: Cart[] = LocalOneTime ? JSON.parse(LocalOneTime) : [];
      const LocalEveryMonth = localStorage.getItem('EveryMonth');
      let cartEveryMonth: Cart[] = LocalEveryMonth
        ? JSON.parse(LocalEveryMonth)
        : [];

      if (
        currentCarts[0].orderType === 'ordertype_1' ||
        currentCarts[0].orderType === 'ordertype_3'
      ) {
        if (cartOneTime.length !== 0) {
          currentCarts.forEach((currentCart) => {
            const cartOneTimeIndex = cartOneTime.findIndex((oneTime) => {
              return (
                (currentCart.cart.caffeineState === '' &&
                  currentCart.country === oneTime.country &&
                  currentCart.language === oneTime.language &&
                  oneTime.cart.productID === currentCart.cart.productID &&
                  oneTime.cart.servingsName ===
                    currentCart.cart.servingsName) ||
                (currentCart.cart.caffeineState !== '' &&
                  currentCart.country === oneTime.country &&
                  currentCart.language === oneTime.language &&
                  oneTime.cart.productID === currentCart.cart.productID &&
                  oneTime.cart.servingsName === currentCart.cart.servingsName &&
                  oneTime.cart.caffeineState === currentCart.cart.caffeineState)
              );
            });
            if (cartOneTimeIndex !== -1) {
              cartOneTime[cartOneTimeIndex].cart.quantity =
                currentCart.cart.quantity;
              cartOneTime[cartOneTimeIndex].cart.price = currentCart.cart.price;
              cartOneTime[cartOneTimeIndex].cart.productSku =
                currentCart.cart.productSku;
              cartOneTime[cartOneTimeIndex].isCurrent = false;
            } else {
              cartOneTime.push(currentCart);
            }
          });
        } else {
          currentCarts.forEach((element) => {
            cartOneTime.push(element);
          });
        }
      }

      if (
        currentCarts[0].orderType === 'ordertype_2' ||
        currentCarts[0].orderType === 'ordertype_3'
      ) {
        if (cartEveryMonth.length !== 0) {
          currentCarts.forEach((currentCart) => {
            const cartEveryMonthIndex = cartEveryMonth.findIndex(
              (everyMonth) => {
                return (
                  (currentCart.cart.caffeineState === '' &&
                    currentCart.country === everyMonth.country &&
                    currentCart.language === everyMonth.language &&
                    everyMonth.cart.productID === currentCart.cart.productID &&
                    everyMonth.cart.servingsName ===
                      currentCart.cart.servingsName) ||
                  (currentCart.cart.caffeineState !== '' &&
                    currentCart.country === everyMonth.country &&
                    currentCart.language === everyMonth.language &&
                    everyMonth.cart.productID === currentCart.cart.productID &&
                    everyMonth.cart.servingsName ===
                      currentCart.cart.servingsName &&
                    everyMonth.cart.caffeineState ===
                      currentCart.cart.caffeineState)
                );
              }
            );
            if (cartEveryMonthIndex !== -1) {
              cartEveryMonth[cartEveryMonthIndex].cart.quantity =
                currentCart.cart.quantity;
              cartEveryMonth[cartEveryMonthIndex].cart.price =
                currentCart.cart.price;
              cartEveryMonth[cartEveryMonthIndex].cart.productSku =
                currentCart.cart.productSku;
              cartEveryMonth[cartEveryMonthIndex].isCurrent = false;
            } else {
              cartEveryMonth.push(currentCart);
            }
          });
        } else {
          currentCarts.forEach((element) => {
            cartEveryMonth.push(element);
          });
        }
      }

      const currentOneTimeCart: Cart[] = [];
      cartOneTime.forEach((oneTime) => {
        if (
          (oneTime.country === country.toLowerCase() &&
            oneTime.language === language &&
            oneTime.orderType === 'ordertype_1') ||
          (oneTime.country === country.toLowerCase() &&
            oneTime.language === language &&
            oneTime.orderType === 'ordertype_3')
        ) {
          if (oneTime.cart.productID !== currentProduct.cart.productID) {
            oneTime.isCurrent = false;
          } else {
            oneTime.isCurrent = true;
          }

          currentOneTimeCart.push(oneTime);
        }
      });

      const currentEveryMonthCart: Cart[] = [];
      cartEveryMonth.forEach((everyMonth) => {
        if (
          (everyMonth.country === country.toLowerCase() &&
            everyMonth.language === language &&
            everyMonth.orderType === 'ordertype_2') ||
          (everyMonth.country === country.toLowerCase() &&
            everyMonth.language === language &&
            everyMonth.orderType === 'ordertype_3')
        ) {
          if (everyMonth.cart.productID !== currentProduct.cart.productID) {
            everyMonth.isCurrent = false;
          } else {
            everyMonth.isCurrent = true;
          }

          currentEveryMonthCart.push(everyMonth);
        }
      });

      if (
        currentOneTimeCart.length === 0 &&
        currentEveryMonthCart.length === 0
      ) {
        this.dataService.changeCartStatus(false);
      } else {
        this.dataService.changeCartStatus(true);
      }

      localStorage.setItem('OneTime', JSON.stringify(cartOneTime));
      localStorage.setItem('EveryMonth', JSON.stringify(cartEveryMonth));

      this.store.dispatch(setOneTime({ oneTimeCart: currentOneTimeCart }));
      this.store.dispatch(
        setEveryMonth({ everyMonthCart: currentEveryMonthCart })
      );
      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
    }
  }

  getEditSelectionsStatus() {
    return this.user !== null;
  }
}
