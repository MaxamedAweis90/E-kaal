import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { useAppStore } from "./store/useAppStore";
import { DashboardView } from "./views/DashboardView";
import { DeymahaView } from "./views/DeymahaView";
import { ResellerView } from "./views/ResellerView";
import { ProductsView } from "./views/ProductsView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

const MainContent: React.FC = () => {
  const { activeTab } = useAppStore();

  switch (activeTab) {
    case "dashboard":
      return <DashboardView />;
    case "deymaha":
      return <DeymahaView />;
    case "reseller":
      return <ResellerView />;
    case "products":
      return <ProductsView />;
    default:
      return null; // Renders AppShell default empty slot
  }
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <MainContent />
      </AppShell>
    </QueryClientProvider>
  );
}

export default App;
