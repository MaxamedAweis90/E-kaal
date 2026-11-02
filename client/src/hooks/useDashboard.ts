import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export interface DashboardReceivables {
  totalDebt: number;
  totalPaid: number;
  netBalance: number;
  activeCustomerCount: number;
  paidPercentage: number;
  balancePercentage: number;
}

export interface DashboardPayables {
  totalOwed: number;
  activeVendorCount: number;
}

export interface TopDebtor {
  _id: string;
  name: string;
  phone: string;
  totalDebt: number;
  paid: number;
  balance: number;
  creditLimit: number;
  status: "OWING" | "CLEARED" | "OVER_LIMIT" | string;
  shareOfTotal: number;
}

export interface DashboardSubscription {
  tier: string;
  expiresAt: string;
  remainingDays: number;
  isExpired: boolean;
}

export interface DashboardOverviewData {
  receivables: DashboardReceivables;
  payables: DashboardPayables;
  topDebtors: TopDebtor[];
  subscription: DashboardSubscription | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export const fetchDashboardOverview = async (): Promise<DashboardOverviewData> => {
  const response = await api.get<ApiResponse<DashboardOverviewData>>("/dashboard/overview");
  if (!response.data.success) {
    throw new Error(response.data.error?.message || "Failed to fetch dashboard overview");
  }
  return response.data.data;
};

export function useDashboardOverview() {
  return useQuery<DashboardOverviewData, Error>({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
    refetchInterval: 30000, // Background poll every 30s
    staleTime: 1000 * 60,   // Fresh for 1 minute
  });
}

