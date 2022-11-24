export function getMaxRegularDiscount(
  discountPrice: number,
  smartshipDiscountPrice: number
): number {
  if (discountPrice > 0) {
    if (smartshipDiscountPrice > 0) {
      return Math.min(discountPrice, smartshipDiscountPrice);
    } else {
      return discountPrice;
    }
  } else {
    if (smartshipDiscountPrice > 0) {
      return smartshipDiscountPrice;
    } else {
      return 0;
    }
  }
}
