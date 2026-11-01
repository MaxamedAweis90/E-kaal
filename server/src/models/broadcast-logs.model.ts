import { Schema, model, Document, Types } from "mongoose";

export interface IBroadcastLog extends Document {
  merchantId: Types.ObjectId;
  message: string;
  recipientCount: number;
  recipientIds: Types.ObjectId[];
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const broadcastLogSchema = new Schema<IBroadcastLog>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 125,
      trim: true,
    },
    recipientCount: {
      type: Number,
      required: true,
      min: 1,
    },
    recipientIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

broadcastLogSchema.index({ merchantId: 1, sentAt: -1 });

export const BroadcastLog = model<IBroadcastLog>("BroadcastLog", broadcastLogSchema);

