import { Schema, model, Document, Types } from "mongoose";

export type CustomerStatus =
  | "ACTIVE"
  | "DELINQUENT"
  | "SETTLED"
  | "OWING"
  | "CLEARED"
  | "OVER_LIMIT";

export interface ICustomer extends Document {
  merchantId: Types.ObjectId;
  name: string;
  phone: string;
  totalDebt: number;
  paid: number;
  balance: number;
  creditLimit: number;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
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
    totalDebt: {
      type: Number,
      default: 0,
      min: 0,
    },
    paid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DELINQUENT", "SETTLED", "OWING", "CLEARED", "OVER_LIMIT"],
      default: "CLEARED",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure balance = Number((totalDebt - paid).toFixed(2))
customerSchema.pre("save", function (next) {
  const debt = this.totalDebt ?? 0;
  const paid = this.paid ?? 0;
  this.balance = Number((debt - paid).toFixed(2));
  next();
});

customerSchema.index({ merchantId: 1, phone: 1 }, { unique: true });
customerSchema.index({ merchantId: 1, balance: -1 });
customerSchema.index({ merchantId: 1, status: 1 });

export const Customer = model<ICustomer>("Customer", customerSchema);
