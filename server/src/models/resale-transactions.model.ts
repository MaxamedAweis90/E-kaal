import { Schema, model, Document, Types } from "mongoose";

export type ResaleProvider = "HORMUUD" | "SOMTEL" | "TELESOM";
export type ResaleStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface IResaleTransaction extends Document {
  merchantId: Types.ObjectId;
  provider: ResaleProvider;
  recipientPhone: string;
  amount: number;
  earningProfit: number;
  netAmount: number;
  status: ResaleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const resaleTransactionSchema = new Schema<IResaleTransaction>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["HORMUUD", "SOMTEL", "TELESOM"],
      default: "HORMUUD",
    },
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    earningProfit: {
      type: Number,
      required: true,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED"],
      default: "COMPLETED",
    },
  },
  {
    timestamps: true,
  }
);

resaleTransactionSchema.index({ merchantId: 1, createdAt: -1 });

export const ResaleTransaction = model<IResaleTransaction>(
  "ResaleTransaction",
  resaleTransactionSchema
);

