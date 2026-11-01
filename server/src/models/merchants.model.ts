import { Schema, model, Document } from "mongoose";

export type SubscriptionTier = "1_MONTH" | "6_MONTHS" | "12_MONTHS" | "FREE_TRIAL";

export interface ISupportChannels {
  whatsapp?: string;
  call?: string;
  facebook?: string;
  tiktok?: string;
}

export interface IMerchant extends Document {
  shopName: string;
  email?: string;
  phone: string;
  activeSubscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: Date;
  supportChannels?: ISupportChannels;
  createdAt: Date;
  updatedAt: Date;
}

const merchantSchema = new Schema<IMerchant>(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    activeSubscriptionTier: {
      type: String,
      enum: ["1_MONTH", "6_MONTHS", "12_MONTHS", "FREE_TRIAL"],
      default: "FREE_TRIAL",
    },
    subscriptionExpiresAt: {
      type: Date,
      required: true,
    },
    supportChannels: {
      whatsapp: { type: String, trim: true },
      call: { type: String, trim: true },
      facebook: { type: String, trim: true },
      tiktok: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

merchantSchema.index({ phone: 1, email: 1 });

export const Merchant = model<IMerchant>("Merchant", merchantSchema);

