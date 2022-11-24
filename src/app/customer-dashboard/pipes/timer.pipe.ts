import { Pipe, PipeTransform, NgZone } from '@angular/core';
import { Observable, timer, interval } from 'rxjs';
import { map } from 'rxjs/operators';
@Pipe({
  name: 'timer'
})
export class TimerPipe implements PipeTransform {
  constructor(private zone: NgZone) { }

  /**
 * @param futureDate    should be in a valid Date Time format
 *                      e.g. YYYY-MM-DDTHH:mm:ss.msz
 *                      e.g. 2021-10-06T17:27:10.740z
 */
  public transform(futureDate: string): Observable<string> {
    if (!futureDate || this.getMsDiff(futureDate) < 0) {
      return null!;
    }
    const source = timer(0, 1000);
    return source.pipe(map((_) => this.msToTime(this.getMsDiff(futureDate!))));
  }

  /**
   * Gets the millisecond difference between a future date and now
   * @private
   * @param   futureDate: string
   * @returns number  milliseconds remaining
   */
  private getMsDiff = (futureDate: string): number => (+(new Date(futureDate)) - Date.now());

  /**
   * Converts milliseconds to the
   *
   * @private
   * @param msRemaining
   * @returns null    when no time is remaining
   *          string  in the format `HH:mm:ss`
   */
  private msToTime(msRemaining: number): any {
    let date = new Date()
    if (msRemaining < 0) {
      console.info('No Time Remaining:', msRemaining);
      return null!;
    }

    let seconds: string | number = Math.floor((msRemaining / 1000) % 60),
      minutes: string | number = Math.floor((msRemaining / (1000 * 60)) % 60),
      hours: string | number = Math.floor((msRemaining / (1000 * 60 * 60)) % 24),
      days = Math.floor(msRemaining / (1000 * 60 * 60 * 24))

    /**
     * Add the relevant `0` prefix if any of the numbers are less than 10
     * i.e. 5 -> 05
     */
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    hours = (hours < 10) ? '0' + hours : hours;

    return `${days}d ${hours}:${minutes}:${seconds}`;
  }

}
