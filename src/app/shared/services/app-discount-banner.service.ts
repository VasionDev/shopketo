import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { DiscountBanner } from '../models/discount-banner.model';

@Injectable({
  providedIn: 'root',
})
export class AppDiscountBannerService {
  constructor(private productUtilityService: ProductsUtilityService) {}

  getDiscountBanner(bannerMap: any[]): DiscountBanner[] {
    const banners: DiscountBanner[] = bannerMap.map((bannerObj: any) => {
      return {
        bannerText: bannerObj.hasOwnProperty('banner_text')
          ? bannerObj.banner_text
          : '',
        backgroundColor: bannerObj.hasOwnProperty('bg_color')
          ? bannerObj.bg_color
          : '',
        textColor: bannerObj.hasOwnProperty('text_color')
          ? bannerObj.text_color
          : '',
        countDown$: this.getCountdownText(bannerObj),
        accessLevels: this.productUtilityService.getAccessLevels(
          bannerObj.hasOwnProperty('availability_for')
            ? bannerObj.availability_for
            : ''
        ),
        customUsers: bannerObj.hasOwnProperty('custom_users_list')
          ? bannerObj.custom_users_list?.map((user: string) => +user[0])
          : [],
      };
    });

    return banners;
  }

  private getCountdownText(bannerInfo: any): Observable<string> {
    const countdownTimer = timer(0, 1000).pipe(
      switchMap(() => {
        let countdownText = '';
        let tempCountdown = '';

        const countdownEndDate = Date.parse(
          new Date(+bannerInfo.end_date * 1000).toLocaleString('en-US', {
            timeZone: 'America/Chicago',
          })
        );

        const today = Date.parse(
          new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
        );

        const distance = countdownEndDate - today;

        if (distance < 0) {
          countdownText = '';
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          tempCountdown =
            bannerInfo.countdown_text +
            ' ' +
            days +
            'd ' +
            hours +
            'h ' +
            minutes +
            'm ' +
            seconds +
            's';

          countdownText =
            bannerInfo.enable_countdown !== ''
              ? '<span style="color:' +
                bannerInfo.countdown_text_color +
                '">' +
                tempCountdown +
                '</span>'
              : '';
        }
        return of(countdownText);
      })
    );

    return countdownTimer;
  }
}
