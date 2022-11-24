import { Pipe, PipeTransform } from '@angular/core';
import { ProductSettings } from 'src/app/products/models/product-settings.model';

@Pipe({
  name: 'customCurrency',
})
export class CurrencyPipe implements PipeTransform {
  transform(price: number, productSettings: ProductSettings) {
    return this.getNumFormat(this.getExchangedPrice(price, productSettings));
  }

  private getNumFormat(num: number) {
    if (
      isNaN(num) ||
      Number.POSITIVE_INFINITY === num ||
      Number.NEGATIVE_INFINITY === num
    ) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      const twoDecimalPlaces = num.toFixed(2);

      const hasTwoZeros = twoDecimalPlaces.endsWith('.00');

      return hasTwoZeros ? +twoDecimalPlaces : twoDecimalPlaces;
    }
  }

  private getExchangedPrice(price: number, productSettings: ProductSettings) {
    let finalPrice = 0;

    if (productSettings) {
      const exchangedPrice =
        productSettings.exchangeRate !== 0
          ? productSettings.exchangeRate * price
          : price;

      finalPrice =
        productSettings.taxRate !== 0
          ? exchangedPrice + (exchangedPrice * productSettings.taxRate) / 100
          : exchangedPrice;
    }

    return finalPrice;
  }
}
