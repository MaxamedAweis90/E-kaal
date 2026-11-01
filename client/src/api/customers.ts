import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Customer, CustomerTransaction } from "../types";

export function useCustomers(params: { search?: string; status?: string; sort?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.status) queryParams.set("status", params.status);
  if (params.sort) queryParams.set("sort", params.sort);

  const qs = queryParams.toString();
  const endpoint = `/customers${qs ? `?${qs}` : ""}`;

  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => apiClient<Customer[]>(endpoint),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () =>
      apiClient<{ customer: Customer; transactions: CustomerTransaction[] }>(`/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; phone: string; creditLimit?: number }) =>
      apiClient<Customer>("/customers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
  });
}

export function useRecordCustomerTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      type,
      amount,
      note,
    }: {
      customerId: string;
      type: "DEBT_ADD" | "DEBT_PAYMENT";
      amount: number;
      note?: string;
    }) =>
      apiClient<{ customer: Customer; transaction: CustomerTransaction }>(
        `/customers/${customerId}/transactions`,
        {
          method: "POST",
          body: JSON.stringify({ type, amount, note }),
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
  });
}
