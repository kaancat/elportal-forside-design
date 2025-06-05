
export interface ElectricityProduct {
  id: string;
  supplierName: string;
  productName: string;
  isVindstoedProduct: boolean;
  displayPrice_kWh: number;
  displayMonthlyFee: number;
  signupLink: string;
  supplierLogoURL: string;
  isVariablePrice: boolean;
  hasNoBinding: boolean;
  hasFreeSignup: boolean;
  internalNotes: string;
  lastUpdated: string;
  sortOrderVindstoed?: number;
  sortOrderCompetitor?: number;
}

export interface ProductsResponse {
  products: ElectricityProduct[];
  lastUpdated: string;
}
