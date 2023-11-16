import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, SubscriptionLike, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppDataService } from '../../../shared/services/app-data.service';
import { ProductTagOrCategory } from '../../models/product-tag-or-category.model';
import { Product } from '../../models/product.model';
declare var $: any;
declare var aosJS: any;
declare var researchSliderJS: any;
declare var learnPageSliderJs: any;
declare var gtag: any;

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css'],
})
export class LearnComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  contactForm: FormGroup;
  isCountryAvailable = true;
  tags: ProductTagOrCategory[] = [];
  subscriptions: SubscriptionLike[] = [];
  faqs: any[] = [];
  countries: any = [];
  challengeProduct: any = null;
  referrer: any = {};
  videos: any = [];
  isLoaded: boolean = false;
  isFormSubmitted: boolean = false;
  errorMessage: string = '';
  isContactSuccess: boolean = false;
  userSelectedCountry = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  contactToken: any;
  callForModal = true;
  observer!: IntersectionObserver;
  firstName: string = '';

  @ViewChild('beforeBetter', { static: false })
  private beforeBetterEle!: ElementRef<HTMLDivElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private userService: AppUserService,
    private router: Router,
    private dataService: AppDataService,
    private apiService: AppApiService,
    private translate: TranslateService,
    private http: HttpClient,
    private utilityService: AppUtilityService,
    private formBuilder: FormBuilder,
    private websiteService: WebsiteService,
    private seoService: AppSeoService,
    private meta: Meta
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    this.getVideos();
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
    this.checkUserAccess();
    this.getTags();
    this.setRedirectURL();
    this.getPhoneCountries();
    this.setSeo();
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

  ngAfterViewInit() {
    if (this.referrer.hasOwnProperty('code') && this.referrer.code !== '') {
      const threshold = 0.5; // how much % of the element is in view
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.onClickFreeGuideModal();
              this.observer.disconnect();
            }
          });
        },
        { threshold }
      );
      this.observer.observe(this.beforeBetterEle.nativeElement);
    }
  }

  createContactForm() {
    return this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [
        '',
        [
          Validators.pattern(
            '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
          ),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],
      checkAgree: [true, Validators.requiredTrue],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  getPhoneCountries() {
    this.http.get('assets/countries.json').subscribe((data) => {
      this.countries = data;
    });
  }

  setUserSelectedCountryPhoneCode(country: any) {
    this.userSelectedCountry = country;
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
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

  checkUserAccess() {
    const viCode = this.activatedRoute.snapshot.queryParamMap.get('vicode');
    const viProductId =
      this.activatedRoute.snapshot.queryParamMap.get('viProductId');
    const referrer = this.activatedRoute.snapshot.queryParamMap.get('ref');
    const promptLogin =
      this.activatedRoute.snapshot.queryParamMap.get('promptLogin');
    const isWindowReferrer = document.referrer.includes('experienceketo.com');

    const removedParamsUrl = this.router.url.substring(
      0,
      this.router.url.indexOf('?')
    );
    if (
      viCode !== null &&
      viProductId !== null &&
      viCode !== '' &&
      referrer !== null &&
      promptLogin !== null &&
      isWindowReferrer
    ) {
      this.userService.setVIUser(
        referrer,
        promptLogin,
        viCode,
        false,
        viProductId
      );
      this.dataService.setViTimer('');
    }
    if (viCode !== null) {
      this.location.go(removedParamsUrl);
    }
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

  onClickFreeGuideModal() {
    if (this.referrer.hasOwnProperty('code') && this.referrer.code !== '') {
      $('#getTheFreeModal').modal('show');
    } else {
      const referrerLoginModal = [];
      referrerLoginModal.push({
        modalName: 'referrerCode',
      });

      this.dataService.changeCartOrCheckoutModal('freeGuideModal');
      this.dataService.changePostName({
        postName: 'referrer-modal',
        payload: { key: 'modals', value: referrerLoginModal },
      });
    }
    if(typeof gtag !== 'undefined')
      gtag('event', 'Clicked on Request Guide', {
        'event_category': 'BUTTON_CLICK',
        'event_label': 'Clicked on Request Guide'
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
              console.log(video.videoID);
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

  onSubmitContactForm() {  

    if (this.contactForm.invalid || this.isFormSubmitted) return;
    let { firstName, lastName, email, phone } = this.contactForm.value;
    const phoneWithCountry = phone !== '' ? this.userSelectedCountry.phone_code + phone : '';
    this.isFormSubmitted = true;
    this.errorMessage = '';
    this.isContactSuccess = false;
    
    let contactId = '';

    this.websiteService
      .getContactByUserEmail(this.referrer?.userId, email)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x: any) => {
          let contactReqArr: any = [];
          contactId = x != '' ? x : '';
          if (contactId !== '') {
            contactReqArr.push(
              this.websiteService.updateContactName(contactId, firstName, lastName)
            );
            contactReqArr.push(
              this.websiteService.updateContactSource(contactId, 'Learn Page - Guide')
            );
            if(phoneWithCountry) {
              contactReqArr.push(
                this.websiteService.updateContactPhone(contactId, phoneWithCountry)
              );
            }
          } else {
            contactReqArr.push(
              this.websiteService
                .createContact(
                  this.referrer?.userId,
                  firstName,
                  lastName,
                  email,
                  phoneWithCountry,
                  this.selectedCountry,
                  'Learn Page - Guide'
                )
            );
          }

          forkJoin(contactReqArr)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((x: any) => {
              const isSuccess = x.every(
                (el: { isSuccess: boolean }) => el.isSuccess === true
              );
              if (isSuccess) {
                this.firstName = firstName;
                if (x.length === 1 && contactId === '' && x[0]?.result?.contactId) {
                  contactId = x[0].result.contactId;
                }
                const activity = this.websiteService
                  .createContactActivity(
                    contactId,
                    'Free Transformation Guide',
                    'Learn Page - Guide'
                  )
                  .pipe(catchError((error) => of(error)));
                const sysAlert = this.websiteService
                  .createSystemAlertNew(
                    this.referrer.userId,
                    firstName,
                    lastName,
                    '',
                    `You have a new Lead! <a href='vapt://contact/${contactId}'><strong>${firstName} ${lastName}</strong></a> just received their Free Transformation Guide. Be sure to follow-up soon.`
                  )
                  .pipe(catchError((error) => of(error)));

                forkJoin([activity, sysAlert])
                  .pipe(takeUntil(this.destroyed$))
                  .subscribe((x) => {
                    this.isContactSuccess = true;
                    this.isFormSubmitted = false;
                  });
                if(typeof gtag !== 'undefined')
                  gtag('event', 'Completed Request Guide Form', {
                    'event_category': 'Conversion Events',
                    'event_label': 'Completed Request Guide Form'
                  });
              } else {
                this.errorMessage = 'Something went wrong. Please try again later.';
                this.isFormSubmitted = false;
              }
              if (this.observer) this.observer.disconnect();
              this.contactForm.reset({ checkAgree: true });
            },
            (err) => {
              this.errorMessage = 'Something went wrong. Please try again later.';
              if (this.observer) this.observer.disconnect();
              this.isFormSubmitted = false;
              this.contactForm.reset({ checkAgree: true });
            }
          );
        },
        (err: any) => {
          this.errorMessage = 'Something went wrong. Please try again later.';
          if (this.observer) this.observer.disconnect();
          this.isFormSubmitted = false;
          this.contactForm.reset({ checkAgree: true });
        }
      );
  }

  setSeo() {
    this.seoService.updateTitle('Learn');
    this.meta.updateTag( { property: 'og:title', content: 'Learn' });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
    if (this.observer) this.observer.disconnect();
  }
}
