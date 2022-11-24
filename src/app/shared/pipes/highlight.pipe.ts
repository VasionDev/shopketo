import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, term: string): string {
    if (!term) {
      return value;
    }

    const re = new RegExp(term, 'gi');
    const match = value.match(re);

    if (!match) {
      return value;
    } else {
      return value.replace(
        re,
        "<span class='font-bold'>" + match[0] + '</span>'
      );
    }
  }
}
