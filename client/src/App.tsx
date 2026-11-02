import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout";
import { DashboardView } from "./components/features/DashboardView";
import { useAppStore } from "./store/useAppStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
  },
});

const MainContent: React.FC = () => {
  const activeModule = useAppStore((state) => state.activeModule);

  switch (activeModule) {
    case "dashboard":
      return <DashboardView />;
    default:
      return (
        <div className="flex-1 min-h-[450px] rounded-[16px] bg-[#141b13] border border-[#233026] flex items-center justify-center">
          <span className="text-[17px] text-[#6c7c72]">
            No content loaded — screen display slot
          </span>
        </div>
      );
  }
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <MainContent />
      </AppLayout>
    </QueryClientProvider>
  );
};

export default App;
