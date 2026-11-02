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
  createdAt: string;
  updatedAt: string;
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

export interface ResellerProvider {
  id: "HORMUUD" | "SOMTEL" | "TELESOM";
  name: string;
  commissionRate: number;
  ratePercentage: string;
  services: string[];
}
