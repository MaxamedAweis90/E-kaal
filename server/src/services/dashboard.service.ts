import { Types } from "mongoose";
import { Customer, Vendor, Merchant } from "../models";
import { roundMoney } from "../utils/math";

export class DashboardService {
  static async getOverview(merchantId: Types.ObjectId) {
    // 1. Aggregate Customer Receivables (Total Debt, Total Paid, Net Balance, Count)
    const customerAgg = await Customer.aggregate([
      { $match: { merchantId } },
      {
        $group: {
          _id: null,
          totalDebt: { $sum: "$totalDebt" },
          totalPaid: { $sum: "$paid" },
          netBalance: { $sum: "$balance" },
          activeCustomerCount: { $sum: 1 },
        },
      },
    ]);

    const customerSummary = customerAgg[0] || {
      totalDebt: 0,
      totalPaid: 0,
      netBalance: 0,
      activeCustomerCount: 0,
    };

    const totalDebt = roundMoney(customerSummary.totalDebt);
    const totalPaid = roundMoney(customerSummary.totalPaid);
    const netBalance = roundMoney(customerSummary.netBalance);
    const activeCustomerCount = customerSummary.activeCustomerCount;

    // 2. Aggregate Vendor Payables (Total Owed & Count)
    const vendorAgg = await Vendor.aggregate([
      { $match: { merchantId } },
      {
        $group: {
          _id: null,
          vendorPayablesTotal: { $sum: "$totalOwed" },
          activeVendorCount: { $sum: 1 },
        },
      },
    ]);

    const vendorSummary = vendorAgg[0] || {
      vendorPayablesTotal: 0,
      activeVendorCount: 0,
    };

    const vendorPayablesTotal = roundMoney(vendorSummary.vendorPayablesTotal);
    const activeVendorCount = vendorSummary.activeVendorCount;

    // 3. Top Delinquent / Debtor Accounts
    const topDebtors = await Customer.find({ merchantId, balance: { $gt: 0 } })
      .sort({ balance: -1 })
      .limit(10)
      .select("name phone totalDebt paid balance creditLimit status")
      .lean();

    const formattedTopDebtors = topDebtors.map((debtor) => {
      const shareOfTotal = totalDebt > 0 ? roundMoney((debtor.balance / totalDebt) * 100) : 0;
      return {
        ...debtor,
        totalDebt: roundMoney(debtor.totalDebt),
        paid: roundMoney(debtor.paid),
        balance: roundMoney(debtor.balance),
        creditLimit: roundMoney(debtor.creditLimit),
        shareOfTotal,
      };
    });

    // 4. Merchant Subscription Status & Metadata
    const merchant = await Merchant.findById(merchantId).lean();
    let subscription = null;
    if (merchant) {
      const now = new Date().getTime();
      const expiry = new Date(merchant.subscriptionExpiresAt).getTime();
      const diffDays = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));

      subscription = {
        tier: merchant.activeSubscriptionTier,
        expiresAt: merchant.subscriptionExpiresAt,
        remainingDays: diffDays,
        isExpired: expiry < now,
      };
    }

    return {
      receivables: {
        totalDebt,
        totalPaid,
        netBalance,
        activeCustomerCount,
        paidPercentage: totalDebt > 0 ? roundMoney((totalPaid / totalDebt) * 100) : 0,
        balancePercentage: totalDebt > 0 ? roundMoney((netBalance / totalDebt) * 100) : 0,
      },
      payables: {
        totalOwed: vendorPayablesTotal,
        activeVendorCount,
      },
      topDebtors: formattedTopDebtors,
      subscription,
    };
  }
}

