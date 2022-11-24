import { of } from 'rxjs';
import { DiscountBanner } from 'src/app/shared/models/discount-banner.model';

export function mockBanners(): DiscountBanner[] {
  return [
    {
      bannerText:
        '<b>Flavor Drop! - KETO//OS NAT Prickly Pear - Buy 2 or more Boxes get 22% off / Buy 3 Boxes get 30% off',
      backgroundColor: '#f73838',
      textColor: '#ffffff',
      countDown$: of(),
      accessLevels: {
        isEveryone: {
          on: true,
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
      customUsers: [],
    },
  ];
}
