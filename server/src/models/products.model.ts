import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  merchantId: Types.ObjectId;
  name: string;
  barcode?: string;
  stockCount: number;
  unitCost: number;
  sellingPrice: number;
  margin: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
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
    barcode: {
      type: String,
      trim: true,
      index: true,
    },
    stockCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    margin: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate & pre-save hook to compute margin = Number((sellingPrice - unitCost).toFixed(2))
function calculateMargin(this: IProduct) {
  if (this.sellingPrice !== undefined && this.unitCost !== undefined) {
    this.margin = Number((this.sellingPrice - this.unitCost).toFixed(2));
  }
}

productSchema.pre("validate", function (next) {
  calculateMargin.call(this);
  next();
});

productSchema.pre("save", function (next) {
  calculateMargin.call(this);
  next();
});

productSchema.index({ merchantId: 1, barcode: 1 });
productSchema.index({ merchantId: 1, name: 1 });

export const Product = model<IProduct>("Product", productSchema);

