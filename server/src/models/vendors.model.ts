import { Schema, model, Document, Types } from "mongoose";

export type VendorStatus = "ACTIVE" | "SETTLED";

export interface IVendor extends Document {
  merchantId: Types.ObjectId;
  name: string;
  phone: string;
  totalOwed: number;
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    totalOwed: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SETTLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ merchantId: 1, name: 1 });
vendorSchema.index({ merchantId: 1, totalOwed: -1 });

export const Vendor = model<IVendor>("Vendor", vendorSchema);

