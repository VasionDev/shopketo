import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { CreditCardCreate } from '../../models/creditCardCreate';
import { CreditCardEdit } from '../../models/creditCardEdit';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var $: any;
@Component({
  selector: 'payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.css']
})
export class PaymentCreateComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public months: Array<string> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  public creditCardCreate: CreditCardCreate = {
    addressProfileId: 0,
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
    paymentMethodId: 5
  };
  public creditCardEdit: CreditCardEdit = {
    expirationDate: '',
    cvv: ''
  }
  public years: Array<number> = [];
  public addresses: Array<any> = [];
  public cardYear: string = '';
  public cardMonth: string = '';
  public securityCode: string = '';
  public cardExpError: boolean = false;
  public cardType: string = '';
  public error: string = '';
  public cardInputError: boolean = false;
  public editAddressId: number = 0;
  public loading: boolean = false;
  public loader: boolean = false;
  public newAddressProfile: number = 0;
  public showCreateAddress: boolean = false;
  @Input('isEdit')
  public isEdit: boolean = false;
  @Input('user')
  public user: any;
  @Input('editPayment')
  public editPayment: any;
  @Input('showCreateAddressEvent')
  public showCreateAddressEvent!: EventEmitter<boolean>;;
  @Input() events!: Observable<void>;
  @Output() hideCreate = new EventEmitter<boolean>();
  constructor(private newgenService: NewgenApiService) {
    let date = new Date();
    let year = date.getFullYear();
    for (let i = 0; i < 21; i++) {
      this.years.push(year + i);
    }
  }

  ngOnInit(): void {
    this.getAddressProfile(this.user.id);
    this.showCreateAddressEvent.subscribe(data => {
      this.showCreateAddress = data;
      this.getAddressProfile(this.user.id);
    });
  }

  getAddressProfile(userId: string) {
    this.loader = true;
    this.newgenService
      .getAddressProfile({ userId: userId, expandContact: true })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        this.addresses = x.collection;
        this.loader = false;
        if (this.isEdit) {
          this.creditCardCreate.cardHolderName = this.editPayment.cardHolderName;
          this.creditCardCreate.cardNumber = this.editPayment.maskedCardNumber;
          this.cardMonth = new Date(this.editPayment.expirationDate).getMonth().toString();
          this.cardYear = new Date(this.editPayment.expirationDate).getFullYear().toString();
          const found = this.addresses.find(({ addressAlias }) => addressAlias == this.editPayment.addressAlias)
          this.editAddressId = found.id;
          if (this.newAddressProfile > 0) {
            this.creditCardCreate.addressProfileId = this.newAddressProfile;
          }
          else {
            this.creditCardCreate.addressProfileId = found.id;
          }
        }
      });
  }

  createPayment() {
    this.error = '';
    this.loading = true;
    if (this.cardExpError || this.cardInputError) {
      this.loading = false;
      return;
    }
    const date = new Date(
      Date.UTC(parseInt(this.cardYear), parseInt(this.cardMonth), 1)
    );
    this.creditCardCreate.expirationDate = date.toISOString();
    this.creditCardCreate.save = true;
    this.newgenService
      .creditCardProfileCreate(this.creditCardCreate)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        this.loading = false;
        if (!x.isSuccess) {
          this.error = x.responseStatus.errors[0].message;
          return;
        }
        this.hideCreate.emit(true);
        $('#paymentModal').modal('hide');
      });
  }

  updatePayment() {
    this.error = '';
    this.loading = true;
    this.checkDate()
    if (this.cardExpError || this.cardInputError) {
      this.loading = false;
      return;
    }
    const date = new Date(
      Date.UTC(parseInt(this.cardYear), parseInt(this.cardMonth), 1)
    );
    this.creditCardEdit.expirationDate = date.toISOString().replace("T00", "T06");
    this.creditCardEdit.cvv = this.securityCode;
    if (this.creditCardCreate.cardHolderName !== this.editPayment.cardHolderName) {
      this.creditCardEdit.cardHolderName = this.creditCardCreate.cardHolderName;
    }
    if (this.editAddressId !== this.creditCardCreate.addressProfileId) {
      this.creditCardEdit.addressProfileId = this.creditCardCreate.addressProfileId;
    }

    this.newgenService
      .updatePaymentProfile(this.editPayment.id, this.creditCardEdit)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        this.loading = false;
        if (!x.isSuccess) {
          this.error = x.responseStatus.errors[0].message;
          return;
        }
        this.hideCreate.emit(true);
        $('#paymentModal').modal('hide');
      });
  }

  cancel() {
    this.hideCreate.emit(true);
  }

  checkDate() {
    let date = new Date();
    if (
      this.cardMonth <= date.getMonth().toString() &&
      this.cardYear == date.getFullYear().toString()
    ) {
      this.cardExpError = true;
    } else {
      this.cardExpError = false;
    }
  }

  cardNumber(value: string) {
    if (this.isEdit) {
      return;
    }
    if (value != '') {
      // Taking out values from the input
      let oneValue = parseInt(value.substring(0, 1));
      let twoValue = parseInt(value.substring(0, 2));
      let threeValue = parseInt(value.substring(0, 3));
      let fourValue = parseInt(value.substring(0, 4));
      let sixValue = parseInt(value.substring(0, 6));
      //the if else
      if (twoValue == 34 || twoValue == 37) {
        //card is amex
        this.cardType = 'amex';
      } else if (oneValue == 4) {
        //card is visa
        this.cardType = 'visa';
      } else if (
        (threeValue >= 300 && threeValue <= 305) ||
        fourValue == 3095 ||
        twoValue == 36 ||
        twoValue == 38 ||
        twoValue == 39
      ) {
        //card is diners club or could be diners club
        this.cardType = 'fa-cc-diners-club';
      } else if (
        (fourValue >= 2221 && fourValue <= 2720) ||
        (twoValue >= 51 && twoValue <= 55)
      ) {
        //card is mastercard
        this.cardType = 'mastercard';
      } else if (fourValue >= 3528 && fourValue <= 3589) {
        //card is jcb
        this.cardType = 'jcb';
      } else if (
        fourValue == 6011 ||
        fourValue == 6601 ||
        twoValue == 65 ||
        twoValue == 64 ||
        (sixValue >= 622126 && sixValue <= 622925)
      ) {
        //card is discover
        this.cardType = 'discover';
      } else {
        //unknown card
        this.cardType = '';
      }
    } else {
      //unknown card
      this.cardType = '';
    }
  }

  onCardChange(card: string) {
    if (!card || card == '') {
      this.cardInputError = false;
      return;
    }
    let regex = new RegExp('^[0-9 ]{15,16}$');
    let text = regex.test(card);
    if (!regex.test(card)) {
      this.cardInputError = true;
    } else {
      this.cardInputError = false;
    }
  }

  showAddress(value: number) {
    if (value == 0) {
      this.showCreateAddress = true;
    }
  }

  setAddress($event: number) {
    this.showCreateAddress = false;
    this.creditCardCreate.addressProfileId = $event;
    this.newAddressProfile = $event;
    this.getAddressProfile(this.user.id);
  }

  hideForm($event: boolean) {
    this.showCreateAddress = false;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
