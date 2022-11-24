import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from '../shared/services/app-data.service';
declare var $: any;
declare var aboutSliderJs: any;
declare var aosJS: any;

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  isCountryAvailable = true;
  referrer: any = {};
  isLoaded = false;

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();

    $(document).ready(() => {
      aboutSliderJs();
      $('body').on('hidden.bs.modal', '#pruvitTVModal', function () {
        $('#pruvitTVModal').remove();
      });
    });
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((height: number) => {
        this.discountHeight = height;
      });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
      });
  }

  getReferrer() {
    this.dataService.currentReferrerData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((referrer: any) => {
        if (referrer) {
          this.referrer = referrer;
        }
      });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((countryCode: string) => {
        this.selectedCountry = countryCode;
      });
  }

  onClickPruvitTv() {
    const videoLink = `https://pruvit.tv/stream?embed=106`;
    this.dataService.setPruvitTvLink(videoLink);
    this.dataService.changePostName({ postName: 'pruvit-modal-utilities' });
    $('#pruvitTVModal').modal('show');
    return false;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
