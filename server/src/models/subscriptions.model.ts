import { Schema, model, Document, Types } from "mongoose";

export type BillingTier = "1_MONTH" | "6_MONTHS" | "12_MONTHS";
export type BillingPaymentMethod = "EVC_PLUS";
export type BillingSubscriptionStatus = "ACTIVE" | "EXPIRED" | "PENDING";

export interface ISubscription extends Document {
  merchantId: Types.ObjectId;
  tier: BillingTier;
  amount: number;
  paymentMethod: BillingPaymentMethod;
  phone: string;
  status: BillingSubscriptionStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["1_MONTH", "6_MONTHS", "12_MONTHS"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["EVC_PLUS"],
      default: "EVC_PLUS",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "PENDING"],
      default: "ACTIVE",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ merchantId: 1, expiresAt: -1 });

export const Subscription = model<ISubscription>("Subscription", subscriptionSchema);

