import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'smartshipDiscountText',
})
export class SmartshipDiscountTextPipe implements PipeTransform {
  transform(translatedText: string, value1: number, value2?: string): string {
    let finalTranslation = '';

    if (value1) {
      finalTranslation = translatedText.replace('[X]', value1.toString());
    }

    if (value2) {
      finalTranslation = finalTranslation.replace(
        '[Y]',
        "<span class='font-bold'>" + value2.toString() + '</span>'
      );
    }

    return finalTranslation;
  }
}
