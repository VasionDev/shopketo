import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, SubscriptionLike, timer } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-vi-offer',
  templateUrl: './vi-offer.component.html',
  styleUrls: ['./vi-offer.component.css'],
})
export class ViOfferComponent implements OnInit, OnDestroy {
  isViOffer = false;
  isViTimerPresent = false;
  offerorName = '';
  offerorImage = '';
  countDown!: Subscription;
  timerSeconds = 0;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getViOffer();
    this.getViTimerStatus();
  }

  getViOffer() {
    this.subscriptions.push(
      this.dataService.currentViOffer$.subscribe((viStatus: boolean) => {
        this.isViOffer = viStatus;

        const VIOfferLocal = localStorage.getItem('VIOffer');
        const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;

        if (VIOffer !== null) {
          this.offerorName = VIOffer.offerorName;
          this.offerorImage = VIOffer.offerorImage;
        }

        this.changeDetectionRef.markForCheck();
      })
    );
  }

  getViTimerStatus() {
    this.subscriptions.push(
      this.dataService.currentViTimer$.subscribe((expiryTime) => {
        if (expiryTime) {
          this.isViTimerPresent = true;

          this.setViTimer(expiryTime);
        } else {
          this.isViTimerPresent = false;
        }

        this.changeDetectionRef.markForCheck();
      })
    );
  }

  private setViTimer(expiryTime: string) {
    const expiryDate = new Date(expiryTime);
    const now = new Date();

    this.timerSeconds = (expiryDate.getTime() - now.getTime()) / 1000;

    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.timerSeconds <= 0) {
        if (this.countDown) {
          this.countDown.unsubscribe();
        }

        localStorage.removeItem('VIUser');
        this.dataService.setViTimer('');
        // localStorage.removeItem('VIOffer');
        // this.dataService.setViOffer(false);
      }

      --this.timerSeconds;

      this.changeDetectionRef.markForCheck();
    });
  }

  /*private setViTimer(expiryTime: string) {
    const expiryDate = new Date(
      new Date(expiryTime).toLocaleString('en-US', {
        timeZone: 'America/Chicago',
      })
    );
    const now = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'America/Chicago',
      })
    );

    this.timerSeconds = (expiryDate.getTime() - now.getTime()) / 1000;

    this.countDown = timer(0, 1000).subscribe(() => {
      if (this.timerSeconds <= 0) {
        if (this.countDown) {
          this.countDown.unsubscribe();
        }

        localStorage.removeItem('VIUser');
        localStorage.removeItem('VIOffer');

        this.dataService.setViOffer(false);
        this.dataService.setViTimer('');
      }

      --this.timerSeconds;

      this.changeDetectionRef.markForCheck();
    });
  }*/

  onClaimDiscount() {
    this.dataService.changePostName({
      postName: 'vi-modal',
    });

    $('#shareVIModal').modal('show');
  }

  ngOnDestroy() {
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
  }
}
