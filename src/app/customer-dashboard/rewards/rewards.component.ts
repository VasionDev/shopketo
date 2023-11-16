import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment-timezone';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { BonusService } from 'src/app/shared/services/bonus.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css'],
})
export class RewardsComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  tenant: string = '';
  user: any = null;
  userURL: string = '';
  isPromoter: boolean = false;
  selectedLanguage: string = '';
  userProgress: {
    currentStatus: string;
    vipProgress: { orderId: string; timestamp: string }[];
  };
  loader: boolean = false;
  modalHeaderHeight: any;
  scrHeight: number = 2000;
  scrWidth: number = 2000;
  isMobileView: boolean = false;
  walletAmount: number = 0;
  walletPoint: number = 0;
  expireWallet: any[] = [];
  currencyCode: string = 'USD';
  currencySymbol: string = '$';
  exchangeRate: number = 1;
  @Input() isDashboard: boolean = false;
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

  @ViewChild('vipPruverModalHeader') vipPruverHeader!: ElementRef;

  constructor(
    private dataService: AppDataService,
    private bonusService: BonusService,
    private newgenSvc: NewgenApiService
  ) {
    this.userURL = environment.userURL;
    this.userProgress = {
      currentStatus: '',
      vipProgress: [],
    };
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    if(this.scrWidth <= 767) {
      this.isMobileView = true;
    }else {
      this.isMobileView = false;
    }
  }

  ngOnInit(): void {
    this.tenant = environment.tenant;
    this.getUser();
    this.getSelectedLanguage();
    // this.getVipProgress();
    this.getUserScopes();
    this.getProducts();
  }

  getUserScopes() {
    this.dataService.currentUserWithScopes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        if (user !== null) {
          if (user.mvuser_scopes.length) {
            if (user.mvuser_scopes.includes('promoter')) this.isPromoter = true;
          }
        }
      });
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language: string) => {
        this.selectedLanguage = language;
      });
  }

  getUser() {
    this.dataService.currentUserWithScopes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        if (user !== null) {
          this.user = user;
          this.getVipProgress();
          this.getWallet();
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

  getWallet() {
    this.loader = true;
    this.newgenSvc
      .getWalletStatus()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (x) => {
          let walletCollection = x.collection || [];
          for (let i = 0; i < walletCollection.length; i++) {
            var wallet = walletCollection[i];
            if (
              wallet.isPoint === true &&
              (wallet.amount > 0 && wallet.currencyCode === 'P')
            ) {
              this.getExpireWallet(wallet.walletId);
              this.walletAmount = wallet.amount;
              this.walletPoint = (wallet.amount * this.exchangeRate)/10;
              this.loader = false;
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
              if(30 >= Math.floor(days)) this.expireWallet.push(obj);
            }
          }
        },
        (err) => {}
      );
  }

  onClickShopnow() {
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: { key: 'bundleBuilder', value: {autoshipOrder: null, onetimeOrder: true, modalTitle: 'New order', modalDescription: 'VIP Points will be calculated and applied at checkout.'} },
    });
    $('#bundleBuilderModal').modal('show');
    return false;
  }

  getVipProgress() {
    if (this.user) {
      this.loader = true;
      this.bonusService
        .getUserVipProgress(this.user.mvuser_id, this.selectedLanguage)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (res: any) => {
            if (res.hasOwnProperty('isSuccess') && res.isSuccess) {
              this.userProgress = res.result;
              this.loader = false;
            }
          },
          (err) => {}
        );
    }
  }

  updateProducts(order: any) {
    $('#smartShipModal').modal('hide');
    this.dataService.changePostName({
      postName: 'bundle-builder-modal',
      payload: {
        key: 'bundleBuilder',
        value: { autoshipOrder: order, modalTitle: 'Setup Smartship' },
      },
    });
    $('#bundleBuilderModal').modal('show');
  }

  getRange() {
    const fakeArray = new Array(3);
    return fakeArray;
  }

  getDateWithFormat(date: string) {
    const modifiedString = new Date(date).toLocaleString('en-us', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    return modifiedString;
  }

  getNextShipmentDate(date: string) {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-us', { month: 'short' });
    return `${month} ${day}${this.daySuffix(day)}`;
  }

  daySuffix(number: number) {
    if (number > 3 && number < 21) return 'th';
    switch (number % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  onVipLoyaltyModalOpen() {
    this.getModalHeaderHeight(this.vipPruverHeader);
    $('#vipLoyaltyModal').modal('show');
  }

  private getModalHeaderHeight(modalHeader: ElementRef) {
    let offsetHeight = 0;
    const refreshInterval = setInterval(() => {
      if (offsetHeight === 0) {
        offsetHeight = modalHeader.nativeElement.offsetHeight;
      } else {
        this.modalHeaderHeight = offsetHeight + 20;
        clearInterval(refreshInterval);
      }
    }, 10);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
