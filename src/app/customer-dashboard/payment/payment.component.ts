import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public paymentCreate: boolean = false;
  public user: any;
  public paymentMethods: Array<any> = [];
  public loader: boolean = false;
  public title: string = 'Payment methods';
  public error: string = '';
  public isEdit: boolean = false;
  public editPayment: any;
  public cancelConfirm: EventEmitter<boolean> = new EventEmitter();
  constructor(
    private newgenService: NewgenApiService,
    private userEmitterService: UserEmitterService
  ) {}

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
      if (this.user) {
        this.getPaymentProfile(this.user.id);
      }
    });
  }

  getPaymentProfile(userId: string) {
    this.paymentMethods = [];
    this.loader = true;
    this.newgenService
      .getPaymentProfile({
        expandAddress: true,
        expandContact: true,
        expandPayment: true,
        userId: userId,
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        this.loader = false;
        this.paymentMethods = x.collection;
      });
  }

  deletePaymentProfile(profileId: number) {
    this.error = '';
    this.newgenService
      .deletePaymentProfile(profileId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x) => {
        if (!x.isSuccess) {
          this.error = x.responseStatus.errors[0].message;
          return;
        }
        this.getPaymentProfile(this.user.id);
      });
  }

  showCreatePayment() {
    this.error = '';
    this.isEdit = false;
    this.cancelConfirm.emit(false);
  }

  showEditPayment(payment: any) {
    this.error = '';
    this.isEdit = true;
    this.editPayment = payment;
    this.cancelConfirm.emit(false);
  }

  hideCreate($event: boolean) {
    this.error = '';
    if ($event) this.paymentCreate = false;
    this.title = 'Payment methods';
    this.getPaymentProfile(this.user.id);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
