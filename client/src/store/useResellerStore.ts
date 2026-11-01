import { create } from "zustand";

export type ResellerProviderId = "HORMUUD" | "SOMTEL" | "TELESOM";

interface ResellerState {
  provider: ResellerProviderId;
  amount: number;
  recipientPhone: string;
  commissionRate: number;
  earningProfit: number;
  netAmount: number;
  setProvider: (provider: ResellerProviderId) => void;
  setAmount: (amount: number) => void;
  setRecipientPhone: (phone: string) => void;
  resetForm: () => void;
}

export const useResellerStore = create<ResellerState>((set, get) => ({
  provider: "HORMUUD",
  amount: 100,
  recipientPhone: "",
  commissionRate: 0.17,
  earningProfit: 17.0,
  netAmount: 117.0,

  setProvider: (provider) => {
    const rate = 0.17;
    const amount = get().amount;
    const profit = Number((amount * rate).toFixed(2));
    const net = Number((amount + profit).toFixed(2));
    set({ provider, commissionRate: rate, earningProfit: profit, netAmount: net });
  },

  setAmount: (amount) => {
    const rate = get().commissionRate;
    const profit = Number((amount * rate).toFixed(2));
    const net = Number((amount + profit).toFixed(2));
    set({ amount, earningProfit: profit, netAmount: net });
  },

  setRecipientPhone: (recipientPhone) => set({ recipientPhone }),

  resetForm: () =>
    set({
      amount: 100,
      recipientPhone: "",
      earningProfit: 17.0,
      netAmount: 117.0,
    }),
}));
