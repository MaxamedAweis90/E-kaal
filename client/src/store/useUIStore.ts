import { create } from "zustand";

export type ModalType =
  | "ADD_CUSTOMER"
  | "ADD_VENDOR"
  | "ADD_PRODUCT"
  | "LOG_TRANSACTION"
  | "STORE_PROFILE_SETTINGS"
  | "BRANDING_LOGO_UPLOAD"
  | "SUBSCRIPTION_BILLING"
  | "MERCHANT_SUPPORT"
  | (string & {});

interface UIState {
  activeModal: ModalType | null;
  isCalculatorOpen: boolean;
  globalSearchQuery: string;
  isAvatarDropdownOpen: boolean;

  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleCalculator: () => void;
  setCalculatorOpen: (isOpen: boolean) => void;
  setGlobalSearchQuery: (query: string) => void;
  clearGlobalSearchQuery: () => void;
  toggleAvatarDropdown: () => void;
  setAvatarDropdownOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  isCalculatorOpen: false,
  globalSearchQuery: "",
  isAvatarDropdownOpen: false,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  toggleCalculator: () => set((state) => ({ isCalculatorOpen: !state.isCalculatorOpen })),
  setCalculatorOpen: (isOpen) => set({ isCalculatorOpen: isOpen }),
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
  clearGlobalSearchQuery: () => set({ globalSearchQuery: "" }),
  toggleAvatarDropdown: () =>
    set((state) => ({ isAvatarDropdownOpen: !state.isAvatarDropdownOpen })),
  setAvatarDropdownOpen: (isOpen) => set({ isAvatarDropdownOpen: isOpen }),
}));

