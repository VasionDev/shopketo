import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from '../../../shared/services/app-data.service';
import { ProductTagOrCategory } from '../../models/product-tag-or-category.model';
import { Product } from '../../models/product.model';
declare var $: any;
declare var aosJS: any;
declare var researchSliderJS: any;
declare var learnPageSliderJs: any;

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css'],
})
export class LearnComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  isCountryAvailable = true;
  tags: ProductTagOrCategory[] = [];
  subscriptions: SubscriptionLike[] = [];
  faqs: any[] = [];
  challengeProduct: any = null;
  referrer: any = {};
  videos: any = [];
  isLoaded = false;

  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private translate: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getVideos();
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.getTags();

    $(document).ready(() => {
      if (this.videos.length > 3) {
        researchSliderJS();
      }

      $(document).ready(() => {
        aosJS();
      });

      learnPageSliderJs();
      $('body').on('hidden.bs.modal', '#pruvitTVModal', function () {
        $('#pruvitTVModal').remove();
      });
    });
  }

  getVideos() {
    this.subscriptions.push(
      this.http.get('assets/videos.json').subscribe((data) => {
        this.videos = data;
        //this.isLoaded = true;
        //this.setVideoThumbs();
      })
    );
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.selectedLanguage = language;
          this.translate.use(this.selectedLanguage);
          this.getProducts();
        }
      )
    );
  }

  getReferrer() {
    this.subscriptions.push(
      this.dataService.currentReferrerData$.subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      })
    );
  }

  onClickReferrerName() {
    this.dataService.changePostName({
      postName: 'referrer-modal',
      payload: { key: 'modals', value: [{ modalName: 'independentPruver' }] },
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  getTags() {
    this.subscriptions.push(
      this.dataService.currentTags$.subscribe((tags) => {
        const tempTags = tags
          .filter((tag) => {
            const regex = /staff-picks|bundle-save|bundle-and-save/i;
            return tag.products.length !== 0 && tag.slug.match(regex);
          })
          .sort((a, b) => a.order - b.order);

        this.tags = tempTags.map((tag) => {
          const soldOutItems: Product[] = [];
          const inSaleItems: Product[] = [];
          tag.products.forEach((product, ind) => {
            if (product.isSoldOut || product.isAllVariationOutOfStock) {
              soldOutItems.push(product);
            } else {
              inSaleItems.push(product);
            }
          });

          tag.products = [...inSaleItems, ...soldOutItems].sort(
            (a, b) => b.productOrder - a.productOrder
          );

          return tag;
        });
      })
    );
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

        data.productsData.list.every((product: any) => {
          const faqCat = product.categories.find((item: any) => {
            const regex = /keto-os-nat|ketoos-nat/i;
            return item.slug.match(regex);
          });

          if (
            faqCat &&
            data.productsData.faq.hasOwnProperty(product.faq_unique_key)
          ) {
            this.faqs = data.productsData.faq[product.faq_unique_key];
            return false;
          }
          return true;
        });

        this.challengeProduct = data.productsData.list.find((item: any) => {
          const regex = /challenge-pack/i;
          return item.categories.some((el: any) => {
            return el.slug.match(regex);
          });
        });
      })
    );
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);

    this.dataService.changePostName({
      postName: 'product-modal',
      payload: { key: 'postName', value: postName },
    });
  }

  onClickYoutube(videoID: string) {
    const videoLink = 'https://www.youtube.com/embed/' + videoID;
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
  }

  onClickPruvitTv(videoID: string) {
    const videoLink = `https://pruvit.tv/stream?embed=${videoID}`;
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
  }

  setVideoThumbs() {
    if (this.videos.length) {
      this.videos.forEach((video: any) => {
        if (video.source === 'wistia') {
          this.apiService
            .getWistiaThumbnailImage(video.videoID)
            .subscribe((res) => {
              console.log(res);
              video.thumbnailUrl = res;
            });
        } else if (video.source === 'youtube') {
          const youtubeId = this.getYoutubeID(video.url);
          video.thumbnailUrl = `http://img.youtube.com/vi/${youtubeId}/0.jpg`;
          video.videoID = youtubeId;
        } else {
          this.apiService
            .getPruvitTvThumbnailImage(video.videoID)
            .subscribe((res) => {
              console.log(res);
              video.thumbnailUrl = res;
            });
        }
      });
    }
  }

  getWistiaID(url: string) {
    let videoID = '';
    if (url.includes('wistia.com')) {
      videoID = url.substring(url.lastIndexOf('/') + 1);
    }
    return videoID;
  }

  getYoutubeID(url: string) {
    let videoID = '';
    const videoRegEx = url.match(
      /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/
    );
    if (videoRegEx != null) {
      videoID = videoRegEx[1];
    }
    return videoID;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
