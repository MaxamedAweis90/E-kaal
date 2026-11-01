import { Schema, model, Document, Types } from "mongoose";

export type PartyType = "CUSTOMER" | "VENDOR";
export type TransactionType = "DEBT_ADD" | "DEBT_PAYMENT" | "VENDOR_PAYMENT";

export interface ITransaction extends Document {
  merchantId: Types.ObjectId;
  partyType: PartyType;
  partyId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  note: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    partyType: {
      type: String,
      enum: ["CUSTOMER", "VENDOR"],
      required: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["DEBT_ADD", "DEBT_PAYMENT", "VENDOR_PAYMENT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ merchantId: 1, partyId: 1, date: -1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);

