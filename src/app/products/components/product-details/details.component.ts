import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-detail',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  selectedLanguage = '';
  selectedCountry = '';
  products: Product[] = [];
  product = {} as Product;
  refCode = '';
  defaultLanguage = '';
  clientId = '';
  returningUrl = '';
  clientDomain = '';
  isUserCanAccess = true;
  isRedirectionStarted = false;
  isLoggedIn = false;
  accessLevelTitle = '';
  discountHeight = 0;
  discountHeight1$ = this.dataService.currentDiscountHeight$;
  user: any;
  tenant = '';

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: AppSeoService,
    private userService: AppUserService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.tenant = environment.tenant;
    this.returningUrl = environment.returningDomain;
    this.clientId = environment.clientID;
    this.clientDomain = environment.clientDomain;

    this.getProducts();
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getUser();
    this.getSelectedCountry();
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.pipe(takeUntil(this.destroyed$)).subscribe((height: number) => {
      this.discountHeight = height;
      this.changeDetectionRef.detectChanges();
    });
  }

  getUser() {
    this.dataService.currentUserWithScopes$.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
      this.user = user;
      this.getProduct();
    });
  }

  getSelectedCountry() {
    this.dataService.currentSelectedCountry$.pipe(takeUntil(this.destroyed$)).subscribe((country: string) => {
      this.selectedCountry = country;
      this.setRedirectURL();
    })
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getProducts() {
    this.dataService.currentProductsData$.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      if (
        data &&
        Object.keys(data).length === 0 &&
        data.constructor === Object
      ) {
        return;
      }

      this.products = data.products;
      this.getProduct();
    })
  }

  getProduct() {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.product = {} as Product;

      this.products.forEach((product) => {
        if (product.name === params['id']) {
          this.product = product;
          this.accessLevelTitle = Object.values(this.product.accessLevels)
            .filter((a: { on: boolean; title: string }) => a.on)
            .map((a) => a.title)
            .join(', ');

          window.scroll(0, 0);

          this.checkUserAccess();

          this.changeDetectionRef.markForCheck();
        }
      });
      if(!Object.keys(this.product).length) {
        this.utilityService.navigateToRoute('/');
      }

      this.setRedirectURL();
      this.setSeo();
    })
  }

  checkUserAccess() {
    const LocalVIUser = localStorage.getItem('VIUser');
    const VIUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    if (VIUser !== null) {
      this.isUserCanAccess = true;
    } else {
      this.isUserCanAccess = this.userService.checkUserAccess(
        this.product.accessLevels,
        this.product.customUsers
      );

      if (!this.user) {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = true;
      }
    }
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    if (
      this.product &&
      Object.keys(this.product).length === 0 &&
      this.product.constructor === Object
    ) {
      this.seoService.updateTitle('Page not found');

      this.dataService.currentIsSubdomain$.pipe(takeUntil(this.destroyed$)).subscribe((status: boolean) => {
        if (!status) {
          this.seoService.updateRobots('noindex,follow');
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
