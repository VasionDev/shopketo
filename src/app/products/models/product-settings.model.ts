export interface ProductSettings {
  defaultLanguage: string;
  isPromoterEnabled: boolean;
  smartshipDiscountOnTodays: boolean;
  isDefaultShippingNoteEnabled: boolean;
  defaultShippingNote: string;
  isMoneyBackGuaranteeNoteEnabled: boolean;
  moneyBackGuaranteeNote: string;
  exchangeRate: number;
  taxRate: number;
  currencySymbol: string;
  privacyUrl: string;
  promoterSku: string;
  promoterPrice: number;
  checkoutFullPath: string;
}
