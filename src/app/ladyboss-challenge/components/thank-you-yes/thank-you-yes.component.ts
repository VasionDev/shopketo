import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-thank-you-yes',
  templateUrl: './thank-you-yes.component.html',
  styleUrls: ['./thank-you-yes.component.css'],
})
export class ThankYouYesComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  referrerCode!: string;
  linkCopied!: boolean;
  settings = {
    eventDate: '',
    countdownDate: '',
    fbGroup: '',
  };

  constructor(
    private userEmitterService: UserEmitterService,
    private clipboard: Clipboard,
    private dataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.userEmitterService
      .getProfileObs()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        if (x) {
          this.referrerCode = x.code;
          this.loadTooltip();
        }
      });
    this.dataService.currentProductsData$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (data?.challengeSettings) {
          this.settings = data.challengeSettings;
        }
      });
  }

  copy() {
    this.clipboard.copy(
      this.referrerCode.toLowerCase() + '.ladyboss.io/challenge'
    );
    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
      this.loadTooltip();
    }, 1500);
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
