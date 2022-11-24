import { Component, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { VideoSlider } from 'src/app/products/models/video-slider.model';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import {
  getPruvitTvVideoId,
  getWistiaVideoId,
} from 'src/app/shared/utils/video-info';
declare var productTabsJS: any;
declare var productInfoJS: any;
declare var videoSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
})
export class InfoComponent implements OnDestroy {
  products: any[] = [];
  product: any = {};
  chargedState = '';
  productsData: any = {};
  faqs1: any[] = [];
  faqs2: any[] = [];
  reviews: any[] = [];
  suggestedUse = '';
  servingSize = '';
  slicedIndex = 1;
  slicedReviews: any[] = [];
  isTabShowable = true;
  ingredients: any[] = [];
  supplements: any[] = [];
  disclaimers: any[] = [];
  productFlavorTypes: any[] = [];
  subscriptions: SubscriptionLike[] = [];
  defaultLanguage = '';
  rebootDate = '';
  productContent = '';
  videoSlides: VideoSlider[] = [];

  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private translate: TranslateService
  ) {
    this.getProducts();
  }

  getProducts() {
    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }

        this.defaultLanguage = data.productsData.default_lang;

        this.rebootDate = data.productsData.reboot_start_month;
        this.productsData = data.productsData;
        this.products = data.productsData.list;
      })
    );
  }

  @Input()
  set productSlug(slug: string) {
    this.product = {};

    this.products.forEach((product: any) => {
      if (product.post_name === slug) {
        this.product = product;
        this.chargedState = '';
        this.faqs1 = [];
        this.faqs2 = [];
        this.reviews = [];
        this.suggestedUse = '';
        this.servingSize = '';
        this.slicedIndex = 1;
        this.slicedReviews = [];
        this.ingredients = [];
        this.supplements = [];
        this.disclaimers = [];
        this.isTabShowable = true;
        this.subscriptions = [];
        this.productFlavorTypes = [];

        this.setVideoSlider();
        this.getProductPostContent();
        this.getFlavorIngredients();
        this.getFaqs();
        this.getReviews();
        this.getSuggestedUse();
        this.getIngredients();
        this.getSupplements();
        this.getDisclaimers();
        this.getCurrentTabStatus();

        this.getProductInfoJS();
        this.getProductTabsJS();
        this.tabShowableJS();
      }
    });
  }

  setVideoSlider() {
    this.videoSlides = Array.isArray(this.product?.product_video_gallery)
      ? this.product?.product_video_gallery.map((url: string) => {
          const videoItem: VideoSlider = {} as VideoSlider;

          if (url.includes('pruvit.tv')) {
            const pruvitTvVideoId = getPruvitTvVideoId(url);

            videoItem.src = `https://pruvit.tv/stream?embed=${pruvitTvVideoId}`;

            videoItem.thumbnail$ =
              this.apiService.getPruvitTvThumbnailImage(pruvitTvVideoId);

            videoItem.type = 'PRUVIT_TV';
          } else {
            const wistiaVideoId = getWistiaVideoId(url);

            videoItem.src = wistiaVideoId;

            videoItem.thumbnail$ =
              this.apiService.getWistiaThumbnailImage(wistiaVideoId);

            videoItem.type = 'WISTIA';
          }

          return videoItem;
        })
      : [];

    const videoSlick = $('.sk-video-slider.slick-initialized.slick-slider');
    if (videoSlick.length > 0) {
      $('.sk-video-slider').slick('unslick');
    }

    const videoPreviewSlick = $(
      '.sk-video-slider-nav.slick-initialized.slick-slider'
    );
    if (videoPreviewSlick.length > 0) {
      $('.sk-video-slider-nav').slick('unslick');
    }

    $(document).ready(() => {
      setTimeout(() => {
        videoSliderJS();

        $('.sk-video-slider').slick('setPosition');
      }, 0);
    });
  }

  getCurrentTabStatus() {
    let tabItems = 0;

    if (this.product?.post_content !== '') {
      ++tabItems;
    }

    if (this.chargedState !== '') {
      ++tabItems;
    }

    if (this.suggestedUse !== '') {
      ++tabItems;
    }

    if (this.faqs1.length !== 0 || this.faqs2.length !== 0) {
      ++tabItems;
    }

    if (this.reviews.length !== 0) {
      ++tabItems;
    }

    this.isTabShowable = tabItems > 1;
  }

  tabShowableJS() {
    $(document).ready(() => {
      $('ul#sk-product__info-list > li button').removeClass('active');
      $('#sk-product__info-details .sk-product__item-info').addClass(
        'display-none'
      );
      $('#sk-product__info-details .sk-product__item-info').removeAttr('style');

      if ($('ul#sk-product__info-list > li').length > 1) {
        $('ul#sk-product__info-list > li button:first').addClass('active');
        const pageAttr = $('ul#sk-product__info-list > li button.active').data(
          'page'
        );

        $(
          '#sk-product__info-details .sk-product__item-info[data-page="' +
            pageAttr +
            '"]'
        ).removeClass('display-none');
      } else {
        $('#sk-product__info-details .sk-product__item-info:first').removeClass(
          'display-none'
        );
      }
    });
  }

  getProductInfoJS() {
    $(document).ready(() => {
      productInfoJS();
    });
  }

  getProductTabsJS() {
    $(document).ready(() => {
      productTabsJS();
    });
  }

  getProductPostContent() {
    let finalPostContent = '';

    if (this.product.hasOwnProperty('post_content')) {
      if (
        this.product.post_content.includes(
          '<span id="update-keto-month" class="brand-purple next-reboot-md">'
        )
      ) {
        finalPostContent = this.product.post_content.replace(
          '<span id="update-keto-month" class="brand-purple next-reboot-md">',
          '<span id="update-keto-month" class="brand-purple next-reboot-md">' +
            this.rebootDate
        );
      } else {
        finalPostContent = this.product.post_content;
      }
    }

    this.productContent = finalPostContent;
  }

  getFlavorIngredients() {
    if (this.product.product_flavorTypes) {
      this.productFlavorTypes = this.product.product_flavorTypes;
      this.chargedState = this.product.product_flavorTypes[0].types;
    }
  }

  getIngredients() {
    const tempIngredients: any[] = [];
    if (this.product.product_ingredients) {
      Object.values(this.product.product_ingredients).forEach((val: any) => {
        if (val.flavor_type === this.chargedState) {
          tempIngredients.push(val);
        }
      });
    }
    this.ingredients = tempIngredients;
  }

  getSupplements() {
    const tempSupplements: any[] = [];

    if (this.product.product_supplements) {
      this.product.product_supplements.forEach((val: any) => {
        if (val.flavor_type === this.chargedState) {
          tempSupplements.push(val);
        }
      });
    }

    this.supplements = tempSupplements;
  }

  getDisclaimers() {
    const tempDisclaimers: any[] = [];

    if (this.product.product_disclaimers) {
      this.product.product_disclaimers.forEach((val: any) => {
        if (val.flavor_type === this.chargedState) {
          tempDisclaimers.push(val);
        }
      });
    }

    this.disclaimers = tempDisclaimers;
  }

  onSelectChargedState(event: any) {
    this.chargedState = event.target.value;

    this.getIngredients();
    this.getSupplements();
    this.getDisclaimers();
  }

  getDisclaimerIngredients(ingredients: string) {
    const disclaimerText = this.translate.instant('other-ingredients');

    return disclaimerText + ' ' + ingredients;
  }

  getDisclaimerManufactures(manufactures: string) {
    const manufacturedText = this.translate.instant('manufactured-for');

    return manufacturedText + ' ' + manufactures;
  }

  getDisclaimerStorage(storage: string) {
    const storageText = this.translate.instant('storage');

    return '<b>' + storageText + '</b> ' + storage;
  }

  getDisclaimerInfo(disclaimer: string) {
    return disclaimer;
  }

  getFaqs() {
    const faqsData = this.productsData.faq;

    if (faqsData) {
      Object.entries(faqsData).forEach(([key, value]: [string, any]) => {
        if (key === this.product.faq_unique_key) {
          let tempFaqs = [];
          tempFaqs = value;
          const halfLength = Math.ceil(tempFaqs.length / 2);
          this.faqs1 = tempFaqs.slice(0, halfLength);
          this.faqs2 = tempFaqs.slice(-halfLength);
        }
      });
    }
  }

  getReviews() {
    const reviewsData = this.productsData.review;

    if (reviewsData) {
      if (this.product.categories.length > 0) {
        Object.entries(reviewsData).forEach(([key, value]: [string, any]) => {
          this.product.categories.forEach((category: any) => {
            if (+key === category.term_id) {
              this.reviews = value;
              this.slicedReviews = value.slice(0, this.slicedIndex * 2);
            }
          });
        });
      }
    }
  }

  onClickReadMore() {
    this.slicedIndex += 1;
    this.slicedReviews = this.reviews.slice(0, this.slicedIndex * 2);
  }

  getRatingArray(rating: any) {
    if (rating) {
      if (typeof rating === 'string') {
        rating = Math.round(+rating);
      } else {
        rating = Math.round(rating);
      }
      return new Array(rating);
    } else {
      return [];
    }
  }

  getNonRatingArray(rating: any) {
    if (rating) {
      if (typeof rating === 'string') {
        rating = Math.round(+rating);
      } else {
        rating = Math.round(rating);
      }
      return new Array(5 - rating);
    } else {
      return [];
    }
  }

  getAverageRating() {
    let ratingSum = 0;
    this.reviews.forEach((review: any) => {
      ratingSum += review.rating;
    });
    const averageRating = ratingSum / this.reviews.length;
    return averageRating.toFixed(1);
  }

  getRelativeTime(time: string) {
    const current = new Date().getTime();
    const previous = +time * 1000;

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
      const secondsText = this.translate.instant('seconds-ago');

      return Math.round(elapsed / 1000) + ' ' + secondsText;
    } else if (elapsed < msPerHour) {
      const minutesText = this.translate.instant('minutes-ago');

      return Math.round(elapsed / msPerMinute) + ' ' + minutesText;
    } else if (elapsed < msPerDay) {
      const hoursText = this.translate.instant('hours-ago');

      return Math.round(elapsed / msPerHour) + ' ' + hoursText;
    } else if (elapsed < msPerMonth) {
      const daysText = this.translate.instant('days-ago');

      return Math.round(elapsed / msPerDay) + ' ' + daysText;
    } else if (elapsed < msPerYear) {
      const monthsText = this.translate.instant('months-ago');

      return Math.round(elapsed / msPerMonth) + ' ' + monthsText;
    } else {
      const yearsText = this.translate.instant('years-ago');

      return Math.round(elapsed / msPerYear) + ' ' + yearsText;
    }
  }

  getReviewersFirstLetters(name: string) {
    let firstLetters = '';
    firstLetters +=
      name.split(' ')[0].substr(0, 1) + name.split(' ')[1].substr(0, 1);
    return firstLetters;
  }

  getSuggestedUse() {
    if (this.product.product_ingredients) {
      this.suggestedUse =
        this.product.product_ingredients.ingredient_directions;
      this.servingSize = this.product.product_ingredients.serving_size;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
