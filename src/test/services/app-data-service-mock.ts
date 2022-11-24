import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Blog } from 'src/app/blogs/models/blog.model';

@Injectable()
export class AppDataServiceStub {
  setBlogsData(blogs: Blog[]) {}

  changeSelectedCountry() {
    return of();
  }

  setIsSubdomainStatus() {
    return of();
  }

  setCountries(data: any) {}

  changeCartStatus(data: boolean) {}

  changeSelectedLanguage(data: any) {}

  setProductsData(data: any) {}

  currentSelectedLanguage$ = of('');
  currentSelectedCountry$ = of('US');
  currentModalName$ = of('');
  currentCookieDialogStatus$ = of(false);
  currentRedirectURL$ = of('');
  currentBodyHasClass$ = of(false);
  currentRedictedCountry$ = of('');
  currentOfferFlowStatus$ = of(false);
  currentBlogsData$ = of([]);
  currentSidebarName$ = of('');
  currentCartStatus$ = of(false);
}
