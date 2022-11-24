import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of, ReplaySubject } from 'rxjs';
import {
  catchError,
  exhaustMap,
  switchMap,
  takeUntil,
  tap,
  timeout,
} from 'rxjs/operators';
import { WebsiteService } from 'src/app/customer-dashboard/websites/service/websites-service';
import { AppApiService } from '../../../shared/services/app-api.service';
import { AppDataService } from '../../../shared/services/app-data.service';
import { Product } from '../../models/product.model';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-referrer-home',
  templateUrl: './referrer-home.component.html',
  styleUrls: ['./referrer-home.component.css'],
})
export class ReferrerHomeComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  contactForm: FormGroup;
  referrer: any = {};
  referrerVideoId: string = '';
  customizeData: any = null;
  countries: any = [];
  products: any = [];
  favProducts: any = [];
  isLoaded: boolean = false;
  isFormSubmitted = false;
  isApproveSubmitted = false;
  isApproved: boolean = false;
  apporveTokenFromUrl: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  userSelectedCountry = {
    country_code: 'US',
    phone_code: '+1',
    name: 'United States',
  };
  contactToken: any;
  previewData: any = {};
  isApprovalPage: boolean = false;

  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private translate: TranslateService,
    private websiteService: WebsiteService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private location: Location
  ) {
    this.contactForm = this.createContactForm();
    const data = localStorage.getItem('customizePreviewData');
    if (data) {
      this.customizeData = JSON.parse(data);
    }

    this.route.queryParamMap
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params) => {
        const approveTokenFromURL = params.get('approve_token');
        if (approveTokenFromURL !== null) {
          this.isApprovalPage = true;
          this.apporveTokenFromUrl = approveTokenFromURL;
        }
      });
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCountries();
    this.getReferrer();
    if (this.customizeData === null) {
      this.getUserCustomizeData();
    } else this.setCustomizePreviewData();
  }

  setCustomizePreviewData() {
    if (this.customizeData.favoriteProducts.length) {
      this.favProducts = this.products.filter((product: any) => {
        return this.customizeData.favoriteProducts.includes(product.id);
      });
    }

    $(document).ready(() => {
      var styleSheet = document.styleSheets[0];
      if (this.customizeData.theme.color !== '') {
        styleSheet.insertRule(
          `.ref-card::before, .buy-now, .button-icon, .get-in-touch { background-color: ${this.customizeData.theme.color} !important; }`,
          styleSheet.cssRules.length
        );
        styleSheet.insertRule(
          `.get-in a, a.collapse-btn, .slick-next::before, .slick-prev::before, .sk-pruver__btn { color: ${this.customizeData.theme.color} !important; }`,
          styleSheet.cssRules.length
        );
      }

      this.referrerVideoId = this.customizeData.introVideoId
        ? this.customizeData.introVideoId
        : '';

      this.isLoaded = true;
      if (this.favProducts.length > 3) {
        setTimeout(() => {
          tagSliderJS('favoritePrd-slider', this.favProducts.length);
        }, 500);
      }
    });
  }

  createContactForm() {
    return this.formBuilder.group({
      interested: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '(([(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
          ),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      checkAgree: [true, Validators.requiredTrue],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.subscribe(
      (countryCode: string) => {
        this.selectedCountry = countryCode;
      }
    );
  }

  getCountries() {
    this.http
      .get('assets/countries.json')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.countries = data;
      });
  }

  setUserSelectedCountryPhoneCode(country: any) {
    this.userSelectedCountry = country;
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
        this.getProducts();
      });
  }

  getProducts() {
    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (
          data &&
          Object.keys(data).length === 0 &&
          data.constructor === Object
        ) {
          return;
        }

        const soldOutItems: Product[] = [];
        const inSaleItems: Product[] = [];
        data.products.forEach((product, ind) => {
          if (product.isSoldOut || product.isAllVariationOutOfStock) {
            soldOutItems.push(product);
          } else {
            inSaleItems.push(product);
          }
        });

        this.products = [...inSaleItems, ...soldOutItems].sort(
          (a, b) => b.productOrder - a.productOrder
        );
      });
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        console.log('referrer', referrer);
        if (referrer) {
          this.referrer = referrer;
        }
      });
  }

  getUserCustomizeData() {
    this.websiteService
      .getCustomizeData(this.referrer?.userId, this.isApprovalPage)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          console.log('customize-data', res);
          if (typeof res.success && res.success === true) {
            if (!this.isApprovalPage) {
              if (res.data.status === 'approved') {
                this.customizeData = res.data;
              } else if (
                res.data.status === 'pending' &&
                res.data.hasOwnProperty('active_data')
              ) {
                this.customizeData = res.data.active_data;
              } else {
                this.router.navigate(['/']);
              }
            } else {
              if (
                res.data.status === 'pending' &&
                this.apporveTokenFromUrl !== ''
              ) {
                const apporveToken = res?.approve_token;
                console.log('apporveToken', apporveToken);
                if (apporveToken === this.apporveTokenFromUrl) {
                  this.customizeData = this.customizeData = res.data;
                  const removedParamsUrl = this.router.url.substring(
                    0,
                    this.router.url.indexOf('?')
                  );
                  this.location.go(removedParamsUrl);
                } else {
                  this.router.navigate(['/']);
                }
              } else {
                this.router.navigate(['/']);
              }
            }

            if (this.customizeData !== null) {
              this.referrerVideoId = this.customizeData.introVideoId
                ? this.customizeData.introVideoId
                : '';
              if (this.customizeData.favoriteProducts.length) {
                this.favProducts = this.products.filter((product: any) => {
                  return this.customizeData.favoriteProducts.includes(
                    product.id
                  );
                });
              }

              $(document).ready(() => {
                var styleSheet = document.styleSheets[0];
                if (this.customizeData.theme.color !== '') {
                  styleSheet.insertRule(
                    `.ref-card::before, .buy-now, .button-icon, .get-in-touch { background-color: ${this.customizeData.theme.color} !important; }`,
                    styleSheet.cssRules.length
                  );
                  styleSheet.insertRule(
                    `.get-in a, a.collapse-btn, .slick-next::before, .slick-prev::before, .sk-pruver__btn { color: ${this.customizeData.theme.color} !important; }`,
                    styleSheet.cssRules.length
                  );
                }

                this.isLoaded = true;
                if (this.favProducts.length > 3) {
                  setTimeout(() => {
                    tagSliderJS('favoritePrd-slider', this.favProducts.length);
                  }, 500);
                }
              });
            }
          } else {
            this.router.navigate(['/']);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onClickApproveBtn() {
    this.isApproveSubmitted = true;
    this.websiteService
      .approveCustomizeData({ userId: this.referrer?.userId })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          console.log(res);
          this.isApproveSubmitted = false;
          if (res.success) {
            this.isApproved = true;
          } else {
            $('#foorerApprovalbar button').attr('disabled', true);
            $('#foorerApprovalbar button').text('Approve failed');
          }
        },
        (err) => {
          console.log(err);
          this.isApproveSubmitted = false;
          $('#foorerApprovalbar button').attr('disabled', true);
          $('#foorerApprovalbar button').text(
            'Something went wrong. Please try again later'
          );
        }
      );
  }

  onSubmitContactForm() {
    if (this.contactForm.invalid || this.isFormSubmitted) return;
    this.isFormSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.apiService
      .getContactToken()
      .pipe(
        takeUntil(this.destroyed$),
        tap(
          (contactTokenResponse: any) =>
            (this.contactToken = contactTokenResponse)
        ),
        exhaustMap(() => {
          return this.createContact().pipe(
            switchMap((contactResponse: any) => {
              const activity = this.createContactActivity(
                contactResponse.result.contactId
              ).pipe(catchError((error) => of(error)));
              const sysAlert = this.apiService.getSystemAlertToken().pipe(
                switchMap((alertTokenResponse: any) => {
                  return this.websiteService
                    .createSystemAlert(
                      alertTokenResponse.token_type,
                      alertTokenResponse.access_token,
                      this.referrer?.userId,
                      this.f['firstName'].value,
                      this.f['lastName'].value,
                      this.f['interested'].value
                    )
                    .pipe(
                      timeout(30000),
                      catchError((error) => of(error))
                    );
                })
              );
              return forkJoin([activity, sysAlert]);
            })
          );
        })
      )
      .subscribe(
        (response: any) => {
          console.log('forkResponse', response);
          const activiyResponse = response[0];
          const alertResponse = response[1];
          if (activiyResponse.isSuccess || alertResponse.isSuccess) {
            this.successMessage = 'Contact submitted successfully.';
            this.isFormSubmitted = false;
          }
        },
        (err: any) => {
          console.log(err);
          this.errorMessage = 'Something went wrong. Please try again later.';
          this.isFormSubmitted = false;
        },
        () => {
          //this.errorMessage = 'Something went wrong. Please try again later.';
          this.contactForm.reset({ interested: '', checkAgree: true });
          this.isFormSubmitted = false;
        }
      );
  }

  createContact() {
    const phoneWithCode =
      this.userSelectedCountry.phone_code + this.f['phone'].value;
    const contactResponse = this.websiteService.createContactId(
      this.contactToken.token_type,
      this.contactToken.access_token,
      this.referrer?.userId,
      this.f['firstName'].value,
      this.f['lastName'].value,
      this.f['email'].value,
      phoneWithCode,
      this.selectedCountry
    );

    return contactResponse;
  }

  createContactActivity(contactId: string) {
    return this.websiteService.createContactActivity(
      this.contactToken.token_type,
      this.contactToken.access_token,
      contactId,
      this.f['interested'].value
    );
  }

  onClickCloseVideo() {
    this.referrerVideoId = '';
  }

  ScrollIntoView() {
    const getInTouchElement = document.getElementById('getInTouch');
    const getInTouchElementDistance = getInTouchElement
      ? getInTouchElement?.getBoundingClientRect().top -
        this.discountHeight -
        20
      : 0;
    window.scroll(0, getInTouchElementDistance);
    return false;
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange($event: Event) {
    if (document.visibilityState === 'hidden') {
      localStorage.removeItem('customizePreviewData');
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    localStorage.removeItem('customizePreviewData');
  }
}
