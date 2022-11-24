import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTimer',
})
export class FormatTimerPipe implements PipeTransform {
  transform(totalSeconds: number): string {
    // const hours = Math.floor(totalSeconds / (60 * 60));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return (
      ('00' + hours).slice(-2) +
      ':' +
      ('00' + minutes).slice(-2) +
      ':' +
      ('00' + seconds).slice(-2)
    );
  }
}
