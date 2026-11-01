import { create } from "zustand";

export type NavTab =
  | "dashboard"
  | "deymaha"
  | "vendor"
  | "products"
  | "reseller"
  | "dir-ogeysiis"
  | "reports"
  | "settings";

interface AppState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCalculatorOpen: boolean;
  toggleCalculator: () => void;
  setCalculatorOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isCalculatorOpen: false,
  toggleCalculator: () => set((state) => ({ isCalculatorOpen: !state.isCalculatorOpen })),
  setCalculatorOpen: (open) => set({ isCalculatorOpen: open }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
}));
