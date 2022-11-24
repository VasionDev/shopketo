export interface FoodDiscount {
  itemsPerBox: number;
  maxBoxes: number;
  shippingDate: string;
  shippingDateShort: string;
  autoshipShippingDate: string;
  autoshipShippingDateShort: string;
  editDate: string;
  discounts?: { numberOfBox?: number; discountPercent?: number }[];
}
