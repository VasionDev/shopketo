export interface FoodVariation {
  sku: string;
  price: number;
  quantity: number;
  isOutOfStock?: boolean;
  show?: boolean;
}
