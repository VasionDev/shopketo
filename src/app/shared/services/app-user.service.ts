import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { setEveryMonth, setOneTime } from 'src/app/sidebar/store/cart.actions';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { VIUser } from '../models';
import { Cart } from '../models/cart.model';
import { ProductAccess } from '../models/product-access.model';
import { AppDataService } from './app-data.service';

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  private user: any;
  private everyMonthCart: Cart[] = [];

  constructor(
    private store: Store<AppState>,
    private oidcSecurityService: OidcSecurityService,
    private dataService: AppDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.store.select('cartList').subscribe((res) => {
      this.everyMonthCart = res.everyMonth;
    });

    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.user = user;
      }
    });
  }

  login(viParams?: string) {
    const langParam = this.activatedRoute.snapshot.queryParamMap.get('lang');

    const routerUrl = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;

    const redirectedUrl = langParam
      ? `${routerUrl}?lang=${langParam}`
      : routerUrl;

    localStorage.setItem('redirectUrl', JSON.stringify(redirectedUrl));

    window.location.href = environment.clientDomain + '/cloud/dashboard/'+(viParams ? viParams : '');
    //this.oidcSecurityService.authorize();
  }

  isAdminUser(roles: string[]): boolean {
    return roles.indexOf('user-admin') !== -1;
  }

  logOut() {
    sessionStorage.removeItem('MVUser');
    sessionStorage.removeItem('mvuser_selected_country');
    sessionStorage.removeItem('ImpersonationUser');

    this.dataService.setUserWithScopes(null);
    this.dataService.setImpersonationStatus(false);

    localStorage.setItem('OneTime', JSON.stringify([]));
    localStorage.setItem('EveryMonth', JSON.stringify([]));

    this.store.dispatch(setOneTime({ oneTimeCart: [] }));
    this.store.dispatch(setEveryMonth({ everyMonthCart: [] }));

    this.oidcSecurityService.logoff();
  }

  checkValidUser() {
    // return this.user !== null && this.user !== undefined;
    return this.user ? true : false;
  }

  validateVIUserSession(): VIUser | null {
    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    if (VIUser !== null) {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - VIUser.createdTime) / 1000;
      if (VIUser.hasOwnProperty('guestPass') && VIUser.guestPass) {
        if (timeDifference >= 24 * 60 * 60) {
          localStorage.removeItem('VIUser');
          return null;
        }
      } else {
        if (VIUser.hasOwnProperty('viProductId')) {
          if (timeDifference >= 1 * 60 * 60) {
            localStorage.removeItem('VIUser');
            this.dataService.setViTimer('');
            return null;
          } else {
            this.dataService.setViTimer(VIUser.expiryTime);
          }
        }
      }
      return VIUser as VIUser;
    }
    return null;
  }

  setVIUser(
    referrer: string,
    promptLogin: string,
    viCode: string,
    guestPass?: boolean,
    viProductId?: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    expiryTime?: string,
    inviteId?: string,
    phone?: string
  ) {
    let expTime;
    if(expiryTime) expTime = new Date(expiryTime).getTime() || expiryTime;

    const VIUser: any = {};
    VIUser.referrer = referrer;
    VIUser.promptLogin = promptLogin;
    VIUser.viCode = viCode;
    VIUser.viProductId = viProductId ? viProductId : '';
    VIUser.inviteId = inviteId ? inviteId : '';
    VIUser.email = email;
    VIUser.phone = phone;
    VIUser.firstName = firstName;
    VIUser.lastName = lastName;
    VIUser.guestPass = guestPass ? guestPass : false;
    VIUser.expiryTime = expTime ? expTime : null;
    VIUser.createdTime = new Date().getTime();

    localStorage.setItem('VIUser', JSON.stringify(VIUser));
  }

  isProductForUSersOnly(productAccess: ProductAccess) {
    const isNoAccessSelected = Object.values(productAccess).every(
      (a: { on: boolean }) => a.on === false
    );
    if (
      productAccess.isEveryone.on ||
      productAccess.isVisitor.on ||
      isNoAccessSelected
    ) {
      return false;
    } else {
      return true;
    }
  }

  checkUserAccess(
    productAccess: ProductAccess,
    customUsers?: number[],
    allowCartForAccess = true
  ): boolean {
    let isAccessible = false;

    const validUserSession = this.checkValidUser();

    const isNoAccessSelected = Object.values(productAccess).every(
      (a: { on: boolean }) => a.on === false
    );

    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    if (
      isNoAccessSelected ||
      productAccess.isEveryone.on ||
      (productAccess.isSmartship.on &&
        allowCartForAccess &&
        (this.everyMonthCart.length > 0 || (VIUser && VIUser.guestPass)))
    ) {
      isAccessible = true;
    } else {
      if (validUserSession) {
        const userAccess: string[] = this.user?.mvuser_scopes
          ? this.user?.mvuser_scopes
          : [];

        if (productAccess.isLoggedUser.on && userAccess.length > 0) {
          isAccessible = true;
        } else {
          userAccess.forEach((u) => {
            if (
              productAccess.isCustomer.on &&
              (u === 'customer' ||
                u === 'promoter' ||
                u === 'rank_6' ||
                u === 'rank_7' ||
                u === 'rank_8' ||
                u === 's_customer')
            ) {
              isAccessible = true;
            }

            if (
              productAccess.isPromoter.on &&
              (u === 'promoter' ||
                u === 'rank_6' ||
                u === 'rank_7' ||
                u === 'rank_8' ||
                u === 's_promoter')
            ) {
              isAccessible = true;
            }

            if (
              productAccess.isRank6.on &&
              (u === 'rank_6' || u === 'rank_7' || u === 'rank_8')
            ) {
              isAccessible = true;
            }

            if (
              productAccess.isRank7.on &&
              (u === 'rank_7' || u === 'rank_8')
            ) {
              isAccessible = true;
            }

            if (productAccess.isRank8.on && u === 'rank_8') {
              isAccessible = true;
            }

            if (
              productAccess.isSmartship.on &&
              (u === 'smartship' || u === 'loyal_smartship' || u === 's_promoter' || u === 's_customer')
            ) {
              isAccessible = true;
            }

            if (
              productAccess.isLoggedSmartship.on &&
              (u === 'smartship' || u === 'loyal_smartship' || (allowCartForAccess && this.everyMonthCart.length > 0))
            ) {
              isAccessible = true;
            }

            if (productAccess.isLoyalSmartship.on && u === 'loyal_smartship') {
              isAccessible = true;
            }

            if (productAccess.isVip.on && u === 'vip') {
              isAccessible = true;
            }

            if (productAccess.isVipPlus.on && u === 'vipPlus') {
              isAccessible = true;
            }

            if (productAccess.isSpromoter.on && u === 's_promoter' ) {
              isAccessible = true;
            }

            if (productAccess.isScustomer.on && u === 's_customer' ) {
              isAccessible = true;
            }

            if (productAccess.isCustom.on && customUsers) {
              const found = customUsers.find(
                (user) => user === this.user?.mvuser_id
              );

              if (found) {
                isAccessible = true;
              }
            }
          });
        }
      } else {
        if (productAccess.isVisitor.on) {
          isAccessible = true;
        }
      }
    }

    return isAccessible;
  }

  checkSmartshipUserAccess(isSmartshipOn: boolean): boolean {
    let isAccessible = false;

    if (this.user !== null) {
      const userAccess: string[] = this.user?.mvuser_scopes
        ? this.user?.mvuser_scopes
        : [];

      userAccess.forEach((u) => {
        if (isSmartshipOn && (u === 'smartship' || u === 'loyal_smartship')) {
          isAccessible = true;
        }
      });
    }

    return isAccessible;
  }

  isUserCanAccess(accessLevels: ProductAccess, customUsers: number[]) {
    return this.checkUserAccess(accessLevels, customUsers);
  }

  isEveryoneCanAccess(accessLevels: ProductAccess) {
    const isNoAccessSelected = Object.values(accessLevels).every(
      (a: { on: boolean }) => a.on === false
    );

    return isNoAccessSelected || accessLevels.isEveryone.on;
  }

  accessLevelTitle(accessLevels: ProductAccess) {
    return Object.values(accessLevels)
      .filter((a: { on: boolean; title: string }) => a.on)
      .map((a) => a.title)
      .join(', ');
  }
}
