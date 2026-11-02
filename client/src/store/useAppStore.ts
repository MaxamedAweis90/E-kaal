import { create } from "zustand";

export type NavigationModule =
  | "dashboard"
  | "deymaha"
  | "vendor"
  | "products"
  | "reseller"
  | "dir-ogeysiis"
  | "reports"
  | "settings";

interface AppState {
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: "dashboard",
  setActiveModule: (module) => set({ activeModule: module, isMobileMenuOpen: false }),
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));
