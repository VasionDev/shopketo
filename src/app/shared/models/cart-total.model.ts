export interface CartTotal {
  settings: any;
  initialDiscountText: string;
  bannerText: string;
  progressPercent: number;
  requiredPriceOrItems: number;
  sumPrice: number;
  qualifiedSkus: Array<string>;
  discountedSkus: Array<{ sku: string; percent: number }>;
  isEnabled: boolean;
  isDiscountableInCart?: boolean;
  isDiscountableInCatalog?: boolean;
  isUnlocked: boolean;
  isAlmostUnlocked: boolean;
  unlockedText?: string;
  almostUnlockedText?: string;
  claimText?: string;
  showItem?: boolean;
}
