export interface FoodDelivery {
  totalItems: number;
  totalPrice: number;
  appliedDiscount: number;
  shippingDateShort?: string;
  autoshipShippingDateShort?: string;
  editDate?: string;
  itemsPerBox: number;
  maxBoxes: number;
}
