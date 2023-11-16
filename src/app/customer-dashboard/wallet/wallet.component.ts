import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { ReplaySubject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { environment } from 'src/environments/environment';
declare var $: any;
declare var tooltipJS: any;


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant: string = '';
  user: any = null;
  userURL: string = '';
  isMobile: boolean = false;
  loader: boolean = false;
  walletPoint: number = 0;
  pointWalletAmount: number = 0;
  cashWalletAmount: number = 0;
  expiringPoints: any[] = [];
  pendingPointTransactions: any[] = [];
  pendingCashTransactions: any[] = [];
  completeTransactions: any[] = [];
  completeCashTransactions: any[] = [];
  skipRecords: number = 0;
  skipRecordsPending: number = 0;
  skipRecordsForCW: number = 0;
  skipRecordsForPendingCW: number = 0;
  totalRecords: number = 0;
  totalRecordsPending: number = 0;
  totalCashRecords: number = 0;
  totalPendingCashRecords: number = 0;
  pointWalletId: string = '';
  cashWalletId: string = '';
  weeklyCoupon: any = {};
  pendingCoupons: any[] = [];
  couponAmount: number = 0.00;
  loadingTransaction: boolean = false;
  isCouponLoaded: boolean = false;
  createCouponLoader: boolean = false;
  recycleCouponLoader: boolean = false;
  couponDownloader: boolean = false;
  isPointWallet: boolean = true;
  showLegalInfo: boolean = false;
  currencyCode: string = 'USD';
  cashCurrencyCode: string = 'USD';
  currencySymbol: string = '$';
  exchangeRate: number = 1;
  currencySymbols = [
    {
      "currency": "USD",
      "symbol" : "$"
    },
    {
      "currency": "EUR",
      "symbol" : "€",
    },
    {
      "currency": "GBP",
      "symbol" : "£"
    },
    {
      "currency": "CAD",
      "symbol" : "CAD$"
    },
    {
      "currency": "MXN",
      "symbol" : "MXN$"
    },
    {
      "currency": "TWD",
      "symbol" : "NT$"
    },
    {
      "currency": "CHF",
      "symbol" : "₣"
    }
  ];

  constructor( 
    private dataService: AppDataService,
    private newgenSvc: NewgenApiService,
    private userService: AppUserService
  ) {
    this.tenant = environment.tenant;
    this.userURL = environment.userURL;
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        navigator.userAgent
      );
  }

  ngOnInit(): void {
    this.getUser();
    this.getProducts();
  }

  getUser() {
    this.dataService.currentUserWithScopes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        if (user !== null) { 
          this.user = user;
          this.loader = true;
          this.getWallets();
        }
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
    
        const productsSettings = data.productsData.product_settings;
        this.exchangeRate = productsSettings.exchange_rate !== '' ? productsSettings.exchange_rate : 1;
        this.currencySymbol = productsSettings.currency_symbol !== '' ? productsSettings.currency_symbol : '$';
        const currencyCode = this.currencySymbols.find((item: any) => item.symbol === this.currencySymbol );
        if(currencyCode) this.currencyCode = currencyCode.currency;
      });
  }

 

  getWallets() {
    this.newgenSvc
      .getWalletStatus(true)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          this.showLegalInfo = x?.application ? true : false;
          let walletCollection = x.collection || [];
          for (let i = 0; i < walletCollection.length; i++) {
            let wallet = walletCollection[i];
            if (wallet.isPoint === true && wallet.currencyCode === 'P') {
              this.pointWalletId = wallet.walletId;
              this.pointWalletAmount = wallet.amount;
              this.walletPoint = (wallet.amount * this.exchangeRate)/10;
              this.getExpireWallet(wallet.walletId);
              this.getWalletTransactions(wallet.walletId);
              this.getWalletPendingTransactions(wallet.walletId);
            } else if (wallet.isPoint === false) {
              this.cashWalletId = wallet.walletId;
              this.cashWalletAmount = wallet.amount;
              this.cashCurrencyCode = wallet.currencyCode;
              const currency = this.currencySymbols.find((item: any) => item.currency === wallet.currencyCode );
              if(currency) this.currencySymbol = currency.symbol;
              this.getCashWalletTransactions(wallet.walletId);
              this.getCashWalletPendingTransactions(wallet.walletId);
            }
          }
          //this.loader = false;
        },
        (err) => {
          this.loader = false;
        },
        () => {
          this.loader = false;
        }
      );
  }

  getPointsWallet() {
    this.newgenSvc
      .getWalletStatus()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          let walletCollection = x.collection || [];
          for (let i = 0; i < walletCollection.length; i++) {
            let wallet = walletCollection[i];
            if (wallet.isPoint === true && wallet.currencyCode === 'P') {
              this.pointWalletId = wallet.walletId;
              this.pointWalletAmount = wallet.amount;
              this.walletPoint = (wallet.amount * this.exchangeRate)/10;
              this.getExpireWallet(wallet.walletId);
              this.getWalletTransactions(wallet.walletId);
              this.getWalletPendingTransactions(wallet.walletId);
              return;
            } 
          }
        },
        (err) => {}
      );
  }

  getExpireWallet(walltetId: string) {
    this.newgenSvc
      .getExpireWallet(walltetId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if(x.isSuccess) {
            let walletCollection = x.collection || [];
            for (let i = 0; i < walletCollection.length; i++) {
              const wallet = walletCollection[i];
              const obj = {
                point: wallet.amountRemainingCurrency + wallet.amountRemaining,
                expireTime: moment.tz(wallet.dateExpire, "America/Chicago").format('LTS'),
                expireDate: moment.tz(wallet.dateExpire, "America/Chicago").format('MMM D'),
              }
              const days = ((moment(wallet.dateExpire).valueOf() - moment().valueOf())/1000)/86400;
              if(30 >= Math.floor(days)) this.expiringPoints.push(obj);
            }
          }
        },
        (err) => {}
      );
  }

  getWalletTransactions(walltetId: string) {
    this.newgenSvc
      .getWalletTransactions(walltetId, 20, this.skipRecords)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if(x.isSuccess) {
            this.loadingTransaction = false;
            let walletCollection = x.collection || [];
            this.totalRecords = x.count;
            
            for (let i = 0; i < walletCollection.length; i++) {
              const wallet = walletCollection[i];
              const obj = {
                amount: wallet.amount,
                title: wallet.description,
                date: moment.tz(wallet.date, "America/Chicago").format('MMMM D, YYYY LTS'),
              }
              this.completeTransactions.push(obj);
            }
          }
        },
        (err) => {}
      );
  }

  getWalletPendingTransactions(walltetId: string) {
    this.newgenSvc
      .getWalletPendingTransactions(walltetId, 10, this.skipRecordsPending)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if(x.isSuccess) {
            this.loadingTransaction = false;
            let walletCollection = x.collection || [];
            this.totalRecordsPending = x.count;
            for (let i = 0; i < walletCollection.length; i++) {
              const wallet = walletCollection[i];
              const obj = {
                amount: wallet.amount,
                title: wallet.description,
                date: moment.tz(wallet.date, "America/Chicago").format('MMMM D, YYYY LTS'),
              }
              this.pendingPointTransactions.push(obj);
              
            }
          }
        },
        (err) => {}
      );
  }

  getCashWalletTransactions(walltetId: string) {
    this.newgenSvc
      .getWalletTransactions(walltetId, 20, this.skipRecordsForCW)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if(x.isSuccess) {
            this.loadingTransaction = false;
            let walletCollection = x.collection || [];
            this.totalCashRecords = x.count;
            
            for (let i = 0; i < walletCollection.length; i++) {
              const wallet = walletCollection[i];
              const obj = {
                amount: wallet.amount,
                details: wallet?.runId ? `${environment.userURL}#/commission/detail?runid=${wallet.runId}` : '',
                currency: wallet.currencyCode === 'USD' ? 'US $' : this.currencySymbol,
                title: wallet.description,
                date: moment.tz(wallet.date, "America/Chicago").format('MMMM D, YYYY LTS'),
              }
              this.completeCashTransactions.push(obj);
            }
          }
          this.loader = false;
        },
        (err) => {
          this.loader = false;
        }
      );
  }

  getCashWalletPendingTransactions(walltetId: string) {
    this.newgenSvc
      .getWalletPendingTransactions(walltetId, 10, this.skipRecordsForPendingCW)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if(x.isSuccess) {
            this.loadingTransaction = false;
            let walletCollection = x.collection || [];
            this.totalPendingCashRecords = x.count;
            
            for (let i = 0; i < walletCollection.length; i++) {
              const wallet = walletCollection[i];
              const obj = {
                amount: wallet.amount,
                currency: wallet.currencyCode === 'USD' ? 'US $' : this.currencySymbol,
                title: wallet.description,
                date: moment.tz(wallet.date, "America/Chicago").format('MMMM D, YYYY LTS'),
              }
              this.pendingCashTransactions.push(obj);
            }
          }
          this.loader = false;
        },
        (err) => {
          this.loader = false;
        }
      );
  }

  onLoadMoreTransaction() {
    this.skipRecords += 20;
    this.loadingTransaction = true;
    this.getWalletTransactions(this.pointWalletId);
  }

  onLoadMorePendingTransaction() {
    this.skipRecordsPending += 10;
    this.loadingTransaction = true;
    this.getWalletPendingTransactions(this.pointWalletId);
  }

  onLoadMoreCashTransaction() {
    this.skipRecordsForCW += 20;
    this.loadingTransaction = true;
    this.getCashWalletTransactions(this.cashWalletId);
  }

  onLoadMorePendingCWTransaction() {
    this.skipRecordsForPendingCW += 10;
    this.loadingTransaction = true;
    this.getCashWalletPendingTransactions(this.cashWalletId);
  }

  getWalletCouponStatus() {
    this.isCouponLoaded = false;
    this.couponAmount = 0.00;
    this.newgenSvc.getWalletCouponStatus(this.pointWalletId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          if(x.isSuccess) {
            this.weeklyCoupon = x;
          }
          this.newgenSvc.getWalletCoupons().subscribe(
            (x) => {
              if(x.isSuccess) {
                this.pendingCoupons = x.collection;
              }
              this.isCouponLoaded = true;
              this.loadTooltip();
            }
          )
        },
        (err) => {
          this.isCouponLoaded = true;
        }
      )
  }

  onChangeCouponAmount(e: any) {
    this.couponAmount = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0.00;
  }

  onCreateCoupon() {
    this.createCouponLoader = true;
    this.newgenSvc.createCoupon(this.couponAmount).subscribe(
      (x) => {
        if(x.isSuccess) {
          this.getWalletCouponStatus();
          this.pendingPointTransactions = [];
          this.getPointsWallet();
          this.createCouponLoader = false;
        }
     },
     (err) => {
      console.log(err);
      this.createCouponLoader = false;
    });
  }

  onRecycleCoupon(coupon: string, e: any) {
    if(this.recycleCouponLoader) return;
    this.recycleCouponLoader = true;
    $(e.target).find('i').removeClass('hide');
    this.newgenSvc.deleteCoupon(coupon).subscribe(
      (x) => {
        if(x.isSuccess) {
          this.getWalletCouponStatus();
          this.pendingPointTransactions = [];
          this.getPointsWallet();
          this.recycleCouponLoader = false;
          $(e.target).find('i').addClass('hide');
        }
     },
     (err) => {
      console.log(err);
      this.recycleCouponLoader = false;
    });
  }

  downloadPdf(coupon: string, e: any) {

    if(this.couponDownloader) return;
    this.couponDownloader = true;
    let obj = '';
    if($(e.target).attr('type') === 'button') obj = e.target;
    else obj = e.target.parentNode;
    
    $(obj).find('i.fa-print').addClass('hide');
    $(obj).find('i.fa-spin').removeClass('hide');
  
    this.newgenSvc.downloadCoupon(coupon)
    .pipe(
      switchMap((x) => {
        return this.newgenSvc.getPDFCoupon(x.tempId);
      }),
      takeUntil(this.destroyed$)
    )
    .subscribe(
      (data) => {
        var contentType = 'application/pdf'; // put your file type here 
        var sliceSize = 512;
        var b64Data = data.replace(/^[^,]+,/, '');
        b64Data = b64Data.replace(/\s/g, '');
        var byteCharacters = window.atob(b64Data);
        var byteArrays = [];
    
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
    
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
    
            var byteArray = new Uint8Array(byteNumbers);
    
            byteArrays.push(byteArray);
        }
    
        const blob = new Blob(byteArrays, {
            type: contentType
        }); 
    
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'Coupon-' + coupon + '.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.couponDownloader = false;
        $(obj).find('i.fa-print').removeClass('hide');
        $(obj).find('i.fa-spin').addClass('hide');
     },
     (err) => {
      console.log(err);
      this.couponDownloader = false;
      $(obj).find('i.fa-print').removeClass('hide');
      $(obj).find('i.fa-spin').addClass('hide');
     });
  }

  copy(event:any) {
    if(this.isMobile && $("div[role='tooltip']").length && $("div[role='tooltip']").hasClass('hide')) {
      $("div[role='tooltip']").removeClass('hide');
    }

    $(event.target).addClass('hide');
    $(event.target).next().removeClass('hide');
    setTimeout(() => {
      $(event.target).removeClass('hide');
      $(event.target).next().addClass('hide');
      if(this.isMobile) $("div[role='tooltip']").addClass('hide');
      this.loadTooltip();
    }, 1500);
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  onLogOut() {
    this.userService.logOut();
  }

  onClickShopnow() {
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: { key: 'bundleBuilder', value: {autoshipOrder: null, onetimeOrder: true, modalTitle: 'New order', modalDescription: 'VIP Points will be calculated and applied at checkout.'} },
    });
    $('#bundleBuilderModal').modal('show');
    return false;
  }

}
