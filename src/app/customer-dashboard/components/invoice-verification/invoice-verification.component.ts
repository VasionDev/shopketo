import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'invoice-verification',
  templateUrl: './invoice-verification.component.html',
  styleUrls: ['./invoice-verification.component.css']
})
export class InvoiceVerificationComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public number1: string = '';
  public number2: string = '';
  public number3: string = '';
  public number4: string = '';
  public number5: string = '';
  public number6: string = '';
  public loading: boolean = false;
  public verifyPhoneError: boolean = false;
  public genericError: boolean = false;
  public changesSaved: boolean = false;
  public hideInvoice: boolean = false;
  public tenant!: string;
  @Input('invoiceInformation')
  public invoiceInformation: any;
  @Input('user')
  public user: any;
  constructor(private newgenSvc: NewgenApiService) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
  }
  phoneCodeSend() {
    this.loading = true;
    this.newgenSvc.invoiceGetCode(this.invoiceInformation.collection[0].id).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      $("#confirmInvoicehoneNumberModal").modal('show')
      this.loading = false;
    })
  }
  confirmPhoneCode() {
    this.genericError = false;
    this.verifyPhoneError = false;
    this.loading = true;
    let code = this.number1 + this.number2 + this.number3 + this.number4 + this.number5 + this.number6
    if (code.length < 6) {
      this.loading = false;
      return;
    }
    this.newgenSvc.invoiceCodeVerify(this.invoiceInformation.collection[0].id, code).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (!x.isSuccess) {
        this.verifyPhoneError = true;
      } else {
        $("#confirmInvoicehoneNumberModal").modal('hide')
        this.changesSaved = true;
        this.hideInvoice = true;
      }

      this.loading = false;

      setTimeout(() => {
        this.changesSaved = false;
      }, 2000);
    },
      err => {
        this.genericError = true;
        this.loading = false;
      })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
