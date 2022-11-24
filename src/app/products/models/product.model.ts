import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { ProductServing } from './product-serving.model';
import { ProductTagOrCategory } from './product-tag-or-category.model';
import {
  ProductVariation,
  ProductVariationBase,
} from './product-variation.model';

export interface Product {
  id: number;
  title: string;
  content: string;
  name: string;
  flavor: string;
  thumbUrl: string;
  customGallery: string[];
  mediumThumbUrl: string;
  homeThumbUrl: string;
  homeThumbRetinaUrl: string;
  categories: ProductTagOrCategory[];
  tags: ProductTagOrCategory[];
  isForPromoter: boolean;
  isForLimitedPromoter: boolean;
  promoterOrder: number;
  promoterPageImageUrl: string;
  promoterTooltipNote: string;
  promoterTitle: string;
  promoterSubtitle: string;
  promoterGradientColor1: string;
  promoterGradientColor2: string;
  isMostPopular: boolean;
  learnPageTitle: string;
  learnPageSubTitle: string;
  productOrder: number;
  originalPrice: number;
  finalPrice: number;

  bannerStartTime: string;
  bannerStartDate: string;
  bannerEndTime: string;
  bannerEndDate: string;
  bannerImage: string;
  bannerFeatureImage: string;
  bannerBgColor1: string;
  bannerBgColor2: string;
  bannerHeadline: string;
  bannerLinkTitle: string;
  bannerLink: string;
  bannerDiscription: string;
  bannerStartUnixTime: number;
  bannerEndUnixTime: number;

  variations: ProductVariation[];
  servings: ProductServing[];
  defaultAttribute1: string;
  defaultAttribute2: string;
  availableAttribute1s: string[];
  availableAttribute2s: string[];
  availableOrderType: ProductVariationBase['orderType'][];

  wistiaVideoLink: string;
  isSoldOut: boolean;
  isAllVariationOutOfStock: boolean;
  sellingClosedText: string;
  shippingNote: string;
  showRelatedProducts: boolean;
  relatedProducts: Product[];
  accessLevels: ProductAccess;
  customUsers: number[];
}
