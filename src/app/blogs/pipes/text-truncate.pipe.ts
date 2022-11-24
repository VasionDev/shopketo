import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textTruncate',
})
export class TextTruncatePipe implements PipeTransform {
  transform(text: string, textLimit: number): string {
    if (text.length <= textLimit) {
      return text;
    } else {
      return text
        .substring(0, textLimit)
        .replace(/<[^>]*>/g, '')
        .concat('...');
    }
  }
}
