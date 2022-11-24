import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
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
  discountHeight$ = this.dataService.currentDiscountHeight$;
  user: any;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: AppSeoService,
    private userService: AppUserService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.returningUrl = environment.returningDomain;
    this.clientId = environment.clientID;
    this.clientDomain = environment.clientDomain;

    this.getProducts();
  }

  ngOnInit(): void {
    this.getUser();
    this.getSelectedCountry();
  }

  getUser() {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      this.user = user;

      this.getProduct();
    });
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getProducts() {
    this.subscriptions.push(
      this.dataService.currentProductsData$.subscribe((data) => {
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
    );
  }

  getProduct() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
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

        this.setRedirectURL();
        this.setSeo();
      })
    );
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

      this.subscriptions.push(
        this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
          if (!status) {
            this.seoService.updateRobots('noindex,follow');
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
