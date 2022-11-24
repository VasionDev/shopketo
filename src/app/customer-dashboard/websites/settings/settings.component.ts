import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Quill from 'quill';
import { ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { WebsiteService } from '../service/websites-service';
declare var $: any;
declare var window: any;
declare var _wapiq: any;
declare var wistiaUploader: any;
//declare var wistiaUploaderJs: any;

const parchment = Quill.import('parchment');
const block = parchment.query('block');
block.tagName = 'DIV';
// or class NewBlock extends Block {} NewBlock.tagName = 'DIV'
Quill.register(block /* or NewBlock */, true);

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class WebsiteSettingsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('introVideoIdInput') introVideoIdInput!: ElementRef;
  user: any;
  selectedLanguage = '';
  selectedCountry = '';
  customizeForm: FormGroup;
  customizeData: any = null;
  trackingData: any = null;
  isFormSubmitted: boolean = false;
  isCancelSubmitted: boolean = false;
  isLoaded = false;
  products: any[] = [];
  favProducts: any[] = [];
  site: { name: string; url: string } | null = null;
  discountHeight$ = this.dataService.currentDiscountHeight$;
  facebookId: string = environment.facebookAppId;
  referrerCode: string = '';
  isVideoRemoveSubmitted: boolean = false;
  videoRemoveErrorMsg: string = '';
  fbPixelId: string = '';
  fbPageId: string = '';
  gaTrackId: string = '';
  gaAdConvId: string = '';
  gaAdConvLbl: string = '';

  isPixelIdSubmitted: boolean = false;
  isPageIdSubmitted: boolean = false;
  isGAIdSubmitted: boolean = false;
  isAdConvIdSubmitted: boolean = false;

  editorModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
      ],
    },
  };

  public searchControl!: FormControl;
  public searchProducts: any[] = [];

  quillEditor: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: AppDataService,
    private userEmitterService: UserEmitterService,
    private clipboard: Clipboard,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private websiteSvc: WebsiteService,
    private router: Router
  ) {
    this.customizeForm = this.createCustomizeForm();
  }

  ngOnInit(): void {
    this.websiteSvc.userProStatus$.subscribe((status: boolean) => {
      if (!status) this.router.navigate(['/dashboard/websites']);
    });
    this.searchControl = this.formBuilder.control('');
    this.getCurrentSite();
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
        if (this.user) {
          this.referrerCode = this.user.code;
          this.getSelectedLanguage();
          this.getUserCustomizeData();
          this.getUserTrackingData();
        }
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(100), takeUntil(this.destroyed$))
      .subscribe((value) => {
        this.searchProducts = this.products.filter((product) => {
          return (
            product.isFavorite === false &&
            (product.title.toLowerCase().includes(value.toLowerCase()) ||
              product.flavor.toLowerCase().includes(value.toLowerCase()))
          );
        });
      });
  }

  createCustomizeForm() {
    return this.formBuilder.group({
      theme: this.formBuilder.group({
        color: ['#b2a1ea'],
        contactForm: [false],
      }),
      shortBio: [''],
      links: this.formBuilder.array([]),
      socialMedia: this.formBuilder.group({
        facebook: [''],
        twitter: [''],
        instagram: [''],
        youtube: [''],
        tiktok: [''],
        linkedin: [''],
        pinterest: [''],
      }),
      favoriteProducts: [[]],
      introVideoId: [''],
      status: ['pend'],
    });
  }

  getCurrentSite() {
    const selectedSite = this.activatedRoute.snapshot.paramMap.get('site');

    if (selectedSite) {
      switch (selectedSite) {
        case 'shopketo':
          this.site = { name: 'Shopketo', url: 'shopketo.com' };
          break;

        case 'pruvitnow':
          this.site = { name: 'Pruvitnow', url: 'pruvitnow.com' };
          break;

        case 'drinkyoursample':
          this.site = { name: 'Drinkyoursample', url: 'drinkyoursample.com' };
          break;

        case 'challenge':
          this.site = { name: 'Challenge', url: 'challenge.com' };
          break;

        case 'core4':
          this.site = { name: 'Core4', url: 'challenge.com/core4' };
          break;

        case 'rebootnow':
          this.site = { name: 'Rebootnow', url: 'shopketo.com' };
          break;

        default:
          this.site = { name: 'Shopketo', url: 'shopketo.com' };
          break;
      }
    }
  }

  getUserCustomizeData() {
    this.websiteSvc
      .getCustomizeData(this.user.id, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          //console.log(res);
          if (typeof res.success && res.success === true) {
            this.customizeData = res.data;
            this.setupCustomizeFormData();
          }
          this.wistiaUploaderJs(this.user.code);
          this.isLoaded = true;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getUserTrackingData() {
    this.websiteSvc
      .getTrackingeData(this.user.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          //console.log(res);
          if (typeof res.success && res.success === true) {
            //this.trackingData = res.data;
            this.gaTrackId = res.data?.ga_tracking_id;
            this.fbPageId = res.data?.fb_page_id;
            this.fbPixelId = res.data?.fb_pixel_id;
            this.gaAdConvId = res.data?.ad_conversion_id;
            this.gaAdConvLbl = res.data?.ad_conversion_label;
          }
          this.isLoaded = true;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  setupCustomizeFormData() {
    const links = this.customizeForm.get('links') as FormArray;
    while (links.length) {
      links.removeAt(0);
    }
    this.customizeForm.patchValue(this.customizeData);
    this.customizeData.links.forEach((link: any) =>
      links.push(this.formBuilder.group(link))
    );

    if (this.customizeData.status === 'pending') this.customizeForm.disable();

    if (this.customizeData.favoriteProducts.length) {
      this.favProducts = this.products.filter((product) => {
        return this.customizeData.favoriteProducts.includes(product.id);
      });
      this.products.forEach((product) => {
        if (this.customizeData.favoriteProducts.includes(product.id))
          product.isFavorite = true;
      });
    }
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

  createLinkItem() {
    return this.formBuilder.group({
      title: [''],
      link: [''],
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

        this.products = data.products.map((product) => {
          const title =
            product.flavor != ''
              ? product.title.split(product.flavor)[0].replace(/–/g, '').trim()
              : product.title;

          return {
            id: product.id,
            title: title,
            flavor: product.flavor,
            image: product.thumbUrl,
            isFavorite: false,
          };
        });
        this.searchProducts = [...this.products];
      });
  }

  moveLinkUp(index: number) {
    if (index >= 1) {
      this.swap(this.links.controls, index, index - 1);
      this.swap(this.links.value, index, index - 1);
    }
    return false;
  }

  moveLinkDown(index: number) {
    if (index < this.links.controls.length - 1) {
      this.swap(this.links.controls, index, index + 1);
      this.swap(this.links.value, index, index + 1);
    }
    return false;
  }

  onClickLinkRemove(index: number) {
    if (index > -1) {
      this.links.controls.splice(index, 1);
      this.links.value.splice(index, 1);
    }
    return false;
  }

  private swap(array: any, x: number, y: number) {
    const b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  onAddFavProduct(product: any, searchInd: number) {
    this.favProducts.push(product);
    const index = this.products.findIndex((item) => {
      return item.id === product.id;
    });
    if (index !== -1) {
      this.products[index].isFavorite = true;
    }
    if (searchInd !== -1) {
      this.searchProducts.splice(index, 1);
    }
  }

  onRemoveFavProduct(product: any, index: number) {
    if (index !== -1) {
      this.favProducts.splice(index, 1);
    }
    const productInd = this.products.findIndex((item) => {
      return item.id === product.id;
    });
    if (productInd !== -1) {
      this.products[productInd].isFavorite = false;
    }
  }

  onAddNewLink() {
    this.links.push(this.createLinkItem());
    return false;
  }

  get links(): FormArray {
    return <FormArray>this.customizeForm.get('links');
  }

  getQuillEditorInstance(editorInstance: any) {
    this.quillEditor = editorInstance;
  }

  onChangeColorPicker(event: any) {
    $(event.target).next('span').text(event.target.value);
  }

  copy(link: string) {
    let copy = link;
    this.clipboard.copy(copy);
  }

  get f() {
    return this.customizeForm.controls;
  }

  onClickPreviewBtn() {
    if (this.customizeForm.invalid) return;

    if (this.favProducts.length) {
      const favProdIds = this.favProducts.map((item) => {
        return item.id;
      });
      this.f['favoriteProducts'].setValue(favProdIds);
    }
    const introVideoId = $('input[name="introVideoId"]').length
      ? $('input[name="introVideoId"]').val()
      : '';
    this.f['introVideoId'].setValue(introVideoId);

    localStorage.setItem(
      'customizePreviewData',
      JSON.stringify(this.customizeForm.value)
    );
    window.open('/me?ref=' + this.user?.code, '_blank');
  }

  onSubmitCustomizeForm() {
    if (this.customizeForm.invalid) return;
    if (this.favProducts.length) {
      const favProdIds = this.favProducts.map((item) => {
        return item.id;
      });
      this.f['favoriteProducts'].setValue(favProdIds);
    }
    const introVideoId = $('input[name="introVideoId"]').length
      ? $('input[name="introVideoId"]').val()
      : '';
    this.f['introVideoId'].setValue(introVideoId);
    this.f['status'].setValue('pending');

    this.isFormSubmitted = true;
    this.websiteSvc
      .createCustomizeData(
        this.customizeForm.value,
        this.user.id,
        `${this.user.firstName} ${this.user.lastName}`,
        this.user?.email ? this.user.email : this.user?.publicEmail,
        this.user.code
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          //console.log(res);
          if (res.success === true && res.data) {
            this.customizeData = res.data;
            this.customizeForm.disable();
            window.scroll(0, 0);
          }
          this.isFormSubmitted = false;
        },
        (err) => {
          console.log(err);
          this.isFormSubmitted = false;
        }
      );
  }

  onCancelPendingRequest() {
    this.isCancelSubmitted = true;
    this.websiteSvc
      .cancelCustomizeData({ userId: this.user?.id })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          //console.log(res);
          this.isCancelSubmitted = false;
          if (res.success) {
            if (this.customizeData?.active_data) {
              this.customizeData = this.customizeData.active_data;
              this.setupCustomizeFormData();
            } else {
              this.customizeData = null;
            }

            this.removeWistiaPreview();
          }
        },
        (err) => {
          console.log(err);
          this.isCancelSubmitted = false;
          // $('#foorerApprovalbar button').text(
          //   'Something went wrong. Please try again later'
          // );
        }
      );
  }

  onClickRemoveVideo() {
    this.isVideoRemoveSubmitted = true;
    this.videoRemoveErrorMsg = '';
    const payLoad = {
      userId: this.user.id,
      videoId: this.introVideoIdInput.nativeElement.value,
    };

    this.websiteSvc
      .removeWistiaVideo(payLoad)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          //console.log(res);
          this.isVideoRemoveSubmitted = false;
          if (res.success) {
            this.introVideoIdInput.nativeElement.value = '';
            if (this.customizeData !== null) {
              this.customizeData.introVideoId = '';
            }
            this.removeWistiaPreview();
          } else {
            this.videoRemoveErrorMsg =
              'Something went wrong. Please try again later';
          }
        },
        (err) => {
          console.log(err);
          this.isVideoRemoveSubmitted = false;
          this.videoRemoveErrorMsg =
            'Something went wrong. Please try again later';
        }
      );
  }

  removeWistiaPreview() {
    if ($('.wistia_upload_preview').length === 0) return;
    $('.wistia_upload_preview').empty();
    $('.wistia_upload_preview').removeAttr('style');
    $('.wistia_upload_preview').removeClass('wistia_preview_visible');
    $('#wistia_uploader').removeClass('wistia_preview_visible');
    $('#wistia_uploader').removeAttr('data-suppress-browse');
  }

  redirectFacebook(link: string) {
    window.open(
      'https://www.facebook.com/dialog/share?' +
        'app_id=' +
        this.facebookId +
        '&display=popup' +
        '&href=' +
        encodeURIComponent(link) +
        '&redirect_uri=' +
        encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  redirectTwitter(link: string) {
    window.open(
      'https://twitter.com/intent/tweet' +
        '?url=' +
        encodeURIComponent(link) +
        '&text=' +
        encodeURIComponent(
          'I just wanted to share with you PruvIt! Please take a look ;) '
        ),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  wistiaUploaderJs(code: string) {
    const projectId = environment.isStaging ? 'hx7cfaumq5' : 'a440k04dsy';
    $(document).ready(() => {
      window._wapiq = window._wapiq || [];
      _wapiq.push(function (W: any) {
        window.wistiaUploader = new W.Uploader({
          accessToken:
            '1f44138fbcbb3ac60ceeeccca0ec64969dc9ebd096fa7f08f3b995b6ca73d316',
          dropIn: 'wistia_uploader',
          projectId: projectId,
          onBeforeUnload:
            'Are you sure you wish to leave the page? Any active uploads will be lost.',
        });

        wistiaUploader.setFileName(code);

        wistiaUploader.bind('uploadsuccess', function (file: any, media: any) {
          console.log('Upload succeeded.');
          $('#wistia_uploader').next().val(media.id);
        });
      });
    });
  }

  saveGAId() {
    this.isGAIdSubmitted = true;
    this.websiteSvc
      .saveTrackingeData(
        {
          ga_tracking_id: this.gaTrackId,
        },
        this.user.id
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isGAIdSubmitted = false;
        },
        (err) => {
          this.isGAIdSubmitted = false;
        }
      );
  }

  saveAdConvId() {
    this.isAdConvIdSubmitted = true;
    this.websiteSvc
      .saveTrackingeData(
        {
          ad_conversion_id: this.gaAdConvId,
          ad_conversion_label: this.gaAdConvLbl,
        },
        this.user.id
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isAdConvIdSubmitted = false;
        },
        (err) => {
          this.isAdConvIdSubmitted = false;
        }
      );
  }

  savePixelId() {
    this.isPixelIdSubmitted = true;
    this.websiteSvc
      .saveTrackingeData(
        {
          fb_pixel_id: this.fbPixelId,
        },
        this.user.id
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isPixelIdSubmitted = false;
        },
        (err) => {
          this.isPixelIdSubmitted = false;
        }
      );
  }

  savePageId() {
    this.isPageIdSubmitted = true;
    this.websiteSvc
      .saveTrackingeData(
        {
          fb_page_id: this.fbPageId,
        },
        this.user.id
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isPageIdSubmitted = false;
        },
        (err) => {
          this.isPageIdSubmitted = false;
        }
      );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
