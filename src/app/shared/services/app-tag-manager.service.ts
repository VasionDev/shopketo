import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CurrencyPipe } from '../pipes/currency.pipe';
import { Product } from 'src/app/products/models/product.model';
import { Cart } from '../models/cart.model';
import { ProductSettings } from 'src/app/products/models/product-settings.model';
// declare let dataLayer: any[];
declare let gtag: any;
declare let fbq: any;

@Injectable({
  providedIn: 'root'
})
export class AppTagManagerService {

  canSendEvent: boolean = false;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private currencyPipe: CurrencyPipe
  ) { 
    this.checkConcentForEvent();
  }

  checkConcentForEvent() {
    const isCookiePresent = this.cookieService.check('CookieConsent');
    if (isCookiePresent) {
      const cookieConsent = this.cookieService.get('CookieConsent');
      const parsedCookieConsent = JSON.parse(cookieConsent);
      this.canSendEvent = parsedCookieConsent.analytics;
    }else {
      this.canSendEvent = false;
    }
  }

  selectItemEvent(product: Product, country: string, pageName?: string) {
    if(this.canSendEvent) {
      // dataLayer.push({ ecommerce: null });
      const eventData = this.getEventRequiredInfo(product, pageName);
      const eventObj = {
        item_list_id: eventData.itemListId,
        item_list_name: eventData.itemListName,
        items: [
          {
            item_id: "",
            item_name: eventData.itemName,
            item_brand: "Pruvit",
            item_category: "Supplements",
            item_category2: eventData.itemCategory2,
            item_category3: eventData.itemCategory3,
            item_list_id: eventData.itemListId,
            item_list_name: eventData.itemListName,
            location_id: country,
          }
        ]
      };
      /*dataLayer.push({
        event: "view_item_list",
        ecommerce : eventObj
      });*/
      if(typeof gtag !== 'undefined') gtag("event", "select_item", eventObj);
    }
  }

  viewItemEvent(product: Product, country: string, pageName?: string) {
    if(this.canSendEvent) {
      // dataLayer.push({ ecommerce: null });
      const eventData = this.getEventRequiredInfo(product, pageName);
      const eventObj = {
        items: [
          {
            item_id: "",
            item_name: eventData.itemName,
            item_brand: "Pruvit",
            item_category: "Supplements",
            item_category2: eventData.itemCategory2,
            item_category3: eventData.itemCategory3,
            item_list_id: eventData.itemListId,
            item_list_name: eventData.itemListName,
            location_id: country,
          }
        ]
      };
      /*dataLayer.push({
        event: "view_item",
        ecommerce : eventObj
      });*/
      if(typeof gtag !== 'undefined') gtag("event", "view_item", eventObj);
      if(typeof fbq !== 'undefined') this.fbEventViewContent(eventObj);

    }
  }

  addToCartItemEvent(product: Product, cartData: Cart, country: string, pageName?: string) {
    if(this.canSendEvent) {
      // dataLayer.push({ ecommerce: null });
      const eventData = this.getEventRequiredInfo(product, pageName);
      const items = [];
      const orderType = cartData.orderType;
      const cart = cartData.cart;
      if(orderType === 'ordertype_3') {
        items.push(
          {
            item_id: cart.productSku.oneTime,
            item_name: eventData.itemName,
            item_brand: "Pruvit",
            item_category: "Supplements",
            item_category2: eventData.itemCategory2,
            item_category3: eventData.itemCategory3,
            item_list_id: eventData.itemListId,
            item_list_name: eventData.itemListName,
            quantity: cart.quantity,
            location_id: country,
          },
          {
            item_id: cart.productSku.everyMonth,
            item_name: eventData.itemName + '-SmartShip',
            item_brand: "Pruvit",
            item_category: "Supplements",
            item_category2: eventData.itemCategory2,
            item_category3: eventData.itemCategory3,
            item_list_id: eventData.itemListId,
            item_list_name: eventData.itemListName,
            quantity: cart.quantity,
            location_id: country,
          }
        );
      }else {
        items.push(
          {
            item_id: orderType === 'ordertype_1' ? cart.productSku.oneTime : cart.productSku.everyMonth,
            item_name: orderType === 'ordertype_1' ? eventData.itemName : eventData.itemName + '-SmartShip',
            item_brand: "Pruvit",
            item_category: "Supplements",
            item_category2: eventData.itemCategory2,
            item_category3: eventData.itemCategory3,
            item_list_id: eventData.itemListId,
            item_list_name: eventData.itemListName,
            quantity: cart.quantity,
            location_id: country,
          }
        );
      }

      /*dataLayer.push({
        event: "add_to_cart",
        ecommerce : {items: items}
      });*/
      if(typeof gtag !== 'undefined') gtag("event", "add_to_cart", {items: items})
      if(typeof fbq !== 'undefined') this.fbEventAddToCart(items);

    }
  }

  onCheckoutEvent(products: Product[], oneTimeCart: Cart[], everyMonthCart: Cart[], cartTotalDiscountSumPrice: number, productSettings: ProductSettings) {
    if(this.canSendEvent) {
      // dataLayer.push({ ecommerce: null });
      const oneTimeitems = oneTimeCart.map(el=> {
        const prodEventInfo = this.getProductEventInfoFromList(el.cart.productID, products);
        return {
          item_id: el.cart.productSku.oneTime,
          item_name: el.cart.productName,
          item_brand: "Pruvit",
          item_category: "Supplements",
          discount: this.currencyPipe.transform(el.cart.price.oneTime - el.finalPrice, productSettings),
          item_category2: prodEventInfo ? prodEventInfo.itemCategory2 : '',
          item_category3: prodEventInfo ? prodEventInfo.itemCategory3 : '',
          item_list_id: "checkout-cart",
          item_list_name: "Checkout Cart",
          quantity: el.cart.quantity,
          price: this.currencyPipe.transform(el.cart.price.oneTime, productSettings),
          location_id: el.country,
        }
      });
      const everyMonthItems = everyMonthCart.map(el=> {
        const prodEventInfo = this.getProductEventInfoFromList(el.cart.productID, products);
        return {
          item_id: el.cart.productSku.everyMonth,
          item_name: el.cart.productName + '-SmartShip',
          item_brand: "Pruvit",
          item_category: "Supplements",
          discount: this.currencyPipe.transform(el.cart.price.oneTime - el.finalPrice, productSettings),
          item_category2: prodEventInfo ? prodEventInfo.itemCategory2 : '',
          item_category3: prodEventInfo ? prodEventInfo.itemCategory3 : '',
          item_list_id: "checkout-cart",
          item_list_name: "Checkout Cart",
          quantity: el.cart.quantity,
          price: this.currencyPipe.transform(el.cart.price.oneTime, productSettings),
          location_id: el.country,
        }
      });
      /*dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: productSettings.currencySymbol,
          value: this.currencyPipe.transform(cartTotalDiscountSumPrice, productSettings),
          items: [...oneTimeitems, ...everyMonthItems]
        }
      });*/
      if(typeof gtag !== 'undefined') {
        gtag("event", "begin_checkout", {
          currency: productSettings.currencySymbol,
          value: this.currencyPipe.transform(cartTotalDiscountSumPrice, productSettings),
          items: [...oneTimeitems, ...everyMonthItems]
        });
      }

      if(typeof fbq !== 'undefined') {
        this.fbEventInitiateCheckout(
          productSettings.currencySymbol,
          cartTotalDiscountSumPrice,
          [...oneTimeitems, ...everyMonthItems]
        );
      }

    }
  }

  fbEventViewContent(eventObj: any){
    fbq('track', 'ViewContent', eventObj);
  }

  fbEventInitiateCheckout(currency: any, value: number, items: any){
    fbq('track', 'AddToCart', {currency: currency, value: value, items: items});
  }

  fbEventAddToCart(items: any){
    fbq('track', 'AddToCart', items);
  }

  private getEventRequiredInfo(product: Product, pageName?: string) {
    const currentURL = this.router.url;
    let itemListId = '';
    let itemListName = '';

    const category2 = product.categories[0] ? product.categories[0].name : '';
    const category3 = product.categories[1] ? product.categories[1].name : '';
    const productName = product.englishTitle;

    if(pageName && pageName !== '') {
      itemListName = pageName;
      itemListId = pageName.toLowerCase().split(' ').join('-');
    }else {
      if(currentURL !== '') {
        const splitedURL = currentURL.split('/').filter(val => val !== '');
        itemListId = splitedURL.join('-');
        itemListName = splitedURL.map(val => val.charAt(0).toUpperCase() + val.slice(1)).join(' ');
      }else {
        itemListId = product.tags[0] ? product.tags[0].slug : '';
        itemListName = product.tags[0] ? product.tags[0].name : '';
      }
    }

    return {
      itemName: productName, 
      itemCategory2: category2, 
      itemCategory3: category3, 
      itemListId: itemListId,
      itemListName: itemListName
    }
  }

  private getProductEventInfoFromList(productId: number, products: Product[]) {
    const product = products.find(prod=> prod.id === productId);
    if(product) {
      return this.getEventRequiredInfo(product);
    }
    return null;
  }
}
