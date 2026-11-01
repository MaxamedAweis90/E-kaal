import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { ResellerProvider, ResaleTransaction } from "../types";

export function useResellerProviders() {
  return useQuery({
    queryKey: ["reseller-providers"],
    queryFn: () => apiClient<ResellerProvider[]>("/reseller/providers"),
  });
}

export function useResellerHistory() {
  return useQuery({
    queryKey: ["reseller-history"],
    queryFn: () => apiClient<ResaleTransaction[]>("/reseller/history"),
  });
}

export function useResellerTransact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      provider: "HORMUUD" | "SOMTEL" | "TELESOM";
      recipientPhone: string;
      amount: number;
      earningProfit?: number;
    }) =>
      apiClient<ResaleTransaction>("/reseller/transact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reseller-history"] });
    },
  });
}
