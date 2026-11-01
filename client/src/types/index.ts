export type CustomerStatus =
  | "OWING"
  | "CLEARED"
  | "OVER_LIMIT"
  | "ACTIVE"
  | "DELINQUENT"
  | "SETTLED";

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
  type: "DEBT_ADD" | "DEBT_PAYMENT";
  amount: number;
  note: string;
  date: string;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  totalOwed: number;
  status: "ACTIVE" | "SETTLED";
  createdAt: string;
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

export interface ProductMetrics {
  totalProducts: number;
  totalCostValuation: number;
  totalSellingValuation: number;
  potentialProfit: number;
}

export interface ResellerProvider {
  id: "HORMUUD" | "SOMTEL" | "TELESOM";
  name: string;
  commissionRate: number;
  ratePercentage: string;
  services: string[];
}

export interface ResaleTransaction {
  _id: string;
  provider: "HORMUUD" | "SOMTEL" | "TELESOM";
  recipientPhone: string;
  amount: number;
  earningProfit: number;
  netAmount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface DashboardOverview {
  receivables: {
    totalDebt: number;
    totalPaid: number;
    netBalance: number;
    activeCustomerCount: number;
    paidPercentage: number;
    balancePercentage: number;
  };
  payables: {
    totalOwed: number;
    activeVendorCount: number;
  };
  topDebtors: Array<Customer & { shareOfTotal: number }>;
  subscription: {
    tier: string;
    expiresAt: string;
    remainingDays: number;
    isExpired: boolean;
  } | null;
}
