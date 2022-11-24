import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { BillingAddress } from '../../models/billingAddress';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-add-billing-address',
  templateUrl: './add-billing-address.component.html',
  styleUrls: ['./add-billing-address.component.css'],
})
export class AddBillingAddressComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public confirmShow: boolean = false;
  public country: string = '';
  public addressSent: BillingAddress = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
    region: '',
    country: '',
  };
  @Output() setNewAddressId = new EventEmitter<number>();
  @Output() hideFormBool = new EventEmitter<boolean>();
  constructor(private dataService: AppDataService) {}

  ngOnInit(): void {
    this.getCountry();
  }

  getCountry() {
    this.dataService.currentSelectedCountry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((countryCode: string) => {
        this.country = countryCode;
      });
  }

  getAddress($event: BillingAddress) {
    this.addressSent = $event;
    this.confirmShow = true;
  }

  getNewAddressId($event: number) {
    this.setNewAddressId.emit($event);
    this.confirmShow = true;
  }

  hideConfirm($event: boolean) {
    this.confirmShow = false;
  }

  hideForm($event: boolean) {
    this.hideFormBool.emit($event);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
