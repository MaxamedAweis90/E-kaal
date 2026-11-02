export type CustomerStatus = "OWING" | "CLEARED" | "OVER_LIMIT";

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  totalDebt: number;
  paid: number;
  balance: number;
  creditLimit: number;
  status: CustomerStatus;
  isOverLimit?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTransaction {
  _id: string;
  type: string;
  amount: number;
  note?: string;
  date?: string;
  createdAt?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  totalOwed: number;
  status: "ACTIVE" | "SETTLED";
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  barcode?: string;
  stockCount: number;
  unitCost: number;
  sellingPrice: number;
  margin: number;
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  metrics: {
    totalProducts: number;
    totalCostValuation: number;
    totalSellingValuation: number;
    potentialProfit: number;
  };
}

export type ProviderId = "HORMUUD" | "SOMTEL" | "TELESOM";

export interface ResellerProvider {
  id: ProviderId;
  name: string;
  commissionRate: number;
  ratePercentage: string;
  services: string[];
}

export interface ResaleTransaction {
  _id: string;
  provider: ProviderId;
  recipientPhone: string;
  amount: number;
  earningProfit: number;
  netAmount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface MerchantProfile {
  _id: string;
  shopName: string;
  phone: string;
  email: string;
}
