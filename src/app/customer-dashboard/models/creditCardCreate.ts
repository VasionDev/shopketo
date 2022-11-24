export interface CreditCardCreate {
  userId?: number;
  paymentMethodId?: number;
  paymentMethodCountryCode?: string;
  addressProfileId: number;
  cardHolderName: string;
  cardNumber: string;
  expirationDate: string;
  save?: boolean;
  cvv?: string;
}
