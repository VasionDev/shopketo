import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { PromoterService } from 'src/app/products/services/promoter.service';
import { CurrencyPipe } from 'src/app/shared/pipes/currency.pipe';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { ProductBuyComponent } from '../../common/product-card/product-buy/product-buy.component';
import { ProductCardComponent } from '../../common/product-card/product-card.component';

import { TagsListComponent } from './tags-list.component';

@Component({})
class TagComponent {}

const routes: Routes = [
  { path: 'tag/:id', component: TagComponent },
  { path: ':id/tag/:id', component: TagComponent },
];

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

fdescribe('TagsListComponent', () => {
  let component: TagsListComponent;
  let fixture: ComponentFixture<TagsListComponent>;
  let location: Location;
  let router: Router;

  let cardComponent: ProductCardComponent;
  let cardFixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      declarations: [
        TagsListComponent,
        ProductCardComponent,
        ProductBuyComponent,
        CurrencyPipe,
      ],
      providers: [
        provideMockStore(),
        ProductsUtilityService,
        PromoterService,
        AppUtilityService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    component.tags = [
      {
        termId: 455,
        name: 'Bundle and Save',
        description: '',
        slug: 'bundle-save',
        parentTermId: 0,
        accessLevels: {
          isEveryone: {
            on: false,
            title: 'Everyone',
          },
          isVisitor: {
            on: false,
            title: 'Visitors',
          },
          isCustomer: {
            on: false,
            title: 'Customers',
          },
          isPromoter: {
            on: false,
            title: 'Promoters',
          },
          isRank6: {
            on: false,
            title: 'Rank 6',
          },
          isRank7: {
            on: false,
            title: 'Rank 7',
          },
          isRank8: {
            on: false,
            title: 'Rank 8',
          },
          isSmartship: {
            on: false,
            title: 'Active SmartShip',
          },
          isLoyalSmartship: {
            on: false,
            title: 'Loyal Active Smartship',
          },
          isVip: {
            on: false,
            title: 'VIP',
          },
          isCustom: {
            on: false,
            title: 'Custom users',
          },
        },
        order: 5,
        backgroundColor: '',
        imageUrl: '',
        isNew: false,
        childs: [],
        products: [
          {
            id: 18571,
            title: 'Good Bundle',
            content: '',
            name: 'good-bundle',
            thumbUrl:
              'https://api.shopketo.com/wp-content/uploads/2022/02/good_bundle_2_28929.png',
            mediumThumbUrl:
              'https://api.shopketo.com/wp-content/uploads/2022/02/good_bundle_2_28929-300x300.png',
            homeThumbUrl:
              'https://api.shopketo.com/wp-content/uploads/2022/02/good_bundle_2_28929-160x160.png',
            homeThumbRetinaUrl:
              'https://api.shopketo.com/wp-content/uploads/2022/02/good_bundle_2_28929-320x320.png',
            variations: [],
            servings: [
              {
                servingTitle: 'Pack',
                servingAttributes: [
                  {
                    key: 'attritem_1_1',
                    name: 'Good Bundle',
                    isOutOfStock: false,
                    isAvailable: true,
                  },
                ],
              },
            ],
            defaultAttribute1: '',
            defaultAttribute2: '',
            availableAttribute1s: ['attritem_1_1'],
            availableAttribute2s: [],
            availableOrderType: ['ordertype_1', 'ordertype_2', 'ordertype_3'],
            sellingClosedText: '',
            finalPrice: 137.00123,
            originalPrice: 179,
            isAllVariationOutOfStock: false,
            categories: [],
            tags: [],
            accessLevels: {
              isEveryone: {
                on: false,
                title: 'Everyone',
              },
              isVisitor: {
                on: false,
                title: 'Visitors',
              },
              isCustomer: {
                on: false,
                title: 'Customers',
              },
              isPromoter: {
                on: false,
                title: 'Promoters',
              },
              isRank6: {
                on: false,
                title: 'Rank 6',
              },
              isRank7: {
                on: false,
                title: 'Rank 7',
              },
              isRank8: {
                on: false,
                title: 'Rank 8',
              },
              isSmartship: {
                on: false,
                title: 'Active SmartShip',
              },
              isLoyalSmartship: {
                on: false,
                title: 'Loyal Active Smartship',
              },
              isVip: {
                on: false,
                title: 'VIP',
              },
              isCustom: {
                on: false,
                title: 'Custom users',
              },
            },
            customGallery: [
              'https://app.pruvithq.com/wp-content/uploads/2021/11/good-bundle-1-2-1024x1024.png',
              'https://app.pruvithq.com/wp-content/uploads/2019/11/10_Day_Challenge_single_box.png',
              'https://app.pruvithq.com/wp-content/uploads/2021/05/Mitoplex_EU_Citrus_sachet_m_x3.png',
            ],
            isSoldOut: false,
            shippingNote: 'Expected to ship within 1-4 days.',
            isForPromoter: false,
            showRelatedProducts: false,
            relatedProducts: [],
            isForLimitedPromoter: false,
            promoterOrder: 0,
            promoterPageImageUrl: '',
            promoterTooltipNote: '',
            isMostPopular: false,
            customUsers: [],
            bannerLinkTitle: '',
            bannerLink: '',
            wistiaVideoLink: 'http://home.wistia.com/medias/cydliwz2wn',
            bannerDiscription:
              'A good way to get started with Prüvit technologies. Enjoy our top 2 products with a variety of flavors.<br><br>\r\nBundle contains:<br>\r\nVariety of 5 flavors of KETO//OS NAT®<br>\r\nTotal of 20 servings (10 Charged, 10 Caffeine Free)<br>\r\nMITO//PLEX™ Citrus Variety Pack (3 flavors x 10 servings each)<br>',
            bannerStartDate: 'October 25, 2021',
            bannerStartTime: '11:45:00',
            bannerEndDate: 'December 4, 2021',
            bannerEndTime: '00:00:00',
            bannerFeatureImage: '',
            bannerBgColor1: '#81d742',
            bannerBgColor2: '#81d742',
            bannerHeadline: 'The Good Way to Start & Save',
            bannerImage: '',
            bannerStartUnixTime: 1635180300,
            bannerEndUnixTime: 1638597600,
          },
        ],
        customUsers: [],
      },
    ];

    cardFixture = TestBed.createComponent(ProductCardComponent);
    cardComponent = cardFixture.componentInstance;

    router.initialNavigation();
  });

  it('should create', () => {
    fixture.detectChanges();
    cardFixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should detect input changes', () => {
    fixture.detectChanges();
    cardFixture.detectChanges();

    const cardDe: HTMLElement = fixture.debugElement.query(
      By.css('.color-black.sk-main__product-title')
    ).nativeElement;

    expect(cardDe.innerText).toContain('Good Bundle');
  });

  it('should test redirection to default path', () => {
    fixture.detectChanges();

    expect(location.path()).toBe('');
  });

  it('should click read post method and navigate to blog details page', fakeAsync(() => {
    fixture.detectChanges();

    component.onClickTag('bundle-save');

    tick();

    expect(location.path()).toContain('/tag/bundle-save');
  }));
});
