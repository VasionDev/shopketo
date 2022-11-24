export interface BillingAddress {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  country: string;
  postalCode: string;
  region: string;
  attentionOf?: string;
  phoneCountry?: string;
  phoneNumber?: string;
  save?: boolean;
  updateAutoshipIds?: Array<any>
}
