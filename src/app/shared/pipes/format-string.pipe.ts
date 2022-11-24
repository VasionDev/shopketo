import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'format',
})
export class FormatPipe implements PipeTransform {
  transform(value: string, isInstruction: boolean): string {
    const splitedStr = value.split('_');

    return isInstruction
      ? value.replace(/\n/g, '<br/><br/>')
      : splitedStr
          .map(
            (str) =>
              str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
          )
          .join(' ');
  }
}
