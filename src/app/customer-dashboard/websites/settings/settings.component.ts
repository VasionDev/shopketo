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
import extractDomain from 'extract-domain';
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
  isStaging!: boolean;
  selectedLanguage = '';
  selectedCountry = '';
  customizeForm: FormGroup;
  customizeData: any = null;
  trackingData: any = null;
  isFormSubmitted: boolean = false;
  isCancelSubmitted: boolean = false;
  isLoaded = false;
  products: any[] = [];
  countries: any[] = [];
  favProducts: any = [];
  site: { name: string; url: string } | null = null;
  facebookId: string = environment.facebookAppId;
  referrerCode: string = '';
  isVideoRemoveSubmitted: boolean = false;
  videoRemoveErrorMsg: string = '';
  fbPixelId: string = '';
  fbMetaTag: string = '';
  fbPageId: string = '';
  gaTrackId: string = '';
  gaAdConvId: string = '';
  gaAdConvLbl: string = '';

  isPixelIdSubmitted: boolean = false;
  isfbMetaTagSubmitted: boolean = false;
  isPageIdSubmitted: boolean = false;
  isGAIdSubmitted: boolean = false;
  isAdConvIdSubmitted: boolean = false;
  isProductLoaded: boolean = true;

  productCountry: any = null;
  productCountryCode: string = 'US';
  productSiteId: number = 1;

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

  isThemeChanged = false;
  isLinksChanged = false;
  validLinkDomains = [
    'shopketo.com',
    'pruvitnow.com',
    'pruvit.tv',
    'pvt.ai',
    'experienceketo.com',
  ];
  isAllValidLinks = false;
  linkErrorAt!: number;
  isFavProductsChanged = false;
  isSavingFavProducts = false;
  isFavProductsSaved = false;
  isShortBioChanged = false;
  isIntroVideoChanged = false;
  isIntroVideoSaving = false;
  isCancellingBio = false;
  isCancellingVideo = false;
  isSavingBio = false;
  isSavingTheme = false;
  isThemeSaved = false;
  isSavingLinks = false;
  isLinksSaved = false;
  showConfirmToaster = false;

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
    this.isStaging = environment.isStaging;
    this.customizeForm = this.createCustomizeForm();
  }

  ngOnInit(): void {
    this.searchControl = this.formBuilder.control('');
    this.getCountries();
    this.getCurrentSite();
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.user = x;
        if (this.user) {
          this.productCountryCode = this.user.country;
          this.productCountry = this.countries.find((country: any) => {
            return country.country_code === this.productCountryCode;
          });

          if (!(x.id === 675 || (this.isStaging && x.id === 586881)))
            this.getPulseProStatus(x.id);
          this.referrerCode = this.user.code;
          this.getSelectedLanguage();
          this.getUserCustomizeData();
          this.getUserTrackingData();
        } else {
          this.router.navigate(['/cloud/websites']);
        }
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroyed$))
      .subscribe((value) => {
        this.searchProducts = this.products.filter((product) => {
          return (
            product.isFavorite === false &&
            (product.title.toLowerCase().includes(value.toLowerCase()) ||
              product.flavor.toLowerCase().includes(value.toLowerCase()))
          );
        });
        window.scrollTo(window.scrollX, window.scrollY + 1);
        window.scrollTo(window.scrollX, window.scrollY - 1);
      });
  }

  getCountries() {
    this.dataService.currentCountries$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((countries: any) => {
        if (countries) {
          this.countries = countries
            .filter((country: any) => country.active === '1')
            .sort((a: any, b: any) => (a.country > b.country ? 1 : -1));
        }
      });
  }

  getPulseProStatus(userId: number) {
    this.websiteSvc
      .getPulseProStatus(userId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        if (!(res.isSuccess && res?.result?.isPro)) {
          this.router.navigate(['/cloud/websites']);
        }
      });
  }

  createCustomizeForm() {
    return this.formBuilder.group({
      theme: this.formBuilder.group({
        color: ['#2152ff'],
        contactForm: [false],
      }),
      links: this.formBuilder.array([]),
      favoriteProducts: [''],
      shortBio: this.formBuilder.group({
        bioData: [''],
        status: [''],
      }),
      introVideo: this.formBuilder.group({
        videoId: [''],
        status: [''],
      }),
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
      .getCustomizeData(this.user.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (typeof res.success && res.success === true) {
            this.customizeData = res.data;
            this.setupCustomizeFormData();
          } else {
            this.favProducts[this.productCountryCode] = [];
          }
          this.onFormValueChange();
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
          if (typeof res.success && res.success === true) {
            this.gaTrackId = res.data?.ga_tracking_id;
            this.fbPageId = res.data?.fb_page_id;
            this.fbPixelId = res.data?.fb_pixel_id;
            this.fbMetaTag = res.data?.fb_meta_tag;
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

  onFormValueChange() {
    this.customizeForm.get('theme')?.valueChanges.subscribe((value) => {
      const initialThemeData = this.customizeData?.theme ? this.customizeData.theme : { color: '', contactForm: false };
      this.isThemeChanged = Object.keys(initialThemeData).some((key) =>
        this.customizeForm.get('theme')?.value[key] != initialThemeData[key]
      );
      this.isThemeSaved = !this.isThemeChanged && this.customizeData?.theme;
      this.showConfirmToaster = false;
    });
    
    this.customizeForm.get('links')?.valueChanges.pipe(debounceTime(1000)).subscribe((value) => {
      const initialLinskData = this.customizeData?.links ? this.customizeData.links : [];
      this.linkErrorAt = -1;
      
      this.isLinksChanged = !(initialLinskData.length === value.length 
        && initialLinskData.every((element_1: any) => value.some(
            (element_2: any) =>
              element_1.title === element_2.title &&
              element_1.link === element_2.link
          )
        )
      );
      this.isAllValidLinks = value.every((item: any, ind: number) => {
        const isValid = this.validLinkDomains.some((validDomain) =>
          extractDomain(item.link).startsWith(validDomain)
        );
        if (!isValid && item.link !== '') this.linkErrorAt = ind;
        return isValid;
      });
      this.isLinksSaved = !this.isLinksChanged && this.customizeData?.links;
      this.showConfirmToaster = false;
      
    });

    this.customizeForm.get('shortBio')?.valueChanges.subscribe((value) => {
      const initialBioData = this.customizeData?.shortBio?.bioData;
      if (initialBioData && value['bioData']) {
        this.isShortBioChanged = value['bioData'] != initialBioData;
      } else if (initialBioData || value['bioData']) {
        this.isShortBioChanged = true;
      } else {
        this.isShortBioChanged = false;
      }
      this.showConfirmToaster = false;
    });

    this.customizeForm.get('introVideo')?.valueChanges.subscribe((value) => {
      const initialVideoId = this.customizeData?.introVideo?.videoId;
      if (initialVideoId && value['videoId']) {
        this.isIntroVideoChanged = value['videoId'] != initialVideoId;
      } else if (initialVideoId || value['videoId']) {
        this.isIntroVideoChanged = true;
      } else {
        this.isIntroVideoChanged = false;
      }
      this.showConfirmToaster = false;
    });
  }

  resetThemeData() {
    this.customizeForm.get('theme')?.setValue(this.customizeData?.theme);
  }

  resetShortBioata() {
    const initialData = this.customizeData?.shortBio ? this.customizeData?.shortBio : { bioData: '', status: '' };
    this.customizeForm.get('shortBio')?.setValue(initialData);
  }

  resetIntroVideoData() {
    this.customizeForm.get('introVideo')?.setValue(this.customizeData?.introVideo);
  }

  resetLinkData() {
    const links = this.customizeForm.get('links') as FormArray;
    while (links.length) {
      links.removeAt(0);
    }
    if(this.customizeData?.links) {
      this.customizeData?.links.forEach((link: any) =>
        links.push(this.formBuilder.group(link))
      );
    }
  }

  resetFavProductData() {
    const key = this.productCountryCode;
    if (
      this.customizeData?.favoriteProducts &&
      Object.entries(this.customizeData.favoriteProducts).length &&
      this.customizeData.favoriteProducts[key]
    ) {
      this.isFavProductsSaved = true;
      this.favProducts[key] = this.products.filter((product) => {
        return this.customizeData.favoriteProducts[key].includes(
          product.uniqueId
        );
      });
      this.products.forEach((product) => {
        if (this.customizeData.favoriteProducts[key].includes(product.uniqueId))
          product.isFavorite = true;
      });
    } else {
      this.favProducts[key] = [];
    }
    this.isFavProductsChanged = false;
  }

  setupCustomizeFormData() {
    this.isThemeSaved = this.customizeData?.theme; 
    this.isLinksSaved = this.customizeData?.links;
    this.isFavProductsSaved = this.customizeData?.favoriteProducts;

    const links = this.customizeForm.get('links') as FormArray;
    while (links.length) {
      links.removeAt(0);
    }
    this.customizeForm.patchValue(this.customizeData);
    if (this.customizeData?.links) {
      this.customizeData?.links.forEach((link: any) =>
        links.push(this.formBuilder.group(link))
      );
    }

    if (this.customizeData.status === 'pending') this.customizeForm.disable();
    const key = this.productCountryCode;
    if (
      this.customizeData?.favoriteProducts &&
      Object.entries(this.customizeData.favoriteProducts).length &&
      this.customizeData.favoriteProducts[key]
    ) {
      this.favProducts[key] = this.products.filter((product) => {
        return this.customizeData.favoriteProducts[key].includes(
          product.uniqueId
        );
      });
      this.products.forEach((product) => {
        if (this.customizeData.favoriteProducts[key].includes(product.uniqueId))
          product.isFavorite = true;
      });
    } else {
      this.favProducts[key] = [];
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
            uniqueId: product.uniqueId,
            title: title,
            flavor: product.flavor ? product.flavor : '',
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
      this.checkForValidLinks();
    }
    return false;
  }

  moveLinkDown(index: number) {
    if (index < this.links.controls.length - 1) {
      this.swap(this.links.controls, index, index + 1);
      this.swap(this.links.value, index, index + 1);
      this.checkForValidLinks();
    }
    return false;
  }

  onLinkRemove(index: number) {
    if (index > -1) {
      this.links.controls.splice(index, 1);
      this.links.value.splice(index, 1);
      
      this.checkForValidLinks();
    }
    return false;
  }

  checkForValidLinks() {
    const initialLinskData = this.customizeData?.links ? this.customizeData.links : [];
    this.linkErrorAt = -1;
    this.isLinksChanged = !(initialLinskData.length === this.links.value.length 
      && initialLinskData.every((element_1: any) => this.links.value.some(
          (element_2: any) =>
            element_1.title === element_2.title &&
            element_1.link === element_2.link
        )
      )
    );

    this.isAllValidLinks = true;
    this.links.value.forEach((item: any, ind: number) => {
      const isValid = this.validLinkDomains.some((validDomain) =>
        extractDomain(item.link).startsWith(validDomain)
      );
      if(!isValid) this.isAllValidLinks = false;
      if (!isValid && this.links.value[ind].link !== '') this.linkErrorAt = ind;
    });

    this.isLinksSaved = !this.isLinksChanged && this.customizeData?.links;
    this.showConfirmToaster = false;
  }

  private swap(array: any, x: number, y: number) {
    const b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  onAddFavProduct(product: any, searchInd: number) {
    const key = this.productCountryCode;
    this.favProducts[key].push(product);
    const index = this.products.findIndex((item) => {
      return item.uniqueId === product.uniqueId;
    });
    if (index !== -1) {
      this.products[index].isFavorite = true;
    }
    if (searchInd !== -1) {
      this.searchProducts.splice(index, 1);
    }
    this.checkChangesForFavProduct();
  }

  onRemoveFavProduct(product: any, index: number) {
    const key = this.productCountryCode;
    if (index !== -1) {
      this.favProducts[key].splice(index, 1);
    }
    const productInd = this.products.findIndex((item) => {
      return item.uniqueId === product.uniqueId;
    });
    if (productInd !== -1) {
      this.products[productInd].isFavorite = false;
    }
    this.checkChangesForFavProduct();
  }

  checkChangesForFavProduct() {
    let favProds: any = {};
    if (Object.entries(this.favProducts).length) {
      for (var key in this.favProducts) {
        favProds[key] = this.favProducts[key].map((item: any) => {
          return item.uniqueId;
        });
      }
    }

    if (this.customizeData?.favoriteProducts) {
      if (
        Object.entries(this.customizeData.favoriteProducts).length >
        Object.entries(this.favProducts).length
      ) {
        for (var key in this.customizeData.favoriteProducts) {
          if (!favProds[key])
            favProds[key] = this.customizeData.favoriteProducts[key];
        }
      }
      this.isFavProductsChanged =
        JSON.stringify(favProds) !==
        JSON.stringify(this.customizeData.favoriteProducts);
    } else {
      if (Object.entries(favProds).length) {
        this.isFavProductsChanged = Object.entries(favProds).some(
          (item: any) => item[1].length
        );
      }
    }
    this.isFavProductsSaved = this.customizeData?.favoriteProducts && !this.isFavProductsChanged;
    this.showConfirmToaster = false;
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

  onClickPreview() {
    if (this.customizeForm.invalid) return;
    let previewData: any = {};
    let favProds: any = {};
    if (Object.entries(this.favProducts).length) {
      for (var key in this.favProducts) {
        favProds[key] = this.favProducts[key].map((item: any) => {
          return item.uniqueId;
        });
      }
    }

    if (
      this.customizeData?.favoriteProducts && 
      Object.entries(this.customizeData?.favoriteProducts).length >
      Object.entries(this.favProducts).length
    ) {
      for (var key in this.customizeData.favoriteProducts) {
        if (!favProds[key])
          favProds[key] = this.customizeData.favoriteProducts[key];
      }
    }

    previewData.favoriteProducts = favProds;
    
    const introVideoId = $('input[name="introVideoId"]').length ? $('input[name="introVideoId"]').val() : '';
    previewData.introVideo = { videoId: introVideoId, 'status': 'approved' };
    previewData.shortBio = { bioData: this.customizeForm.get('shortBio')?.value['bioData'], status: 'approved' };
    previewData.theme = this.customizeForm.get('theme')?.value;
    previewData.links = this.customizeForm.get('links')?.value;
    
    localStorage.setItem('customizePreviewData', JSON.stringify(previewData));
    window.open('/me?ref=' + this.user?.code, '_blank');
  }

  onSaveTheme() {
    if (this.customizeForm.invalid) return;
    this.isSavingTheme = true;
    this.websiteSvc
      .saveThemeData(
        this.customizeForm.get('theme')?.value,
        this.user.id
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success === true) {
            this.customizeData = res.data;
            this.isThemeChanged = false;
            this.isThemeSaved = true;
            this.showConfirmToaster = true;
          }
          this.isSavingTheme = false;
        },
        (err) => {
          console.log(err);
          this.isSavingTheme = false;
        }
      );
  }

  onSaveLinks() {
    if (this.customizeForm.invalid) return;
    this.isSavingLinks = true;
    this.websiteSvc.saveLinksData(this.customizeForm.get('links')?.value, this.user.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success === true) {
            this.customizeData = res.data;
            this.isLinksChanged = false;
            this.isLinksSaved = true;
            this.showConfirmToaster = true;
          }
          this.isSavingLinks = false;
        },
        (err) => {
          console.log(err);
          this.isSavingLinks = false;
        }
      );
  }

  onSaveFavProducts() {
    if (this.customizeForm.invalid) return;
    let favProds: any = {};
    if (Object.entries(this.favProducts).length) {
      for (var key in this.favProducts) {
        favProds[key] = this.favProducts[key].map((item: any) => {
          return item.uniqueId;
        });
      }
    }

    if (
      this.customizeData?.favoriteProducts && 
      Object.entries(this.customizeData?.favoriteProducts).length
    ) {
      for (var key in this.customizeData.favoriteProducts) {
        if (!favProds[key])
          favProds[key] = this.customizeData.favoriteProducts[key];
      }
    }

    this.f['favoriteProducts'].setValue(favProds);
  
    this.isSavingFavProducts = true;
    this.websiteSvc.saveFavProductsData(this.customizeForm.get('favoriteProducts')?.value, this.user.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success === true) {
            this.customizeData = res.data;
            this.isFavProductsChanged = false;
            this.isFavProductsSaved = true;
            this.showConfirmToaster = true;
          }
          this.isSavingFavProducts = false;
        },
        (err) => {
          console.log(err);
          this.isSavingFavProducts = false;
        }
      );
  }

  onSaveShortBio() {
    if (this.customizeForm.invalid) return;
    this.isSavingBio = true;
    this.websiteSvc.saveShortBioData(
        this.customizeForm.get('shortBio')?.value['bioData'],
        this.user.id,
        `${this.user.firstName} ${this.user.lastName}`,
        this.user?.email ? this.user.email : this.user?.publicEmail,
        this.user.code
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success === true) {
            this.customizeData = res.data;
            this.isShortBioChanged = false;
            this.showConfirmToaster = true;
          }
          this.isSavingBio = false;
        },
        (err) => {
          console.log(err);
          this.isSavingBio = false;
        }
      );
  }

  onCancelShortBio() {
    this.isCancellingBio = true;
    this.websiteSvc
      .cancelShortBioData({ userId: this.user?.id })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isCancellingBio = false;
          if (res.success) {
            this.isShortBioChanged = false;
            const initialData = this.customizeData?.oldShortBio
              ? this.customizeData.oldShortBio
              : { bioData: '', status: '' };
            this.customizeForm.get('shortBio')?.setValue(initialData);
            this.customizeData.shortBio = initialData;
            this.showConfirmToaster = true;
          }
        },
        (err) => {
          console.log(err);
          this.isCancellingBio = false;
        }
      );
  }

  saveIntroVideo(videoId: string) {
    this.websiteSvc.saveIntroVideoData(
        videoId,
        this.user.id,
        `${this.user.firstName} ${this.user.lastName}`,
        this.user?.email ? this.user.email : this.user?.publicEmail,
        this.user.code
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success === true) {
            this.customizeData = res.data;
            this.showConfirmToaster = true;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onRemoveIntroVideo() {
    this.isCancellingVideo = true;
    this.websiteSvc
    .removeIntoVideo({ userId: this.user?.id, videoId: this.customizeData?.introVideo?.videoId })
    .pipe(takeUntil(this.destroyed$))
    .subscribe(
      (res) => {
        this.isCancellingVideo = false;
        if (res.success) {
          this.customizeForm.get('introVideo')?.setValue({ videoId: '', status: '' });
          this.customizeData.introVideo = { videoId: '', status: '' };
          this.removeWistiaPreview();
          this.showConfirmToaster = true;
        }
      },
      (err) => {
        console.log(err);
        this.isCancellingVideo = false;
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
    const projectId = this.isStaging ? 'hx7cfaumq5' : 'a440k04dsy';
    $(document).ready(() => {
      window._wapiq = window._wapiq || [];
      _wapiq.push( (W: any) => {
        window.wistiaUploader = new W.Uploader({
          accessToken:
            '1f44138fbcbb3ac60ceeeccca0ec64969dc9ebd096fa7f08f3b995b6ca73d316',
          dropIn: 'wistia_uploader',
          projectId: projectId,
          onBeforeUnload:
            'Are you sure you wish to leave the page? Any active uploads will be lost.',
        });

        wistiaUploader.setFileName(code);

        wistiaUploader.bind('uploadsuccess',  (file: any, media: any) => {
          console.log('Upload succeeded.');
          this.saveIntroVideo(media.id);
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
        this.user.id,
        this.referrerCode
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
        this.user.id,
        this.referrerCode
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
        this.user.id,
        this.referrerCode
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

  saveFbMetaTag() {
    this.isfbMetaTagSubmitted = true;
    this.websiteSvc
      .saveTrackingeData(
        {
          fb_meta_tag: this.fbMetaTag,
        },
        this.user.id,
        this.referrerCode
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.isfbMetaTagSubmitted = false;
        },
        (err) => {
          this.isfbMetaTagSubmitted = false;
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
        this.user.id,
        this.referrerCode
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

  onChangeProductCountry(country: any) {
    this.isProductLoaded = false;
    this.productCountry = country;
    this.productCountryCode = country.country_code;
    this.productSiteId = country.blog_id;
    const key = this.productCountryCode;
    this.websiteSvc
      .getProductByCountry(country.country_code.toLowerCase())
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.products = res.map((product: any) => {
            const title =
              product.flavor != ''
                ? product.post_title
                    .split(product.flavor)[0]
                    .replace(/–/g, '')
                    .trim()
                : product.post_title;

            return {
              id: product.ID,
              uniqueId: product.uniqueId,
              title: title,
              flavor: product.flavor ? product.flavor : '',
              image: product.post_thumb_url,
              isFavorite: false,
            };
          });
          this.searchProducts = [...this.products];
          this.isProductLoaded = true;
          //if (this.favProducts[key] === undefined) this.favProducts[key] = [];

          if (
            this.customizeData?.favoriteProducts &&
            Object.entries(this.customizeData.favoriteProducts).length &&
            this.customizeData.favoriteProducts[key] &&
            this.customizeData.favoriteProducts[key].length
          ) {
            this.favProducts[key] = this.products.filter((product) => {
              return this.customizeData.favoriteProducts[key].includes(
                product.uniqueId
              );
            });
            this.products.forEach((product) => {
              if (
                this.customizeData.favoriteProducts[key].includes(
                  product.uniqueId
                )
              )
                product.isFavorite = true;
            });
          } else {
            if (!this.favProducts[key]) this.favProducts[key] = [];
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
