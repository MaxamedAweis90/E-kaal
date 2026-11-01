import { Types } from "mongoose";
import { Merchant, Subscription, BillingTier } from "../models";
import { ActivateSubscriptionInput } from "../validations";
import { roundMoney } from "../utils/math";

const TIER_CONFIG: Record<BillingTier, { days: number; price: number }> = {
  "1_MONTH": { days: 30, price: 2.99 },
  "6_MONTHS": { days: 180, price: 14.99 },
  "12_MONTHS": { days: 365, price: 29.99 },
};

export class SubscriptionService {
  static async activateSubscription(
    merchantId: Types.ObjectId,
    data: ActivateSubscriptionInput
  ) {
    const config = TIER_CONFIG[data.tier];
    if (!config) {
      throw { statusCode: 400, code: "INVALID_TIER", message: "Invalid subscription tier" };
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw { statusCode: 404, code: "MERCHANT_NOT_FOUND", message: "Merchant not found" };
    }

    // If current subscription is still active, extend from current expiry date, otherwise extend from now
    const now = new Date();
    const currentExpiry = merchant.subscriptionExpiresAt ? new Date(merchant.subscriptionExpiresAt) : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;

    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + config.days);

    merchant.activeSubscriptionTier = data.tier;
    merchant.subscriptionExpiresAt = newExpiryDate;
    await merchant.save();

    const subscription = await Subscription.create({
      merchantId,
      tier: data.tier,
      amount: roundMoney(config.price),
      paymentMethod: "EVC_PLUS",
      phone: data.phone,
      status: "ACTIVE",
      expiresAt: newExpiryDate,
    });

    return {
      subscription: {
        ...subscription.toObject(),
        amount: roundMoney(subscription.amount),
      },
      merchant: {
        shopName: merchant.shopName,
        phone: merchant.phone,
        activeSubscriptionTier: merchant.activeSubscriptionTier,
        subscriptionExpiresAt: merchant.subscriptionExpiresAt,
      },
    };
  }

  static getPlans() {
    return [
      {
        tier: "1_MONTH",
        name: "1 Month Plan",
        price: 2.99,
        durationDays: 30,
        monthlyEquivalent: 2.99,
        badge: "Save 13%",
      },
      {
        tier: "6_MONTHS",
        name: "6 Months Plan",
        price: 14.99,
        durationDays: 180,
        monthlyEquivalent: 2.5,
        badge: "Save 17%",
      },
      {
        tier: "12_MONTHS",
        name: "12 Months Plan",
        price: 29.99,
        durationDays: 365,
        monthlyEquivalent: 2.5,
        badge: "Best Value",
      },
    ];
  }
}

