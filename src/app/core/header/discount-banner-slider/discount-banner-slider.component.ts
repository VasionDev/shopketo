import { Component, OnInit } from '@angular/core';
import { DiscountBanner } from 'src/app/shared/models/discount-banner.model';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';

declare var headerSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-discount-banner-slider',
  templateUrl: './discount-banner-slider.component.html',
  styleUrls: ['./discount-banner-slider.component.css'],
})
export class DiscountBannerSliderComponent implements OnInit {
  tenant = '';
  selectedCountry = '';
  banners: DiscountBanner[] = [];

  constructor(
    private utilityService: AppUtilityService,
    private userService: AppUserService,
    private dataService: AppDataService
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$.subscribe(() => {
      this.getProducts();
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  getProducts() {
    this.dataService.currentProductsData$.subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }

      this.banners = data.discountBanners.filter((banner) => {
        const isUserCanAccess = this.userService.checkUserAccess(
          banner.accessLevels,
          banner.customUsers
        );

        return isUserCanAccess;
      });

      const bannerSlick = $('.offer-slider.slick-initialized.slick-slider');

      if (bannerSlick.length > 0) {
        $('.offer-slider').slick('unslick');
      }

      setTimeout(() => {
        headerSliderJS();
      });
    });
  }

  getBannerTitle(bannerText: string) {
    if (bannerText) {
      return bannerText.replace(/href/gi, 'data-link');
    } else {
      return '';
    }
  }

  onClickBanner(event: any) {
    if (event.srcElement) {
      const link: string =
        event.srcElement.parentElement.dataset.link ||
        event.srcElement.dataset.link;
      if (link) {
        if (link.startsWith('https://')) {
          window.open(link);
        } else {
          const linkSplit = link.split('/');
          let routeURL = '';

          if (this.selectedCountry === 'US') {
            routeURL = linkSplit[1] + '/' + linkSplit[2];
          } else {
            routeURL = '/' + linkSplit[2] + '/' + linkSplit[3];
          }

          this.utilityService.navigateToRoute(routeURL);
        }
      }
    }
  }

}
