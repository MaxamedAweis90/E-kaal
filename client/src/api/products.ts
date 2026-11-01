import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Product, ProductMetrics } from "../types";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient<{ products: Product[]; metrics: ProductMetrics }>("/products"),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      barcode?: string;
      stockCount: number;
      unitCost: number;
      sellingPrice: number;
    }) =>
      apiClient<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        barcode: string;
        stockCount: number;
        unitCost: number;
        sellingPrice: number;
      }>;
    }) =>
      apiClient<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
