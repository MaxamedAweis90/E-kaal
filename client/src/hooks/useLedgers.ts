import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "../services/http";
import type {
  Customer,
  CustomerTransaction,
  MerchantProfile,
  Product,
  ProductsResponse,
  ResaleTransaction,
  ResellerProvider,
  Vendor,
  ProviderId,
} from "../types";

/* ---------- Customers (Deymaha) ---------- */
export const useCustomers = () =>
  useQuery({ queryKey: ["customers"], queryFn: () => apiGet<Customer[]>("/customers") });

export const useCustomerDetail = (id: string | null) =>
  useQuery({
    queryKey: ["customers", id],
    enabled: !!id,
    queryFn: () =>
      apiGet<{ customer: Customer; transactions: CustomerTransaction[] }>(`/customers/${id}`),
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; phone: string; creditLimit: number }) =>
      apiSend<Customer>("post", "/customers", body),
    onSuccess: () => qc.invalidateQueries(),
  });
};

export const useCustomerTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string;
      type: "DEBT_ADD" | "DEBT_PAYMENT";
      amount: number;
      note?: string;
    }) =>
      apiSend("post", `/customers/${v.id}/transactions`, {
        type: v.type,
        amount: v.amount,
        note: v.note ?? "",
      }),
    onSuccess: () => qc.invalidateQueries(),
  });
};

/* ---------- Vendors ---------- */
export const useVendors = () =>
  useQuery({ queryKey: ["vendors"], queryFn: () => apiGet<Vendor[]>("/vendors") });

export const useCreateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; phone: string; totalOwed: number }) =>
      apiSend<Vendor>("post", "/vendors", body),
    onSuccess: () => qc.invalidateQueries(),
  });
};

export const usePayVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; amount: number; note?: string }) =>
      apiSend("post", `/vendors/${v.id}/pay`, { amount: v.amount, note: v.note ?? "" }),
    onSuccess: () => qc.invalidateQueries(),
  });
};

/* ---------- Products ---------- */
export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: () => apiGet<ProductsResponse>("/products") });

export interface ProductInput {
  name: string;
  barcode?: string;
  stockCount: number;
  unitCost: number;
  sellingPrice: number;
}

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductInput) => apiSend<Product>("post", "/products", body),
    onSuccess: () => qc.invalidateQueries(),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: Partial<ProductInput> }) =>
      apiSend<Product>("put", `/products/${v.id}`, v.body),
    onSuccess: () => qc.invalidateQueries(),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend("delete", `/products/${id}`),
    onSuccess: () => qc.invalidateQueries(),
  });
};

/* ---------- Reseller ---------- */
export const useProviders = () =>
  useQuery({
    queryKey: ["reseller", "providers"],
    queryFn: () => apiGet<ResellerProvider[]>("/reseller/providers"),
    staleTime: Infinity,
  });

export const useResellerHistory = () =>
  useQuery({
    queryKey: ["reseller", "history"],
    queryFn: () => apiGet<ResaleTransaction[]>("/reseller/history"),
  });

export const useResellerTransact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { provider: ProviderId; recipientPhone: string; amount: number }) =>
      apiSend<ResaleTransaction>("post", "/reseller/transact", body),
    onSuccess: () => qc.invalidateQueries(),
  });
};

/* ---------- Broadcast ---------- */
export const useSendBroadcast = () =>
  useMutation({
    mutationFn: (body: { message: string; recipientIds: string[] }) =>
      apiSend("post", "/broadcasts/send", body),
  });

/* ---------- Merchant ---------- */
export const useMerchantProfile = () =>
  useQuery({
    queryKey: ["merchant", "profile"],
    queryFn: () => apiGet<MerchantProfile>("/merchants/profile"),
    staleTime: 1000 * 60 * 10,
  });

