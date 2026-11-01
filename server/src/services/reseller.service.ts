import { Types } from "mongoose";
import { ResaleTransaction, IResaleTransaction, ResaleProvider } from "../models";
import { ResellerTransactionInput } from "../validations";
import { roundMoney } from "../utils/math";

export const RESELLER_COMMISSION_RATES: Record<ResaleProvider, number> = {
  HORMUUD: 0.17,
  SOMTEL: 0.17,
  TELESOM: 0.17,
};

export class ResellerService {
  static getProviders() {
    return [
      {
        id: "HORMUUD",
        name: "Hormuud Telecom",
        commissionRate: 0.17,
        ratePercentage: "17%",
        services: ["EVC Plus Airtime", "Internet Data Bundles"],
      },
      {
        id: "SOMTEL",
        name: "Somtel",
        commissionRate: 0.17,
        ratePercentage: "17%",
        services: ["e-Dahab Airtime", "Data Bundles"],
      },
      {
        id: "TELESOM",
        name: "Telesom",
        commissionRate: 0.17,
        ratePercentage: "17%",
        services: ["Zaad Airtime", "Data Bundles"],
      },
    ];
  }

  static async executeTransaction(
    merchantId: Types.ObjectId,
    data: ResellerTransactionInput
  ): Promise<IResaleTransaction> {
    const provider: ResaleProvider = data.provider || "HORMUUD";
    const amount = roundMoney(data.amount);
    const rate = RESELLER_COMMISSION_RATES[provider] || 0.17;
    const earningProfit =
      data.earningProfit !== undefined ? roundMoney(data.earningProfit) : roundMoney(amount * rate);
    const netAmount = roundMoney(amount + earningProfit);

    const tx = new ResaleTransaction({
      merchantId,
      provider,
      recipientPhone: data.recipientPhone,
      amount,
      earningProfit,
      netAmount,
      status: "COMPLETED",
    });

    return await tx.save();
  }

  static async listHistory(merchantId: Types.ObjectId) {
    const history = await ResaleTransaction.find({ merchantId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return history.map((h) => ({
      ...h,
      amount: roundMoney(h.amount),
      earningProfit: roundMoney(h.earningProfit),
      netAmount: roundMoney(h.netAmount),
    }));
  }
}
