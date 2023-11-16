import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription, SubscriptionLike, timer } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-vi-offer',
  templateUrl: './vi-offer.component.html',
  styleUrls: ['./vi-offer.component.css'],
})
export class ViOfferComponent implements OnInit, OnDestroy {
  tenant!: string;
  isViOffer = false;
  isViTimerPresent = false;
  offerorName = '';
  offerorImage = '';
  countDown!: Subscription;
  timerSeconds = 0;
  bonusValue = 0;
  subscriptions: SubscriptionLike[] = [];
  @Input() isCart: boolean = false;

  constructor(
    private dataService: AppDataService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    if(this.tenant === 'pruvit') {
      this.getViOffer();
      this.getViTimerStatus();
    }
  }

  getViOffer() {
    this.subscriptions.push(
      this.dataService.currentViOffer$.subscribe((viStatus: boolean) => {
        //if(viStatus) {
          this.isViOffer = viStatus;
          
          const VIOfferLocal = localStorage.getItem('VIOffer');
          const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;          
          const showGngModal = localStorage.getItem('showGngModal'); // || 'true';
         
          if (VIOffer !== null) {
            this.offerorName = VIOffer.offerorName;
            this.offerorImage = VIOffer.offerorImage ? VIOffer.offerorImage : '';
            this.bonusValue = VIOffer.bonusValue;
            
            if($('#shareVIModal').length === 0 && $('#cookieModal').length === 0 && showGngModal === 'true') {
              this.dataService.changePostName({
                postName: 'vi-modal',
                payload: { key: 'formDisable', value: false },
              });
              $('#shareVIModal').modal('show');
            }
          }

          this.changeDetectionRef.markForCheck();
       // }
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
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
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

  onClaimDiscount() {
    const VIOfferLocal = localStorage.getItem('VIOffer');
    const VIOffer = VIOfferLocal ? JSON.parse(VIOfferLocal) : null;
    let formDisable = false;
    if (VIOffer !== null) {
      formDisable = VIOffer.isFormDisable;
    
      this.dataService.changePostName({
        postName: 'vi-modal',
        payload: { key: 'formDisable', value: formDisable },
      });
      $('#shareVIModal').modal('show');
    }
  }

  ngOnDestroy() {
    if (this.countDown) {
      this.countDown.unsubscribe();
    }
  }
}
