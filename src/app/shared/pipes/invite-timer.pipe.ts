import { NgZone, Pipe, PipeTransform } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
@Pipe({
  name: 'inviteTimer',
})
export class InviteTimerPipe implements PipeTransform {
  constructor(private zone: NgZone) {}

  /**
   * @param futureDate    should be in a valid Date Time format
   *                      e.g. YYYY-MM-DDTHH:mm:ss.msz
   *                      e.g. 2021-10-06T17:27:10.740z
   */
  public transform(futureDate: string, name?: string): Observable<string> {
    if (!futureDate || this.getMsDiff(futureDate) < 0) {
      return null!;
    }
    const source = timer(0, 1000);
    return source.pipe(map((_) => this.msToTime(this.getMsDiff(futureDate!), name)));
  }

  /**
   * Gets the millisecond difference between a future date and now
   * @private
   * @param   futureDate: string
   * @returns number  milliseconds remaining
   */
  private getMsDiff = (futureDate: string): number =>
    +new Date(futureDate) - Date.now();

  /**
   * Converts milliseconds to the
   *
   * @private
   * @param msRemaining
   * @returns null    when no time is remaining
   *          string  in the format `HH:mm:ss`
   */
  private msToTime(msRemaining: number, name?:string): any {
    if (msRemaining < 0) {
      console.info('No Time Remaining:', msRemaining);
      return null!;
    }

    let seconds: string | number = Math.floor((msRemaining / 1000) % 60),
      minutes: string | number = Math.floor((msRemaining / (1000 * 60)) % 60),
      hours: string | number = Math.floor(
        (msRemaining / (1000 * 60 * 60)) % 24
      ),
      days: string | number = Math.floor(msRemaining / (1000 * 60 * 60 * 24));

    /**
     * Add the relevant `0` prefix if any of the numbers are less than 10
     * i.e. 5 -> 05
     */
    days = days < 10 ? '0' + days : days;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    if(name === 'cancel-timer') {
      return `${minutes}:${seconds}`;
    }
    if(name === 'cancel-timer-ja') {
      return `${minutes}分${seconds}秒`;
    }
    if(name === '5servings') {
      return `
      <div class="time-col">
        ${minutes}
        <span class="">Minutes</span>
      </div>
      <div class="time-col">:</div>
      <div class="time-col">
        ${seconds}
        <span class="">Seconds</span>
      </div>`;
    } else {
      return `
      <div class="time-col">
        ${days} <span class="">Days</span>
      </div>
      <div class="time-col">
        ${hours} <span class="">Hours</span>
      </div>
      <div class="time-col">:</div>
      <div class="time-col">
        ${minutes}
        <span class="">Minutes</span>
      </div>
      <div class="time-col">
        ${seconds}
        <span class="">Seconds</span>
      </div>`;
    }
  }
}
