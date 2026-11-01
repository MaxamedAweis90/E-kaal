import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { DashboardOverview } from "../types";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => apiClient<DashboardOverview>("/dashboard/overview"),
    refetchInterval: 60000,
  });
}
